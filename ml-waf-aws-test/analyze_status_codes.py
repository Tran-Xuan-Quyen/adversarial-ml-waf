#!/usr/bin/env python3
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
"""
analyze_status_codes.py
-----------------------
Phân tích tất cả HTTP status codes theo từng loại transform/mutation
từ các tập data trong ml-waf-aws-test/data/.

Output: data/status_code_analysis_report.txt + data/status_code_analysis.json

Cấu trúc bảng tương tự ảnh LaTeX:
  Transform | 200 | 403 | 404 | 500 | other | Total | Bypass% | Block%
"""

import json
import os
import re
from collections import defaultdict
from pathlib import Path
from datetime import datetime

# ─── Cấu hình ─────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent / "data"

DATA_FILES = {
    "blocked_learned.jsonl":  "blocked",
    "bypass_learned.jsonl":   "bypass",
    "other_learned.jsonl":    "other",
    "aws_probe_results.jsonl": "aws_probe",
}

OUTPUT_REPORT = BASE_DIR / "status_code_analysis_report.txt"
OUTPUT_JSON   = BASE_DIR / "status_code_analysis.json"

# ─── Mapping transform keyword → nhóm gọn ────────────────────────────────────
TRANSFORM_GROUPS = {
    # URL encode variants
    "url_encode_plus":          "url_encode",
    "url_encode_full":          "url_encode",
    "url_encode_non_alnum":     "url_encode",
    "url_encode_quotes":        "url_encode",
    "adv_url_encode":           "url_encode",
    "adv_url_encode_full":      "url_encode",
    "adv_url_encode_quotes":    "url_encode",
    "adv_url_encode_non_alnum": "url_encode",
    "url_encode":               "url_encode",

    # Double / Triple URL encode
    "double_url_encode":        "double_url_encode",
    "adv_double_url_encode":    "double_url_encode",
    "triple_url_encode":        "triple_url_encode",
    "adv_triple_url_encode":    "triple_url_encode",

    # Null byte
    "null_byte":                "null_byte",
    "adv_null_suffix":          "null_byte",
    "null_suffix":              "null_byte",

    # Case mix
    "case_mix":                 "case_mix",
    "adv_case_mix":             "case_mix",
    "case_upper":               "case_mix",
    "adv_case_upper_kw":        "case_mix",

    # Comment inline (MySQL style)
    "comment_inline":           "comment_inline",
    "comment_mysql":            "comment_inline",
    "adv_comment_mysql":        "comment_inline",

    # Comment slash-star
    "comment_slash":            "comment_slash",
    "adv_comment_slash":        "comment_slash",
    "comment_slash_star":       "comment_slash",

    # Tab / newline / whitespace
    "tab_space":                "tab_newline",
    "adv_tab_space":            "tab_newline",
    "tab_newline":              "tab_newline",
    "tab":                      "tab_newline",
    "newline":                  "tab_newline",
    "vtab":                     "tab_newline",
    "plus_space":               "tab_newline",

    # Hex encode / hex prefix
    "hex_chars":                "hex",
    "adv_hex_chars":            "hex",
    "hex_prefix":               "hex",
    "adv_hex_prefix":           "hex",
    "hex_encode":               "hex",
    "account_hex_prefix":       "hex",

    # Unicode escape
    "unicode_esc":              "unicode",
    "adv_unicode_esc":          "unicode",

    # Double quote escape
    "double_quote_esc":         "other_transform",
    "adv_double_quote_esc":     "other_transform",

    # Plus for space
    "plus_for_space":           "tab_newline",
    "adv_plus_space":           "tab_newline",

    # Các variant raw (original, pre_*, b*_*)
    "original":                 "original",
}

# Thứ tự hiển thị trong bảng
GROUP_ORDER = [
    "url_encode",
    "double_url_encode",
    "triple_url_encode",
    "null_byte",
    "case_mix",
    "comment_inline",
    "comment_slash",
    "tab_newline",
    "hex",
    "unicode",
    "other_transform",
    "original",
    "__unknown__",
]

