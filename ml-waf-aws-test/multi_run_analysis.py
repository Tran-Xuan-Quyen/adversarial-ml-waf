#!/usr/bin/env python3
"""
multi_run_analysis.py
---------------------
Aggregates AWS WAF probe results across multiple independent runs (identified by run_id).

Statistical Methodology:
  - For small sample sizes (N < 30 runs), uses Student's t-distribution critical values
    (df = N - 1, alpha = 0.05) rather than the standard normal z = 1.96.
  - Reports both Pooled (sample-weighted) rate across all requests and
    Across-run Mean +/- Std Dev with 95% Confidence Interval.
  - Warns when sample size N < 3 is too small for meaningful statistical inference.
  - Generates LaTeX table formatted for the research paper.

Usage:
    python multi_run_analysis.py [--jsonl data/aws_probe_results.jsonl]
"""

import argparse
from collections import defaultdict
import json
import math
from pathlib import Path
import sys

DATA_DIR = Path(__file__).resolve().parent / "data"
DEFAULT_JSONL = DATA_DIR / "aws_probe_results.jsonl"
OUTPUT_REPORT = DATA_DIR / "multi_run_ci_report.txt"

# Two-tailed 95% Student's t-distribution critical values (alpha = 0.05)
T_CRITICAL_95 = {
    1: 12.706,  # N = 2
    2: 4.303,   # N = 3
    3: 3.182,   # N = 4
    4: 2.776,   # N = 5
    5: 2.571,   # N = 6
    6: 2.447,   # N = 7
    7: 2.365,   # N = 8
    8: 2.306,   # N = 9
    9: 2.262,   # N = 10
    10: 2.228,
    11: 2.201,
    12: 2.179,
    13: 2.160,
    14: 2.145,
    15: 2.131,
    16: 2.120,
    17: 2.110,
    18: 2.101,
    19: 2.093,  # N = 20
    24: 2.064,  # N = 25
    29: 2.045,  # N = 30
}


def get_t_critical_95(df: int) -> float:
    """Retrieve two-tailed 95% Student's t critical value."""
    if df < 1:
        return 0.0
    try:
        from scipy.stats import t
        return float(t.ppf(0.975, df=df))
    except ImportError:
        pass
    if df in T_CRITICAL_95:
        return T_CRITICAL_95[df]
    if df > 30:
        return 1.960
    # Nearest neighbor interpolation for df between 10 and 30
    keys = sorted(T_CRITICAL_95.keys())
    for k in keys:
        if df <= k:
            return T_CRITICAL_95[k]
    return 1.960


def compute_mean_std_ci(values: list[float]) -> dict:
    n = len(values)
    if n == 0:
        return {
            "n": 0,
            "mean": 0.0,
            "std": 0.0,
            "se": 0.0,
            "df": 0,
            "t_crit": 0.0,
            "ci_lower": None,
            "ci_upper": None,
            "note": "Empty sample.",
        }
    mean = sum(values) / n
    if n == 1:
        return {
            "n": 1,
            "mean": mean,
            "std": 0.0,
            "se": 0.0,
            "df": 0,
            "t_crit": 0.0,
            "ci_lower": None,
            "ci_upper": None,
            "note": "Single observation; CI requires N >= 2.",
        }

    variance = sum((x - mean) ** 2 for x in values) / (n - 1)
    std = math.sqrt(variance)
    se = std / math.sqrt(n)
    df = n - 1
    t_crit = get_t_critical_95(df)
    margin = t_crit * se
    ci_lower = max(0.0, mean - margin)
    ci_upper = min(1.0, mean + margin)

    return {
        "n": n,
        "mean": mean,
        "std": std,
        "se": se,
        "df": df,
        "t_crit": t_crit,
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
    }


