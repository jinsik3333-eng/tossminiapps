#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from copy_latest_generated_image import DEFAULT_GENERATED_DIR
from copy_latest_generated_image import main as copy_latest_main


APP_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ASSET_ROOT = APP_ROOT / "_source-assets/fighters"
CHROMA_HELPER = Path(
    "/Users/jinsik/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py"
)


def latest_generated(generated_dir: Path) -> Path:
    candidates = list(generated_dir.glob("*.png"))
    if not candidates:
        raise SystemExit(f"No generated PNGs found in {generated_dir}")
    return max(candidates, key=lambda path: path.stat().st_mtime)


def run(args: list[str]) -> None:
    subprocess.run(args, check=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kind", choices=["quiz", "runner"], required=True)
    parser.add_argument("--id", required=True)
    parser.add_argument("--generated-dir", type=Path, default=DEFAULT_GENERATED_DIR)
    args = parser.parse_args()

    source = (
        SOURCE_ASSET_ROOT
        / "canonical/source"
        / f"{args.id}-{args.kind}-generated-green.png"
    )
    alpha = (
        SOURCE_ASSET_ROOT
        / "canonical/alpha"
        / f"{args.id}-{args.kind}-alpha.png"
    )

    source.parent.mkdir(parents=True, exist_ok=True)
    alpha.parent.mkdir(parents=True, exist_ok=True)
    newest = latest_generated(args.generated_dir)
    source.write_bytes(newest.read_bytes())
    print(f"copied {newest} -> {source}")

    run(
        [
            sys.executable,
            str(CHROMA_HELPER),
            "--input",
            str(source),
            "--out",
            str(alpha),
            "--auto-key",
            "border",
            "--soft-matte",
            "--transparent-threshold",
            "12",
            "--opaque-threshold",
            "220",
            "--despill",
        ]
    )
    run(
        [
            sys.executable,
            str(APP_ROOT / "scripts/standardize_fighter_asset.py"),
            "--kind",
            args.kind,
            "--id",
            args.id,
            "--input",
            str(alpha),
        ]
    )


if __name__ == "__main__":
    main()
