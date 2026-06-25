import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


def load_payloads(path: Path):
    payloads = []
    with path.open('r', encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            payload = row.get('payload')
            if isinstance(payload, str) and payload:
                payloads.append(payload)
    return payloads


def main():
    workspace_root = Path(__file__).resolve().parents[2]
    data_file = workspace_root / 'ml-waf-aws-test' / 'data' / 'bypass_learned.jsonl'
    endpoint = os.getenv('TEST_ENDPOINT', 'http://127.0.0.1:3000/projects')
    timeout = int(os.getenv('TEST_TIMEOUT', '5'))
    limit = int(os.getenv('TEST_LIMIT', '0'))

    if not data_file.exists():
        print(f'Data file not found: {data_file}')
        sys.exit(1)

    payloads = load_payloads(data_file)
    unique_payloads = []
    seen = set()
    for payload in payloads:
        if payload not in seen:
            unique_payloads.append(payload)
            seen.add(payload)

    if limit > 0:
        unique_payloads = unique_payloads[:limit]

    print(f'Loaded {len(payloads)} payload rows; testing {len(unique_payloads)} unique payloads against {endpoint}')

    statuses = {}
    failures = []
    for idx, payload in enumerate(unique_payloads, start=1):
        encoded = quote(payload, safe='')
        url = f'{endpoint}?projectName={encoded}'
        req = Request(url, headers={'User-Agent': 'bypass-http-test/1.0'})
        try:
            with urlopen(req, timeout=timeout) as resp:
                status = resp.getcode()
                body = resp.read(200).decode('utf-8', 'ignore')
        except HTTPError as exc:
            status = exc.code
            body = exc.read(200).decode('utf-8', 'ignore')
        except URLError as exc:
            status = 'ERR'
            body = str(exc.reason)
        except Exception as exc:
            status = 'ERR'
            body = str(exc)

        statuses[status] = statuses.get(status, 0) + 1
        if status == 500:
            failures.append((payload, body[:200]))

        if idx % 100 == 0:
            print(f'Processed {idx}/{len(unique_payloads)} requests; current counts: {statuses}')

    print('\nSummary:')
    for status, count in sorted(statuses.items(), key=lambda item: item[0]):
        print(f'  {status}: {count}')
    print(f'\n500 failures: {len(failures)}')
    for payload, body in failures[:20]:
        print('---')
        print(payload)
        print(body)


if __name__ == '__main__':
    main()