def main():
    ap = argparse.ArgumentParser(description="Multi-run aggregation & Student's t 95% CI calculation")
    ap.add_argument("--jsonl", type=Path, default=DEFAULT_JSONL)
    ns = ap.parse_args()

    if not ns.jsonl.exists():
        print(f"File not found: {ns.jsonl}", file=sys.stderr)
        return 1

    runs = defaultdict(lambda: {
        "tested": 0,
        "bypass_200": 0,
        "bypass_500": 0,
        "bypass_app_err": 0,
        "bypass_total": 0,
        "blocked": 0,
        "other": 0,
        "first_ts": None,
        "last_ts": None,
    })

    total_records = 0
    with open(ns.jsonl, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                total_records += 1
                run_id = rec.get("run_id") or "legacy_unlabeled_run"
                r = runs[run_id]
                r["tested"] += 1

                res = rec.get("result")
                det = rec.get("result_detail")

                if res == "bypass":
                    r["bypass_total"] += 1
                    if det == "ok_200":
                        r["bypass_200"] += 1
                    elif det == "http_500":
                        r["bypass_500"] += 1
                    else:
                        r["bypass_app_err"] += 1
                elif res == "blocked":
                    r["blocked"] += 1
                else:
                    r["other"] += 1

                ts = rec.get("ts")
                if ts:
                    if r["first_ts"] is None or ts < r["first_ts"]:
                        r["first_ts"] = ts
                    if r["last_ts"] is None or ts > r["last_ts"]:
                        r["last_ts"] = ts
            except json.JSONDecodeError:
                pass

    num_runs = len(runs)
    print(f"Loaded {total_records:,} records across {num_runs} independent run(s).")
    if num_runs == 0:
        print(f"[NOTE] No valid probe records found in {ns.jsonl}. The dataset is currently empty.")
        return 0

    lines = [
        "=" * 85,
        "  MULTI-RUN AGGREGATION & CONFIDENCE INTERVAL REPORT",
        "=" * 85,
        f"Data Source: {ns.jsonl.name} ({total_records:,} total records across {num_runs} run(s))",
        "-" * 85,
        f"{'Run ID':<32} {'Tested':>8} {'Bypass 200':>14} {'Bypass 500':>12} {'Bypass Total':>14} {'Blocked':>10}",
        "-" * 85,
    ]

    r_200_rates = []
    r_500_rates = []
    r_tot_rates = []
    r_blk_rates = []

    sum_tested = sum(r["tested"] for r in runs.values())
    sum_b200 = sum(r["bypass_200"] for r in runs.values())
    sum_b500 = sum(r["bypass_500"] for r in runs.values())
    sum_btot = sum(r["bypass_total"] for r in runs.values())
    sum_blk = sum(r["blocked"] for r in runs.values())

    for r_id, r in sorted(runs.items()):
        t = r["tested"]
        bp_200_rate = r["bypass_200"] / t if t else 0.0
        bp_500_rate = r["bypass_500"] / t if t else 0.0
        bp_tot_rate = r["bypass_total"] / t if t else 0.0
        blk_rate = r["blocked"] / t if t else 0.0

        r_200_rates.append(bp_200_rate)
        r_500_rates.append(bp_500_rate)
        r_tot_rates.append(bp_tot_rate)
        r_blk_rates.append(blk_rate)

        lines.append(
            f"{r_id[:32]:<32} {t:>8} {r['bypass_200']:>6} ({bp_200_rate:>5.1%}) {r['bypass_500']:>6} ({bp_500_rate:>5.1%}) {r['bypass_total']:>6} ({bp_tot_rate:>5.1%}) {r['blocked']:>5} ({blk_rate:>5.1%})"
        )

    # Compute Pooled (Sample-weighted) rates
    pooled_200 = sum_b200 / sum_tested if sum_tested else 0.0
    pooled_500 = sum_b500 / sum_tested if sum_tested else 0.0
    pooled_tot = sum_btot / sum_tested if sum_tested else 0.0
    pooled_blk = sum_blk / sum_tested if sum_tested else 0.0

    lines.extend([
        "-" * 85,
        f"{'POOLED TOTAL (Weighted)':<32} {sum_tested:>8} {sum_b200:>6} ({pooled_200:>5.1%}) {sum_b500:>6} ({pooled_500:>5.1%}) {sum_btot:>6} ({pooled_tot:>5.1%}) {sum_blk:>5} ({pooled_blk:>5.1%})",
        "=" * 85,
    ])

    # Compute Student's t stats
    stats_200 = compute_mean_std_ci(r_200_rates)
    stats_500 = compute_mean_std_ci(r_500_rates)
    stats_tot = compute_mean_std_ci(r_tot_rates)
    stats_blk = compute_mean_std_ci(r_blk_rates)

    lines.append("\nACROSS-SESSION INFERENCE (Unweighted Run Mean +/- Std Dev):")

    if num_runs == 1:
        lines.extend([
            "  [NOTE] N = 1 run available: Single point observation.",
            "  Confidence intervals cannot be computed (requires N >= 2 independent runs).",
            f"  * Confirmed Exploit (200 OK)  : {stats_200['mean']*100:.2f}%",
            f"  * Database Layer Reach (500)  : {stats_500['mean']*100:.2f}%",
            f"  * Total Evasion (Passed WAF)  : {stats_tot['mean']*100:.2f}%",
            f"  * Blocked by WAF / Edge       : {stats_blk['mean']*100:.2f}%",
        ])
    else:
        df = stats_200["df"]
        t_crit = stats_200["t_crit"]
        if num_runs < 3:
            lines.append(
                f"  [WARNING] N = {num_runs} (df={df}) is very small for statistical inference.\n"
                f"  Student's t critical value is t={t_crit:.3f}, giving a wide CI.\n"
                f"  Recommend running at least 3-5 independent sessions for official paper reporting."
            )

        ci_str_200 = f"[{stats_200['ci_lower']*100:.2f}% - {stats_200['ci_upper']*100:.2f}%]"
        ci_str_500 = f"[{stats_500['ci_lower']*100:.2f}% - {stats_500['ci_upper']*100:.2f}%]"
        ci_str_tot = f"[{stats_tot['ci_lower']*100:.2f}% - {stats_tot['ci_upper']*100:.2f}%]"
        ci_str_blk = f"[{stats_blk['ci_lower']*100:.2f}% - {stats_blk['ci_upper']*100:.2f}%]"

        lines.extend([
            f"  * Confirmed Exploit (200 OK)  : {stats_200['mean']*100:.2f}% +/- {stats_200['std']*100:.2f}%  (95% CI: {ci_str_200}, df={df}, t={t_crit:.3f})",
            f"  * Database Layer Reach (500)  : {stats_500['mean']*100:.2f}% +/- {stats_500['std']*100:.2f}%  (95% CI: {ci_str_500})",
            f"  * Total Evasion (Passed WAF)  : {stats_tot['mean']*100:.2f}% +/- {stats_tot['std']*100:.2f}%  (95% CI: {ci_str_tot})",
            f"  * Blocked by WAF / Edge       : {stats_blk['mean']*100:.2f}% +/- {stats_blk['std']*100:.2f}%  (95% CI: {ci_str_blk})",
        ])

    lines.extend([
        "=" * 85,
        "",
        "% LaTeX table snippet for Research Paper:",
        r"\begin{table}[h]",
        r"  \centering",
        r"  \caption{Empirical WAF Evasion Rates Across Independent Runs ($N=" + str(num_runs) + r"$ Runs, Total Requests: " + f"{sum_tested:,}" + r")}",
        r"  \label{tab:waf_evasion_ci}",
        r"  \begin{tabular}{lcccc}",
        r"    \toprule",
        r"    \textbf{Metric} & \textbf{Pooled (\%)} & \textbf{Run Mean (\%)} & \textbf{Std Dev (\%)} & \textbf{95\% CI (Student's $t$)} \\",
        r"    \midrule",
    ])

    if num_runs >= 2:
        ci_200_tex = f"[{stats_200['ci_lower']*100:.1f}\\% -- {stats_200['ci_upper']*100:.1f}\\%]"
        ci_500_tex = f"[{stats_500['ci_lower']*100:.1f}\\% -- {stats_500['ci_upper']*100:.1f}\\%]"
        ci_tot_tex = f"[{stats_tot['ci_lower']*100:.1f}\\% -- {stats_tot['ci_upper']*100:.1f}\\%]"
        ci_blk_tex = f"[{stats_blk['ci_lower']*100:.1f}\\% -- {stats_blk['ci_upper']*100:.1f}\\%]"
        lines.extend([
            f"    Confirmed Exploit (200 OK)  & {pooled_200*100:.1f}\\% & {stats_200['mean']*100:.1f}\\% & {stats_200['std']*100:.1f}\\% & {ci_200_tex} \\\\",
            f"    Database Layer Reach (500)  & {pooled_500*100:.1f}\\% & {stats_500['mean']*100:.1f}\\% & {stats_500['std']*100:.1f}\\% & {ci_500_tex} \\\\",
            f"    Total Evasion (WAF Bypass)  & {pooled_tot*100:.1f}\\% & {stats_tot['mean']*100:.1f}\\% & {stats_tot['std']*100:.1f}\\% & {ci_tot_tex} \\\\",
            f"    Blocked by WAF / Edge       & {pooled_blk*100:.1f}\\% & {stats_blk['mean']*100:.1f}\\% & {stats_blk['std']*100:.1f}\\% & {ci_blk_tex} \\\\",
        ])
    else:
        lines.extend([
            f"    Confirmed Exploit (200 OK)  & {pooled_200*100:.1f}\\% & {stats_200['mean']*100:.1f}\\% & --- & --- \\\\",
            f"    Database Layer Reach (500)  & {pooled_500*100:.1f}\\% & {stats_500['mean']*100:.1f}\\% & --- & --- \\\\",
            f"    Total Evasion (WAF Bypass)  & {pooled_tot*100:.1f}\\% & {stats_tot['mean']*100:.1f}\\% & --- & --- \\\\",
            f"    Blocked by WAF / Edge       & {pooled_blk*100:.1f}\\% & {stats_blk['mean']*100:.1f}\\% & --- & --- \\\\",
        ])

    lines.extend([
        r"    \bottomrule",
        r"  \end{tabular}\\[0.4em]",
        r"  \footnotesize",
        r"  \emph{Note.} Pooled rate is request-weighted. 95\% CI calculated via Student's $t$-distribution with $df=N-1$.",
        r"\end{table}",
        "",
    ])

    report_text = "\n".join(lines)
    print(report_text)
    OUTPUT_REPORT.write_text(report_text, encoding="utf-8")
    print(f"[OK] Multi-run report saved to {OUTPUT_REPORT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
