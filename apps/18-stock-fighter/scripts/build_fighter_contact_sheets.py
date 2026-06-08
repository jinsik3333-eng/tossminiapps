#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


APP_ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = APP_ROOT / "public/assets/stock-fighter"
PREVIEW_DIR = ASSET_ROOT / "fighters/canonical/preview"

FIGHTER_IDS = [
    "gold-tariff-king",
    "hoodie-social-king",
    "rocket-weird-ceo",
    "space-delivery-king",
    "meme-coin-dog",
    "ai-leather-boss",
    "memory-chaebol",
    "semiconductor-chair",
    "ev-artisan",
    "search-window-sage",
    "fruit-phone-monk",
    "dividend-aristo-cat",
    "disclosure-ninja",
    "chart-master",
    "orderbook-hunter",
    "upper-limit-fairy",
    "lower-limit-ghost",
    "diversified-shield",
    "loss-cut-swordsman",
]


def draw_label(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str) -> None:
    font = ImageFont.load_default()
    x, y = xy
    draw.text((x + 1, y + 1), text, fill=(0, 0, 0), font=font)
    draw.text((x, y), text, fill=(120, 235, 255), font=font)


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int] | None:
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    return image.getchannel("A").getbbox()


def build_asset_sheet(kind: str, image_dir: Path, cell_size: tuple[int, int], out: Path) -> None:
    cols = 5
    label_h = 34
    rows = (len(FIGHTER_IDS) + cols - 1) // cols
    cell_w, cell_h = cell_size
    sheet = Image.new("RGB", (cols * cell_w, rows * (cell_h + label_h)), "#070912")
    draw = ImageDraw.Draw(sheet)

    for index, fighter_id in enumerate(FIGHTER_IDS):
        src = Image.open(image_dir / f"{fighter_id}.png").convert("RGBA")
        row, col = divmod(index, cols)
        x0 = col * cell_w
        y0 = row * (cell_h + label_h)
        checker = Image.new("RGB", (cell_w, cell_h), "#101521")
        draw_cell = ImageDraw.Draw(checker)
        for y in range(0, cell_h, 16):
            for x in range(0, cell_w, 16):
                if (x // 16 + y // 16) % 2 == 0:
                    draw_cell.rectangle([x, y, x + 15, y + 15], fill="#192033")
        scale = min((cell_w - 24) / src.width, (cell_h - 24) / src.height)
        pasted = src.resize((round(src.width * scale), round(src.height * scale)), Image.Resampling.NEAREST)
        px = x0 + round((cell_w - pasted.width) / 2)
        py = y0 + round((cell_h - pasted.height) / 2)
        sheet.paste(checker, (x0, y0))
        sheet.paste(pasted, (px, py), pasted)
        bbox = alpha_bbox(src)
        bbox_text = "empty" if bbox is None else f"{bbox[2]-bbox[0]}x{bbox[3]-bbox[1]}"
        draw_label(draw, (x0 + 8, y0 + cell_h + 5), f"{index + 1:02d}. {fighter_id}")
        draw_label(draw, (x0 + 8, y0 + cell_h + 18), f"{kind} bbox {bbox_text}")

    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)


def build_quiz_preview_sheet(out: Path) -> None:
    base = Image.open(ASSET_ROOT / "fighters/quiz-bg-base/quiz-frame-hidden-base-v1.png").convert("RGBA")
    cols = 5
    preview_w = 226
    preview_h = round(base.height * preview_w / base.width)
    label_h = 34
    rows = (len(FIGHTER_IDS) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * preview_w, rows * (preview_h + label_h)), "#070912")
    draw = ImageDraw.Draw(sheet)

    for index, fighter_id in enumerate(FIGHTER_IDS):
        frame = base.copy()
        actor = Image.open(ASSET_ROOT / f"fighters/quiz-character/{fighter_id}.png").convert("RGBA")
        actor = actor.resize((1024, 1024), Image.Resampling.NEAREST)
        frame.alpha_composite(actor, (-250, 202))
        frame = frame.resize((preview_w, preview_h), Image.Resampling.LANCZOS)
        row, col = divmod(index, cols)
        x0 = col * preview_w
        y0 = row * (preview_h + label_h)
        sheet.paste(frame.convert("RGB"), (x0, y0))
        draw_label(draw, (x0 + 5, y0 + preview_h + 5), f"{index + 1:02d}. {fighter_id}")

    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)


def main() -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    build_asset_sheet(
        "quiz",
        ASSET_ROOT / "fighters/quiz-character",
        (220, 220),
        PREVIEW_DIR / "quiz-character-contact-v2.png",
    )
    build_asset_sheet(
        "runner",
        ASSET_ROOT / "fighters/runner",
        (180, 180),
        PREVIEW_DIR / "runner-contact-v2.png",
    )
    build_quiz_preview_sheet(PREVIEW_DIR / "quiz-screen-preview-contact-v2.png")


if __name__ == "__main__":
    main()
