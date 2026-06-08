#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


TARGETS = {
    "quiz": {
        "canvas": (512, 512),
        "max_side": 300,
        "bottom": 406,
        "output_dir": "public/assets/stock-fighter/fighters/quiz-character",
    },
    "runner": {
        "canvas": (256, 256),
        "max_side": 197,
        "bottom": 234,
        "output_dir": "public/assets/stock-fighter/fighters/runner",
    },
}


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("input has no visible pixels")
    return bbox


def standardize(input_path: Path, output_path: Path, kind: str) -> None:
    spec = TARGETS[kind]
    image = Image.open(input_path).convert("RGBA")
    bbox = alpha_bbox(image)
    cropped = image.crop(bbox)

    max_side = spec["max_side"]
    scale = min(max_side / cropped.width, max_side / cropped.height)
    new_size = (
        max(1, round(cropped.width * scale)),
        max(1, round(cropped.height * scale)),
    )
    resized = cropped.resize(new_size, Image.Resampling.LANCZOS)

    canvas_w, canvas_h = spec["canvas"]
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    x = round((canvas_w - resized.width) / 2)
    y = round(spec["bottom"] - resized.height)
    if y < 0:
        y = 0
    canvas.alpha_composite(resized, (x, y))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kind", choices=TARGETS.keys(), required=True)
    parser.add_argument("--id", required=True)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--app-root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()

    output_dir = args.app_root / TARGETS[args.kind]["output_dir"]
    standardize(args.input, output_dir / f"{args.id}.png", args.kind)


if __name__ == "__main__":
    main()
