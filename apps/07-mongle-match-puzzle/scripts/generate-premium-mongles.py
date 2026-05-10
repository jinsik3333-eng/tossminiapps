#!/usr/bin/env python3
"""Generate remaining premium Mongle assets from docs/mongle-premium-prompt-manifest.json.

Uses Hermes openai-codex image plugin directly (ChatGPT/Codex OAuth), saves optimized WebP
under public/mongles/premium, and is resumable: existing .webp files are skipped.
"""
from __future__ import annotations

import base64
import importlib.util
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from PIL import Image, ImageOps

ROOT = Path("/Users/jinsik/Desktop/Workspace/01_project_tossminiapps")
APP = ROOT / "apps" / "mongle-match-puzzle"
MANIFEST_PATH = APP / "docs" / "mongle-premium-prompt-manifest.json"
OUT_DIR = APP / "public" / "mongles" / "premium"
GEN_LOG = OUT_DIR / "generation-log.jsonl"
SAMPLE_MANIFEST = OUT_DIR / "sample-12-manifest.json"
HERMES = Path("/Users/jinsik/.hermes/hermes-agent")
PLUGIN = HERMES / "plugins" / "image_gen" / "openai-codex" / "__init__.py"
SIZE = os.environ.get("MONGLE_IMAGE_SIZE", "1024x1024")
QUALITY = os.environ.get("MONGLE_IMAGE_QUALITY", "high")
TARGET_SIZE = 768
MAX_ATTEMPTS = 3
SHARD_TOTAL = int(os.environ.get("MONGLE_SHARD_TOTAL", "1"))
SHARD_INDEX = int(os.environ.get("MONGLE_SHARD_INDEX", "0"))


def load_plugin():
    sys.path.insert(0, str(HERMES))
    spec = importlib.util.spec_from_file_location("openai_codex_image_plugin", PLUGIN)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load plugin: {PLUGIN}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def collect_image_b64(client: Any, prompt: str, mod: Any) -> Optional[str]:
    # Reimplement plugin stream call so this script can save to project path directly.
    return mod._collect_image_b64(client, prompt=prompt, size=SIZE, quality=QUALITY)


def harden_prompt(item: dict[str, Any]) -> str:
    prompt = item["prompt"]
    rarity = item.get("rarity", "")
    return f"""{prompt}

STRICT PRODUCTION ASSET REQUIREMENTS:
- Centered single character only, same premium collectible IP family as Toss-style 3D hero assets.
- Clean solid very light warm pastel studio background. NOT transparent preview, NOT checkerboard, NOT grid, NOT label sheet.
- No readable text anywhere. No letters, no numbers, no compass letters, no UI labels, no brand marks, no logos, no watermark.
- No currency symbols, no coins, no banknotes, no prize/coupon/money imagery.
- Keep prop large enough to read at mobile size, but exactly one prop.
- Premium soft 3D toy / clay / plush material; not flat vector, not sticker clipart, not low-quality procedural.
- Rarity visual level should be {rarity}; common calm, rare subtle sparkle, epic cinematic halo, unique aurora hero glow.
""".strip()


def save_webp_from_b64(image_b64: str, dest: Path) -> None:
    raw = base64.b64decode(image_b64)
    tmp_png = dest.with_suffix(".tmp.png")
    tmp_png.write_bytes(raw)
    im = Image.open(tmp_png).convert("RGB")
    im = ImageOps.contain(im, (TARGET_SIZE, TARGET_SIZE), method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (TARGET_SIZE, TARGET_SIZE), (250, 248, 244))
    canvas.paste(im, ((TARGET_SIZE - im.width) // 2, (TARGET_SIZE - im.height) // 2))
    canvas.save(dest, "WEBP", quality=88, method=6)
    tmp_png.unlink(missing_ok=True)


def log_event(event: dict[str, Any]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    event = {"ts": datetime.now().isoformat(timespec="seconds"), **event}
    with GEN_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")


def build_contact_sheet() -> Path:
    from PIL import ImageDraw

    files = sorted(OUT_DIR.glob("[0-9][0-9][0-9]-*.webp"))
    cols = 10
    cell = 132
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * cell), (246, 247, 249))
    for idx, fp in enumerate(files):
        im = Image.open(fp).convert("RGB")
        thumb = ImageOps.contain(im, (118, 118), method=Image.Resampling.LANCZOS)
        x = (idx % cols) * cell + (cell - thumb.width) // 2
        y = (idx // cols) * cell + (cell - thumb.height) // 2
        sheet.paste(thumb, (x, y))
    path = OUT_DIR / "_all-100-contact-sheet-clean.jpg"
    sheet.save(path, "JPEG", quality=88, optimize=True)
    return path


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    items = manifest.get("items", manifest if isinstance(manifest, list) else [])
    mod = load_plugin()
    client = mod._build_codex_client()
    if not client:
        raise RuntimeError("openai-codex OAuth client unavailable")

    existing = {p.name for p in OUT_DIR.glob("*.webp")}
    todo = []
    for item in items:
        item_index = int(item.get("index", 0))
        if SHARD_TOTAL > 1 and item_index % SHARD_TOTAL != SHARD_INDEX:
            continue
        asset = item["assetPath"].split("/mongles/premium/", 1)[-1]
        if asset not in existing:
            todo.append((item, asset))

    print(json.dumps({"manifest_items": len(items), "existing_webp": len(existing), "todo": len(todo), "shard_index": SHARD_INDEX, "shard_total": SHARD_TOTAL, "quality": QUALITY}, ensure_ascii=False), flush=True)
    log_event({"event": "start", "manifest_items": len(items), "existing_webp": len(existing), "todo": len(todo), "shard_index": SHARD_INDEX, "shard_total": SHARD_TOTAL, "quality": QUALITY})

    ok = 0
    failed: list[dict[str, Any]] = []
    for idx, (item, asset) in enumerate(todo, 1):
        dest = OUT_DIR / asset
        prompt = harden_prompt(item)
        print(f"[{idx}/{len(todo)}] generate {asset} {item.get('rarity')} {item.get('id')}", flush=True)
        last_err = None
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                image_b64 = collect_image_b64(client, prompt, mod)
                if not image_b64:
                    raise RuntimeError("no image returned")
                save_webp_from_b64(image_b64, dest)
                ok += 1
                log_event({"event": "generated", "asset": asset, "id": item.get("id"), "rarity": item.get("rarity"), "attempt": attempt})
                break
            except Exception as exc:  # noqa: BLE001
                last_err = str(exc)[:500]
                log_event({"event": "retry", "asset": asset, "attempt": attempt, "error": last_err})
                print(f"  attempt {attempt} failed: {last_err}", flush=True)
                time.sleep(5 * attempt)
        else:
            failed.append({"asset": asset, "id": item.get("id"), "error": last_err})
            print(f"  FAILED {asset}: {last_err}", flush=True)

    sheet = build_contact_sheet()
    final_count = len(list(OUT_DIR.glob("[0-9][0-9][0-9]-*.webp")))
    summary = {"event": "done", "generated_now": ok, "failed": failed, "final_count": final_count, "contact_sheet": str(sheet)}
    log_event(summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2), flush=True)
    return 0 if not failed and final_count == len(items) else 2


if __name__ == "__main__":
    raise SystemExit(main())
