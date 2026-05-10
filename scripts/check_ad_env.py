#!/usr/bin/env python3
"""Validate local Apps in Toss monetization env values without printing secret IDs."""
from __future__ import annotations

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
APP_GLOB = "0[1-6]-*"
REQUIRED_KEYS = (
    "VITE_TOSS_BANNER_AD_GROUP_ID",
    "VITE_TOSS_REWARDED_AD_GROUP_ID",
    "VITE_TOSS_CONTACTS_VIRAL_MODULE_ID",
)


def read_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def main() -> int:
    apps = sorted((ROOT / "apps").glob(APP_GLOB))
    if not apps:
        print("No apps/0[1-6]-* directories found.", file=sys.stderr)
        return 2

    failed = False
    for app in apps:
        env_path = app / ".env"
        values = read_env(env_path)
        print(f"## {app.relative_to(ROOT)}")
        if not env_path.exists():
            print("  .env: missing")
            failed = True
            continue
        for key in REQUIRED_KEYS:
            value = values.get(key, "")
            status = "set" if value else "empty"
            print(f"  {key}: {status}")
            if not value:
                failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
