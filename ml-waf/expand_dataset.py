import json
import random
import sys
from pathlib import Path

# Setup paths to import evasion module
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

try:
    from evasion.transformers import all_transforms
except ImportError:
    # Fallback in case of path structure changes
    all_transforms = None

DATA_DIR = ROOT / "data"
BASE_SQLI_PATH = DATA_DIR / "payloads" / "base_sqli.json"
ATTACK_OUT_PATH = DATA_DIR / "attack.json"
BENIGN_OUT_PATH = DATA_DIR / "benign.json"


def generate_attacks(count=5500) -> list[dict]:
    # 1. Load base SQLi payloads
    if not BASE_SQLI_PATH.exists():
        print(f"Error: {BASE_SQLI_PATH} does not exist.", file=sys.stderr)
        return []

    with open(BASE_SQLI_PATH, "r", encoding="utf-8") as f:
        base_payloads = json.load(f)

    # 2. Mutate recursively to generate at least `count` unique payloads
    unique_payloads = set(base_payloads)
    queue = list(base_payloads)
    
    # Predefined simple mutations in case import failed
    def fallback_transforms(p: str) -> list[str]:
        return [
            p.upper(),
            p.lower(),
            p.replace(" ", "/**/"),
            p.replace(" ", "+"),
            p.replace("'", "''"),
            p + "%00",
            p.replace("OR", "or").replace("AND", "and")
        ]

    # Generate mutations
    idx = 0
    while len(unique_payloads) < count and idx < len(queue):
        payload = queue[idx]
        idx += 1

        # Apply transforms
        mutations = []
        if all_transforms is not None:
            try:
                mutations = [t[0] for t in all_transforms(payload) if t[0]]
            except Exception:
                mutations = fallback_transforms(payload)
        else:
            mutations = fallback_transforms(payload)

        for m in mutations:
            if m not in unique_payloads:
                unique_payloads.add(m)
                queue.append(m)
                if len(unique_payloads) >= count:
                    break

    # Convert to request objects
    attacks = []
    for payload in sorted(list(unique_payloads))[:count]:
        attacks.append({
            "method": "GET",
            "path": "/api/users",
            "query": f"id={payload}",
            "headers": {},
            "body": ""
        })
    return attacks


def generate_benigns(count=5500) -> list[dict]:
    random.seed(42)  # For deterministic generation

    # Vocabulary for constructing sentences
    templates = [
        "How do I configure my {noun}?",
        "What is the {noun} of the {noun}?",
        "Can you show me the {adjective} {noun}?",
        "Explain how to {verb} {noun} in {noun}.",
        "I want to {verb} a {adjective} {noun}.",
        "Where is the {adjective} {noun} stored?",
        "Tell me a story about a {adjective} {noun} and {noun}.",
        "How can I {verb} {adjective} {noun} on my server?",
        "Please get the details of {noun} with id {number}.",
        "Search for {adjective} {noun} in {noun} settings.",
        "Hello chatbot, help me {verb} this {noun}.",
        "Is it safe to {verb} {noun} over {noun}?",
        "List all {adjective} {noun} for project {number}.",
        "What is the difference between {noun} and {noun}?",
        "Write a python script to {verb} {noun}.",
        "Update the {adjective} {noun} on database {noun}."
    ]

    nouns = [
        "account", "user", "project", "database", "domain", "bot", "config", "prompt", 
        "file", "upload", "token", "role", "access", "log", "security", "firewall", 
        "server", "client", "connection", "request", "response", "setting", "status", 
        "profile", "email", "password", "session", "error", "message", "dashboard", 
        "analytics", "network", "host", "port", "query", "syntax", "value", "key", 
        "avatar", "phone", "gender", "birth", "image", "upload", "personality", 
        "greeting", "title", "color", "logo", "path", "size", "migration", "revert"
    ]

    verbs = [
        "configure", "delete", "insert", "update", "create", "select", "fetch", "get", 
        "post", "put", "patch", "remove", "add", "reset", "generate", "validate", 
        "check", "verify", "authenticate", "authorize", "login", "logout", "register", 
        "search", "find", "list", "show", "load", "save", "write", "read", "run"
    ]

    adjectives = [
        "valid", "invalid", "safe", "secure", "insecure", "active", "inactive", "default", 
        "custom", "global", "local", "temporary", "permanent", "public", "private", 
        "internal", "external", "new", "old", "recent", "deprecated", "stable", "latest", 
        "positive", "negative", "empty", "null", "clean", "dirty", "raw", "encoded"
    ]

    benigns = []
    seen_queries = set()

    # We need to construct unique query strings
    while len(benigns) < count:
        t = random.choice(templates)
        n1 = random.choice(nouns)
        n2 = random.choice(nouns)
        while n1 == n2:
            n2 = random.choice(nouns)
        v = random.choice(verbs)
        adj = random.choice(adjectives)
        num = random.randint(1, 10000)

        sentence = t.format(noun=n1, verb=v, adjective=adj, number=num)
        # Sometimes format requires more arguments
        if "{noun}" in sentence:
            sentence = sentence.replace("{noun}", n2)

        # Avoid duplicates
        if sentence in seen_queries:
            continue
        seen_queries.add(sentence)

        # Build query params
        path = random.choice(["/api/users", "/projects", "/search", "/chat", "/comments", "/settings"])
        query_param = random.choice(["id", "q", "projectName", "search", "email", "query"])
        
        benigns.append({
            "method": "GET",
            "path": path,
            "query": f"{query_param}={sentence}",
            "headers": {},
            "body": ""
        })

    return benigns


def main():
    print("Generating large attack dataset...")
    attacks = generate_attacks(5500)
    print(f"Generated {len(attacks)} unique attack requests.")

    print("Generating large benign dataset...")
    benigns = generate_benigns(5500)
    print(f"Generated {len(benigns)} unique benign requests.")

    # Write to files
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(ATTACK_OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(attacks, f, ensure_ascii=False, indent=2)
    print(f"Saved attack dataset to {ATTACK_OUT_PATH}")

    with open(BENIGN_OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(benigns, f, ensure_ascii=False, indent=2)
    print(f"Saved benign dataset to {BENIGN_OUT_PATH}")


if __name__ == "__main__":
    main()