# Status code quan tâm
TRACKED_CODES = [200, 400, 403, 404, 500, 502, 503]

# ─── Hàm mapping tên variant → nhóm transform ────────────────────────────────
def map_to_group(name: str) -> str:
    """Dò qua TRANSFORM_GROUPS, khớp substring ưu tiên dài nhất."""
    if not name:
        return "__unknown__"

    name_lower = name.lower()

    # Exact match trước
    if name_lower in TRANSFORM_GROUPS:
        return TRANSFORM_GROUPS[name_lower]

    # Substring match - ưu tiên key dài nhất
    best_key = ""
    best_group = "__unknown__"
    for key, group in TRANSFORM_GROUPS.items():
        if key in name_lower and len(key) > len(best_key):
            best_key = key
            best_group = group

    return best_group


# ─── Đọc JSONL ────────────────────────────────────────────────────────────────
def load_jsonl(filepath: Path) -> list:
    records = []
    if not filepath.exists():
        print(f"  [SKIP] Không tìm thấy: {filepath.name}")
        return records
    with open(filepath, encoding="utf-8", errors="replace") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"  [WARN] {filepath.name}:{lineno} parse error: {e}")
    return records


# ─── Phân tích chính ──────────────────────────────────────────────────────────
def analyze():
    print("=" * 60)
    print("  Phan tich HTTP Status Code theo Transform Type")
    print("=" * 60)

    # stats[group][status_code] = count
    stats = defaultdict(lambda: defaultdict(int))
    total_records = 0
    file_stats = {}

    for filename, source_tag in DATA_FILES.items():
        filepath = BASE_DIR / filename
        records = load_jsonl(filepath)
        file_total = len(records)
        file_stats[filename] = {"total": file_total, "source": source_tag}
        print(f"  Doc {filename}: {file_total:,} records")

        for rec in records:
            total_records += 1

            # Lấy tên variant/transform
            name = (
                rec.get("name")
                or rec.get("variant")
                or rec.get("transform")
                or ""
            )

            # Lấy status code
            status_code = (
                rec.get("status_code")
                or rec.get("http_status")
                or 0
            )

            # Nếu status_code là string như "blocked" -> dùng field khác
            if isinstance(status_code, str):
                status_code = rec.get("http_status") or rec.get("status_code") or 0

            try:
                status_code = int(status_code)
            except (TypeError, ValueError):
                status_code = 0

            group = map_to_group(name)
            # Bỏ qua records không có HTTP status (status_code=0)
            if status_code != 0:
                stats[group][status_code] += 1

    print(f"\n  Tong: {total_records:,} records tu {len(DATA_FILES)} files\n")
    return stats, total_records, file_stats


# ─── Lấy tất cả status codes xuất hiện ──────────────────────────────────────
def get_all_codes(stats) -> list:
    all_codes = set()
    for group_data in stats.values():
        all_codes.update(group_data.keys())
    # Bỏ status 0 - là records không có HTTP response (bypass_learned không ghi status)
    all_codes.discard(0)
    tracked = [c for c in TRACKED_CODES if c in all_codes]
    rest = sorted(c for c in all_codes if c not in TRACKED_CODES)
    return tracked + rest


