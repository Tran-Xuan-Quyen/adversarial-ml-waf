import json
import re
import urllib.parse
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data_path = root.parent / 'ml-waf-aws-test' / 'data' / 'bypass_learned.jsonl'

rows = []
if data_path.exists():
    with data_path.open('r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))

print(f'Loaded {len(rows)} payloads from {data_path}')

# Heuristics for payloads that often break server-side decoding / regex / SQL handling
risky = []
for idx, row in enumerate(rows, 1):
    payload = row.get('payload', '')
    if not isinstance(payload, str):
        continue
    issues = []
    if '%' in payload:
        issues.append('percent')
    if "'" in payload or '"' in payload:
        issues.append('quote')
    if re.search(r'\\x[0-9a-fA-F]{2}', payload):
        issues.append('hex_escape')
    if re.search(r'\b(OR|AND|SELECT|UNION|--|/\*|\*/|NULL)\b', payload, re.I):
        issues.append('sql_keywords')
    if re.search(r'(%[0-9A-Fa-f]{0,1}|%[0-9A-Fa-f]{2})', payload):
        issues.append('percent_token')
    if issues:
        risky.append((idx, payload, issues))

print(f'Payloads matching heuristics: {len(risky)}')
for item in risky[:50]:
    print(item[0], '|', item[2], '|', item[1])

# Try decoding each payload once to see if it throws
failed_decode = []
for idx, payload, _ in risky:
    try:
        urllib.parse.unquote(payload)
    except Exception as exc:
        failed_decode.append((idx, str(exc), payload))

print(f'Failed decode count: {len(failed_decode)}')
for item in failed_decode[:20]:
    print(item)
