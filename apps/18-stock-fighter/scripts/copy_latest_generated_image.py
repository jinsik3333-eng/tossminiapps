#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shutil
from pathlib import Path


DEFAULT_GENERATED_DIR = Path(
    "/Users/jinsik/.codex/generated_images/019e9260-a40b-72d3-98ec-53b844e3c261"
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--generated-dir", type=Path, default=DEFAULT_GENERATED_DIR)
    args = parser.parse_args()

    candidates = list(args.generated_dir.glob("*.png"))
    if not candidates:
        raise SystemExit(f"No generated PNGs found in {args.generated_dir}")

    latest = max(candidates, key=lambda path: path.stat().st_mtime)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(latest, args.out)
    print(latest)


if __name__ == "__main__":
    main()