# ─── Format bảng text ─────────────────────────────────────────────────────────
def format_table(stats, all_codes):
    col_width = 10
    transform_width = 22

    def sep_line():
        return (
            "+" + "-" * (transform_width + 2)
            + "+" + (("+" .join(["-" * (col_width + 2)] * (len(all_codes) + 3))))
            + "+"
        )

    def header_line():
        h = "| " + "Transform".ljust(transform_width) + " |"
        for c in all_codes:
            label = str(c) if c != 0 else "unk"
            h += " " + label.center(col_width) + " |"
        h += " " + "Total".center(col_width) + " |"
        h += " " + "Bypass%".center(col_width) + " |"
        h += " " + "Block%".center(col_width) + " |"
        return h

    lines = [sep_line(), header_line(), sep_line()]

    group_totals = {}
    for group in GROUP_ORDER:
        if group not in stats:
            continue
        data = stats[group]
        row_total = sum(data.values())
        if row_total == 0:
            continue

        bypass_count = data.get(200, 0)
        block_count  = data.get(403, 0)
        bypass_pct   = (bypass_count / row_total * 100) if row_total else 0
        block_pct    = (block_count  / row_total * 100) if row_total else 0

        group_totals[group] = {
            "codes": dict(data),
            "total": row_total,
            "bypass_200": bypass_count,
            "block_403": block_count,
            "bypass_pct": bypass_pct,
            "block_pct": block_pct,
        }

        row = "| " + group.ljust(transform_width) + " |"
        for c in all_codes:
            row += " " + str(data.get(c, 0)).center(col_width) + " |"
        row += " " + str(row_total).center(col_width) + " |"
        row += " " + f"{bypass_pct:.1f}%".center(col_width) + " |"
        row += " " + f"{block_pct:.1f}%".center(col_width) + " |"
        lines.append(row)

    lines.append(sep_line())

    # Grand total
    grand = defaultdict(int)
    for data in stats.values():
        for code, cnt in data.items():
            grand[code] += cnt
    grand_total = sum(grand.values())
    grand_bypass_pct = (grand.get(200, 0) / grand_total * 100) if grand_total else 0
    grand_block_pct  = (grand.get(403, 0) / grand_total * 100) if grand_total else 0

    total_row = "| " + "GRAND TOTAL".ljust(transform_width) + " |"
    for c in all_codes:
        total_row += " " + str(grand.get(c, 0)).center(col_width) + " |"
    total_row += " " + str(grand_total).center(col_width) + " |"
    total_row += " " + f"{grand_bypass_pct:.1f}%".center(col_width) + " |"
    total_row += " " + f"{grand_block_pct:.1f}%".center(col_width) + " |"
    lines.append(total_row)
    lines.append(sep_line())

    return "\n".join(lines), group_totals, grand, grand_total


# ─── Format LaTeX bảng ────────────────────────────────────────────────────────
def format_latex(stats, all_codes, group_totals, grand, grand_total) -> str:
    lines = []
    lines.append(r"% ─── Bảng phân tích Status Code theo Transform Type ───────────────")
    lines.append(r"\begin{table}[h]")
    lines.append(r"  \centering")
    lines.append(r"  \caption{HTTP Status Code Distribution by Transform Type}")
    lines.append(r"  \label{tab:status_by_transform}")
    col_spec = "l" + "r" * len(all_codes) + "rrr"
    lines.append(r"  \begin{tabular}{" + col_spec + r"}")
    lines.append(r"    \toprule")
    code_headers = " & ".join(
        r"\textbf{" + (str(c) if c != 0 else "unk") + "}"
        for c in all_codes
    )
    lines.append(
        r"    \textbf{Transform} & "
        + code_headers
        + r" & \textbf{Total} & \textbf{Bypass\%} & \textbf{Block\%} \\"
    )
    lines.append(r"    \midrule")

    for group in GROUP_ORDER:
        if group not in group_totals:
            continue
        d = group_totals[group]
        code_vals = " & ".join(
            "{:,}".format(d["codes"].get(c, 0)) for c in all_codes
        )
        label = group.replace("_", r"\_")
        row = (
            f"    {label} & "
            + code_vals
            + f" & {d['total']:,}"
            + f" & {d['bypass_pct']:.1f}\\%"
            + f" & {d['block_pct']:.1f}\\% \\\\"
        )
        lines.append(row)

    lines.append(r"    \midrule")
    code_vals = " & ".join("{:,}".format(grand.get(c, 0)) for c in all_codes)
    grand_bp = (grand.get(200, 0) / grand_total * 100) if grand_total else 0
    grand_blk = (grand.get(403, 0) / grand_total * 100) if grand_total else 0
    lines.append(
        r"    \textbf{TOTAL} & "
        + code_vals
        + f" & \\textbf{{{grand_total:,}}}"
        + f" & {grand_bp:.1f}\\%"
        + f" & {grand_blk:.1f}\\% \\\\"
    )
    lines.append(r"    \bottomrule")
    lines.append(r"  \end{tabular}\\[0.6em]")
    lines.append(r"  \footnotesize")
    lines.append(r"  \emph{Note.} Bypass\% = HTTP 200 / Total. Block\% = HTTP 403 / Total.")
    lines.append(r"\end{table}")
    return "\n".join(lines)


# ─── Breakdown chi tiết per-status ───────────────────────────────────────────
def format_per_status_breakdown(stats, all_codes) -> str:
    lines = []
    lines.append("=" * 60)
    lines.append("  CHI TIET THEO TUNG STATUS CODE")
    lines.append("=" * 60)

    for code in all_codes:
        breakdown = {}
        for group in GROUP_ORDER:
            cnt = stats.get(group, {}).get(code, 0)
            if cnt > 0:
                breakdown[group] = cnt

        if not breakdown:
            continue

        total_for_code = sum(breakdown.values())
        lines.append(f"\n-- Status {code} --  (Total: {total_for_code:,})")
        lines.append(f"  {'Transform':<25} {'Count':>8}  {'%':>7}")
        lines.append(f"  {'-'*25} {'-'*8}  {'-'*7}")

        for group, cnt in sorted(breakdown.items(), key=lambda x: -x[1]):
            pct = cnt / total_for_code * 100 if total_for_code else 0
            lines.append(f"  {group:<25} {cnt:>8,}  {pct:>6.1f}%")

    return "\n".join(lines)


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    stats, total_records, file_stats = analyze()

    if total_records == 0:
        print("[ERROR] Khong doc duoc record nao. Kiem tra duong dan data.")
        return

    all_codes = get_all_codes(stats)
    table_str, group_totals, grand, grand_total = format_table(stats, all_codes)
    breakdown_str = format_per_status_breakdown(stats, all_codes)
    latex_str = format_latex(stats, all_codes, group_totals, grand, grand_total)

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    report_parts = [
        "=" * 60,
        "  STATUS CODE ANALYSIS REPORT",
        f"  Generated: {now}",
        "=" * 60,
        "",
        "FILES ANALYZED:",
    ]
    for fn, d in file_stats.items():
        if d["total"] > 0:
            report_parts.append(f"  * {fn}: {d['total']:,} records  [{d['source']}]")
    report_parts.append(f"\n  TOTAL RECORDS: {total_records:,}")
    report_parts.append("")
    report_parts.append("=" * 60)
    report_parts.append("  BANG TONG HOP (STATUS CODE x TRANSFORM)")
    report_parts.append("=" * 60)
    report_parts.append("")
    report_parts.append(table_str)
    report_parts.append("")
    report_parts.append(breakdown_str)
    report_parts.append("")
    report_parts.append("=" * 60)
    report_parts.append("  LATEX TABLE (copy vao bao cao)")
    report_parts.append("=" * 60)
    report_parts.append("")
    report_parts.append(latex_str)
    report_parts.append("")

    report_text = "\n".join(report_parts)

    with open(OUTPUT_REPORT, "w", encoding="utf-8") as f:
        f.write(report_text)

    json_out = {
        "generated_at": now,
        "total_records": total_records,
        "files": file_stats,
        "all_status_codes": all_codes,
        "by_transform": {
            group: {
                "counts_by_status": {str(c): cnt for c, cnt in d["codes"].items()},
                "total": d["total"],
                "bypass_200": d["bypass_200"],
                "block_403": d["block_403"],
                "bypass_pct": round(d["bypass_pct"], 2),
                "block_pct": round(d["block_pct"], 2),
            }
            for group, d in group_totals.items()
        },
        "grand_total": {
            "total": grand_total,
            "by_status": {str(c): cnt for c, cnt in grand.items()},
        },
    }

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(json_out, f, indent=2, ensure_ascii=False)

    print(report_text)
    print(f"\n[OK] Da ghi bao cao -> {OUTPUT_REPORT}")
    print(f"[OK] Da ghi JSON    -> {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
