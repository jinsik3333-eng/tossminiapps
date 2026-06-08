#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import math
import shutil
import zipfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_ROOT = ROOT / "assets" / "app-store"
FONT_PATH = "/System/Library/Fonts/AppleSDGothicNeo.ttc"


def font(size: int, weight: int = 0) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(FONT_PATH, size=size, index=weight)
    except Exception:
        return ImageFont.truetype(FONT_PATH, size=size)


F_REG = lambda size: font(size, 0)
F_BOLD = lambda size: font(size, 6)


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size: tuple[int, int], start: str, end: str, *, vertical: bool = True) -> Image.Image:
    w, h = size
    if vertical:
        strip = Image.new("RGB", (1, h))
        pixels = strip.load()
        for y in range(h):
            pixels[0, y] = lerp(rgb(start), rgb(end), y / max(1, h - 1))
        return strip.resize(size)
    strip = Image.new("RGB", (w, 1))
    pixels = strip.load()
    for x in range(w):
        pixels[x, 0] = lerp(rgb(start), rgb(end), x / max(1, w - 1))
    return strip.resize(size)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def center_text(
    draw: ImageDraw.ImageDraw,
    y: int,
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: str | tuple[int, int, int],
    width: int,
) -> int:
    tw, th = text_size(draw, text, fnt)
    draw.text(((width - tw) / 2, y), text, font=fnt, fill=fill)
    return y + th


def wrap_chars(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for chunk in text.split("\n"):
        for char in chunk:
            candidate = current + char
            if text_size(draw, candidate, fnt)[0] <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = char
        if current:
            lines.append(current)
            current = ""
    return lines


def rounded(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    radius: int,
    fill,
    outline=None,
    width: int = 1,
) -> None:
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_mongle(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, app: dict, *, dark: bool = False) -> None:
    accent = rgb(app["accent"])
    secondary = rgb(app["secondary"])
    shadow = (0, 0, 0, 34 if not dark else 80)
    draw.ellipse((cx - r - 8, cy + r * 0.58, cx + r + 8, cy + r * 0.9), fill=shadow)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255), outline=accent, width=max(5, r // 14))
    draw.ellipse((cx - r * 0.38, cy - r * 0.14, cx - r * 0.18, cy + r * 0.08), fill=(20, 24, 34))
    draw.ellipse((cx + r * 0.18, cy - r * 0.14, cx + r * 0.38, cy + r * 0.08), fill=(20, 24, 34))
    draw.arc((cx - r * 0.23, cy + r * 0.05, cx + r * 0.23, cy + r * 0.33), 0, 180, fill=(20, 24, 34), width=max(4, r // 18))
    draw.rounded_rectangle(
        (cx - r * 0.92, cy + r * 0.72, cx + r * 0.92, cy + r * 1.02),
        radius=max(16, r // 4),
        fill=secondary,
    )
    badge_r = max(32, r // 2)
    draw.ellipse((cx + r * 0.5, cy - r * 0.95, cx + r * 0.5 + badge_r, cy - r * 0.95 + badge_r), fill=accent)
    mark_f = F_BOLD(max(30, r // 2))
    mark = app["mark"]
    tw, th = text_size(draw, mark, mark_f)
    draw.text((cx + r * 0.5 + (badge_r - tw) / 2, cy - r * 0.95 + (badge_r - th) / 2 - 2), mark, font=mark_f, fill="#FFFFFF")


def draw_game_pattern(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], app: dict) -> None:
    x1, y1, x2, y2 = box
    kind = app["kind"]
    accent = app["accent"]
    secondary = app["secondary"]
    if kind == "match":
        colors = [accent, "#FFD166", "#5DD7FF", secondary]
        cell = (x2 - x1 - 40) // 5
        for row in range(5):
            for col in range(5):
                x = x1 + 20 + col * cell
                y = y1 + 22 + row * cell
                rounded(draw, (x, y, x + cell - 8, y + cell - 8), 16, colors[(row * 2 + col) % len(colors)])
                center_text(draw, y + 12, ["★", "●", "◆", "✦"][(row + col) % 4], F_BOLD(24), "#FFFFFF", x * 2 + cell - 8)
    elif kind == "defense":
        for col in range(3):
            lane_x = x1 + 40 + col * ((x2 - x1 - 80) // 2)
            draw.line((lane_x, y1 + 20, lane_x, y2 - 30), fill="#BED7FF", width=3)
            draw.rounded_rectangle((lane_x - 22, y2 - 58, lane_x + 22, y2 - 18), radius=15, fill="#FFE8B8", outline="#27324D", width=3)
        for idx, (px, py) in enumerate([(0.2, 0.24), (0.72, 0.34), (0.42, 0.5), (0.2, 0.68)]):
            cx = x1 + int((x2 - x1) * px)
            cy = y1 + int((y2 - y1) * py)
            draw.ellipse((cx - 26, cy - 26, cx + 26, cy + 26), fill=accent if idx % 2 else secondary, outline="#27324D", width=3)
    elif kind == "run":
        for col in range(3):
            lane_x = x1 + 40 + col * ((x2 - x1 - 80) // 2)
            draw.line((lane_x, y1 + 20, lane_x, y2 - 20), fill="#E1E8F5", width=3)
        draw_mongle(draw, (x1 + x2) // 2, y2 - 76, 36, app)
        for px, py, color in [(0.18, 0.72, secondary), (0.5, 0.52, "#596174"), (0.72, 0.34, accent), (0.72, 0.66, "#FFD166")]:
            cx = x1 + int((x2 - x1) * px)
            cy = y1 + int((y2 - y1) * py)
            draw.ellipse((cx - 22, cy - 22, cx + 22, cy + 22), fill=color)
    elif kind == "detective":
        marks = ["~", "·", "×", "?"]
        for idx, mark in enumerate(marks):
            col = idx % 2
            row = idx // 2
            card = (x1 + 34 + col * 120, y1 + 38 + row * 120, x1 + 132 + col * 120, y1 + 136 + row * 120)
            rounded(draw, card, 20, "#FFFFFF")
            cx = (card[0] + card[2]) // 2
            cy = card[1] + 40
            draw.ellipse((cx - 24, cy - 24, cx + 24, cy + 24), fill=accent if idx == 2 else "#EEF2FF")
            center_text(draw, cy - 14, mark, F_BOLD(24), "#FFFFFF" if idx == 2 else "#27324D", cx * 2)
            center_text(draw, card[1] + 72, "몽글", F_BOLD(17), "#27324D", cx * 2)
    elif kind == "jump":
        for idx in range(6):
            x = x1 + 42 + idx * 48
            y = y2 - 70 - idx * 12
            rounded(draw, (x, y, x + 38, y + 18), 9, "#FFD166" if idx == 4 else "#D7E2F1")
        rounded(draw, (x1 + 34, y2 - 34, x2 - 34, y2 - 14), 10, "#FFFFFF")
        rounded(draw, ((x1 + x2) // 2 - 36, y2 - 38, (x1 + x2) // 2 + 36, y2 - 10), 6, "#BDEAD7", outline=accent, width=2)
        draw_mongle(draw, x1 + 74, y2 - 75, 27, app)
    elif kind == "maze":
        cell = (x2 - x1 - 34) // 5
        walls = {(0, 3), (1, 0), (1, 1), (1, 3), (3, 1), (3, 2), (3, 3)}
        for row in range(5):
            for col in range(5):
                x = x1 + 17 + col * cell
                y = y1 + 22 + row * cell
                fill = "#CFBDAF" if (row, col) in walls else "#FFFFFF"
                if (row, col) == (0, 0):
                    fill = accent
                if (row, col) == (4, 4):
                    fill = "#FFD6B8"
                rounded(draw, (x, y, x + cell - 6, y + cell - 6), 10, fill)
        draw.ellipse((x1 + 106, y1 + 82, x1 + 128, y1 + 104), fill=secondary)
        draw.ellipse((x1 + 178, y1 + 174, x1 + 200, y1 + 196), fill="#FFD166")


def draw_phone(size: tuple[int, int], app: dict, screen: int) -> Image.Image:
    w, h = size
    phone = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(phone)
    rounded(d, (0, 0, w - 1, h - 1), 44, "#111827")
    rounded(d, (12, 12, w - 13, h - 13), 36, "#F8FAFF")
    d.text((34, 36), app["display"], font=F_BOLD(19), fill="#64748B")
    d.text((w - 140, 36), "2026.05.29", font=F_BOLD(15), fill="#27324D")
    if screen == 1:
        draw_mongle(d, w // 2, 170, 70, app)
        d.text((34, 270), "오늘의 미니게임", font=F_BOLD(22), fill=app["accent"])
        d.text((34, 308), app["display"], font=F_BOLD(34), fill="#111827")
        for i, line in enumerate(wrap_chars(d, app["intro"], F_REG(22), w - 68)[:2]):
            d.text((34, 364 + i * 32), line, font=F_REG(22), fill="#475569")
        rounded(d, (34, 438, w - 34, 524), 22, "#FFFFFF", outline="#E7EAF0", width=2)
        d.text((58, 460), "오늘의 목표", font=F_BOLD(17), fill=app["accent"])
        d.text((58, 486), app["goal"], font=F_BOLD(24), fill="#111827")
        rounded(d, (34, h - 118, w - 34, h - 58), 24, app["accent"])
        center_text(d, h - 99, app["start"], F_BOLD(24), "#FFFFFF", w)
    elif screen == 2:
        for idx, label in enumerate(["TIME", "SCORE", "COMBO"]):
            x = 26 + idx * ((w - 52) // 3)
            rounded(d, (x, 86, x + 96, 144), 16, "#111827")
            d.text((x + 14, 99), label, font=F_BOLD(12), fill="#C7D2FE")
            d.text((x + 14, 118), ["25", "120", "1"][idx], font=F_BOLD(20), fill="#FFFFFF")
        rounded(d, (30, 166, w - 30, 206), 18, "#F1F5F9")
        d.text((50, 176), app["play_note"], font=F_BOLD(19), fill="#334155")
        rounded(d, (30, 230, w - 30, 560), 28, app["soft"])
        draw_game_pattern(d, (42, 248, w - 42, 536), app)
    else:
        d.text((34, 102), app["result"], font=F_BOLD(34), fill="#111827")
        d.text((34, 158), app["score"], font=F_BOLD(56), fill=app["accent"])
        rounded(d, (34, 242, w - 34, 340), 24, "#FFFFFF", outline="#E7EAF0", width=2)
        d.text((58, 268), app["highlight"], font=F_BOLD(24), fill="#111827")
        d.text((58, 306), "기록은 앱 안에 저장돼요", font=F_REG(19), fill="#64748B")
        rounded(d, (34, 374, w - 34, 476), 24, app["soft"])
        d.text((58, 402), app["collectible"], font=F_BOLD(23), fill="#111827")
        d.text((58, 438), "수집 진행 1/18", font=F_REG(19), fill="#475569")
        rounded(d, (34, h - 118, w - 34, h - 58), 24, app["accent"])
        center_text(d, h - 99, "다시 하기", F_BOLD(24), "#FFFFFF", w)
    return phone


def make_logo(app: dict, *, dark: bool) -> Image.Image:
    im = gradient((600, 600), "#121826" if dark else app["accent"], "#263247" if dark else app["secondary"])
    d = ImageDraw.Draw(im.convert("RGBA"))
    canvas = im.convert("RGBA")
    overlay = Image.new("RGBA", (600, 600), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse((36, 34, 564, 560), fill=(255, 255, 255, 36 if not dark else 24))
    od.ellipse((100, 92, 500, 492), fill=(*rgb(app["accent"]), 52))
    canvas.alpha_composite(overlay)
    d = ImageDraw.Draw(canvas)
    draw_mongle(d, 300, 258, 126, app, dark=dark)
    center_text(d, 430, app["display"], F_BOLD(48), "#FFFFFF", 600)
    center_text(d, 494, app["logo_sub"], F_BOLD(24), "#EAF2FF", 600)
    return canvas.convert("RGB")


def make_thumbnail(app: dict) -> Image.Image:
    im = gradient((1932, 828), app["accent"], app["hero"], vertical=False).convert("RGBA")
    d = ImageDraw.Draw(im)
    for i, alpha in enumerate((38, 28, 18)):
        d.ellipse((1080 + i * 120, -260 + i * 80, 2020 - i * 60, 830 - i * 20), fill=(255, 255, 255, alpha))
    d.text((116, 118), app["display"], font=F_BOLD(82), fill="#FFFFFF")
    for i, line in enumerate(app["hero_lines"]):
        d.text((116, 238 + i * 62), line, font=F_BOLD(42), fill="#F4F8FF")
    rounded(d, (116, 450, 656, 528), 36, "#FFFFFF")
    d.text((156, 472), app["start"], font=F_BOLD(31), fill=app["accent"])
    phone1 = draw_phone((390, 690), app, 1)
    phone2 = draw_phone((390, 690), app, 2)
    phone2 = phone2.filter(ImageFilter.UnsharpMask(radius=1, percent=115))
    im.alpha_composite(phone1, (1110, 70))
    im.alpha_composite(phone2, (1410, 92))
    return im.convert("RGB")


def make_landscape(app: dict) -> Image.Image:
    im = gradient((1504, 741), app["hero"], app["accent"], vertical=False).convert("RGBA")
    d = ImageDraw.Draw(im)
    d.text((88, 94), app["display"], font=F_BOLD(66), fill="#FFFFFF")
    for i, line in enumerate(app["hero_lines"]):
        d.text((88, 198 + i * 52), line, font=F_BOLD(35), fill="#F4F8FF")
    rounded(d, (88, 402, 504, 468), 30, "#FFFFFF")
    d.text((124, 420), app["start"], font=F_BOLD(28), fill=app["accent"])
    im.alpha_composite(draw_phone((330, 590), app, 1), (790, 76))
    im.alpha_composite(draw_phone((330, 590), app, 3), (1044, 94))
    return im.convert("RGB")


def make_portrait(app: dict, idx: int) -> Image.Image:
    im = gradient((636, 1048), app["accent"], app["hero"]).convert("RGBA")
    d = ImageDraw.Draw(im)
    title, subtitle, screen = app["screens"][idx - 1]
    center_text(d, 56, title, F_BOLD(48), "#FFFFFF", 636)
    for j, line in enumerate(wrap_chars(d, subtitle, F_BOLD(27), 540)[:2]):
        center_text(d, 126 + j * 36, line, F_BOLD(27), "#EAF2FF", 636)
    im.alpha_composite(draw_phone((410, 700), app, screen), (113, 250))
    rounded(d, (54, 904, 582, 1008), 28, (255, 255, 255, 236))
    for j, line in enumerate(wrap_chars(d, app["captions"][idx - 1], F_REG(24), 470)[:2]):
        center_text(d, 928 + j * 31, line, F_REG(24), "#1E293B", 636)
    return im.convert("RGB")


def make_contact(app: dict, folder: Path) -> Image.Image:
    files = [
        "app-logo-600.png",
        "app-logo-dark-600.png",
        "thumbnail-1932x828.png",
        "screenshot-01-636x1048.png",
        "screenshot-02-636x1048.png",
        "screenshot-03-636x1048.png",
        "screenshot-horizontal-1504x741.png",
    ]
    canvas = Image.new("RGB", (1040, 820), "#F3F6FB")
    d = ImageDraw.Draw(canvas)
    d.text((34, 24), f"{app['display']} 출시 이미지 패키지", font=F_BOLD(32), fill="#111827")
    positions = [
        (34, 82, 180, 180),
        (234, 82, 180, 180),
        (434, 82, 540, 231),
        (34, 336, 170, 280),
        (224, 336, 170, 280),
        (414, 336, 170, 280),
        (624, 336, 360, 177),
    ]
    for name, (x, y, tw, th) in zip(files, positions):
        image = Image.open(folder / name).convert("RGB")
        image.thumbnail((tw, th), Image.Resampling.LANCZOS)
        rounded(d, (x - 8, y - 8, x + tw + 8, y + th + 8), 18, "#FFFFFF")
        canvas.paste(image, (x + (tw - image.width) // 2, y + (th - image.height) // 2))
        d.text((x, y + th + 14), name, font=F_REG(15), fill="#4B5563")
    return canvas


def make_zip(folder: Path, app_name: str) -> Path:
    names = [
        "app-logo-600.png",
        "app-logo-dark-600.png",
        "thumbnail-1932x828.png",
        "screenshot-01-636x1048.png",
        "screenshot-02-636x1048.png",
        "screenshot-03-636x1048.png",
        "screenshot-horizontal-1504x741.png",
        "contact-sheet.png",
    ]
    zip_path = folder / f"{app_name}-appstore-assets.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for name in names:
            bundle.write(folder / name, arcname=name)
    return zip_path


def copy_public(app: dict, folder: Path) -> None:
    public = ROOT / "apps" / app["dir"] / "public"
    screenshots = public / "screenshots"
    screenshots.mkdir(parents=True, exist_ok=True)
    shutil.copy2(folder / "app-logo-600.png", public / "app-icon.png")
    shutil.copy2(folder / "app-logo-600.png", public / "app-logo.png")
    shutil.copy2(folder / "app-logo-dark-600.png", public / "app-logo-dark.png")
    shutil.copy2(folder / "thumbnail-1932x828.png", public / "thumbnail.png")
    for name in [
        "screenshot-01-636x1048.png",
        "screenshot-02-636x1048.png",
        "screenshot-03-636x1048.png",
        "screenshot-horizontal-1504x741.png",
    ]:
        shutil.copy2(folder / name, screenshots / name)


def generate(app: dict) -> None:
    folder = OUT_ROOT / app["app_name"]
    folder.mkdir(parents=True, exist_ok=True)
    make_logo(app, dark=False).save(folder / "app-logo-600.png", optimize=True)
    make_logo(app, dark=True).save(folder / "app-logo-dark-600.png", optimize=True)
    make_thumbnail(app).save(folder / "thumbnail-1932x828.png", optimize=True)
    for idx in (1, 2, 3):
        make_portrait(app, idx).save(folder / f"screenshot-0{idx}-636x1048.png", optimize=True)
    make_landscape(app).save(folder / "screenshot-horizontal-1504x741.png", optimize=True)
    make_contact(app, folder).save(folder / "contact-sheet.png", optimize=True)
    zip_path = make_zip(folder, app["app_name"])
    copy_public(app, folder)
    print(f"{app['app_name']}: {zip_path.relative_to(ROOT)}")


APPS = [
    {
        "dir": "07-mongle-match-puzzle",
        "app_name": "mongle-match-puzzle",
        "display": "몽글 매치 퍼즐",
        "logo_sub": "3매치 수집 게임",
        "kind": "match",
        "mark": "★",
        "accent": "#7C4DFF",
        "secondary": "#FFD166",
        "hero": "#FF8FB3",
        "soft": "#F4ECFF",
        "intro": "3개를 맞춰 터뜨리고 100종 몽글 도감을 채워요.",
        "goal": "420점 달성",
        "start": "한 판 도전",
        "play_note": "같은 타일 3개를 맞춰요",
        "result": "몽글 획득!",
        "score": "640점",
        "highlight": "레어 보너스 발견",
        "collectible": "오늘의 몽글 조각",
        "hero_lines": ["3개를 맞추고", "100종 몽글을 수집해요"],
        "screens": [
            ("100종 몽글 수집", "짧은 3매치로 도감을 채워요", 1),
            ("스와이프 퍼즐", "터지고 내려오는 말랑한 보드", 2),
            ("결과와 랭킹", "점수와 수집 조각을 확인해요", 3),
        ],
        "captions": ["홈에서 목표와 수집 진행을 바로 확인해요.", "보드 조작과 점수 피드백을 한 화면에 담았어요.", "결과에서 점수와 도감 조각을 이어갑니다."],
    },
    {
        "dir": "08-mongle-defense",
        "app_name": "mongle-defense",
        "display": "몽글 디펜스",
        "logo_sub": "30초 방어 게임",
        "kind": "defense",
        "mark": "!",
        "accent": "#6A7CFF",
        "secondary": "#58D7B5",
        "hero": "#A6D8FF",
        "soft": "#EAF6FF",
        "intro": "내려오는 몬스터를 탭해 몽글 마을을 지켜요.",
        "goal": "30초 방어",
        "start": "바로 방어하기",
        "play_note": "위험선 전에 몬스터를 막아요",
        "result": "방어 결과",
        "score": "920점",
        "highlight": "콤보 방어 성공",
        "collectible": "구름 방패 조각",
        "hero_lines": ["몬스터를 막고", "30초 방어 기록을 남겨요"],
        "screens": [
            ("오늘의 웨이브", "도우미와 목표를 고르고 시작해요", 1),
            ("3레인 디펜스", "탭으로 막고 콤보를 이어가요", 2),
            ("방어 기록", "점수와 조각을 결과에서 확인해요", 3),
        ],
        "captions": ["오늘 웨이브와 도우미 효과를 홈에서 확인합니다.", "위험선과 HUD가 한 화면에 들어오도록 구성했어요.", "결과 화면에서 랭킹과 다시하기 흐름을 이어갑니다."],
    },
    {
        "dir": "09-mongle-run",
        "app_name": "mongle-run",
        "display": "도망 몽글",
        "logo_sub": "30초 회피 러너",
        "kind": "run",
        "mark": "↗",
        "accent": "#5B8CFF",
        "secondary": "#BFD7FF",
        "hero": "#73D0FF",
        "soft": "#EFF5FF",
        "intro": "오늘 코스를 달리며 별과 무지개 조각을 모아요.",
        "goal": "무지개 조각",
        "start": "도망 시작",
        "play_note": "장애물을 피하고 별을 모아요",
        "result": "달리기 완료",
        "score": "340m",
        "highlight": "아슬아슬 회피",
        "collectible": "구름 발자국",
        "hero_lines": ["장애물을 피하고", "오늘의 코스를 달려요"],
        "screens": [
            ("오늘의 코스", "무지개 언덕을 짧게 달려요", 1),
            ("3레인 회피", "왼쪽 가운데 오른쪽으로 이동해요", 2),
            ("거리 기록", "최고 거리와 조각을 저장해요", 3),
        ],
        "captions": ["오늘 목표와 최고 거리를 홈에서 바로 봅니다.", "큰 이동 버튼으로 390px에서도 쉽게 조작해요.", "결과 카드로 다음 목표를 자연스럽게 보여줍니다."],
    },
    {
        "dir": "10-mongle-detective",
        "app_name": "mongle-detective",
        "display": "1초 탐정 몽글",
        "logo_sub": "순간 관찰 게임",
        "kind": "detective",
        "mark": "?",
        "accent": "#7C5CFF",
        "secondary": "#D8CCFF",
        "hero": "#B68CFF",
        "soft": "#F4F0FF",
        "intro": "단서를 보고 진짜 도둑 몽글을 빠르게 찾아요.",
        "goal": "표식 찾기",
        "start": "사건 시작",
        "play_note": "표식과 단서를 보고 골라요",
        "result": "사건 해결",
        "score": "8연속",
        "highlight": "희귀 변장 발견",
        "collectible": "탐정 배지",
        "hero_lines": ["1초 단서를 보고", "도둑 몽글을 찾아요"],
        "screens": [
            ("오늘의 사건", "표식과 단서를 확인해요", 1),
            ("순간 판단", "비슷한 몽글 사이에서 골라요", 2),
            ("해결 기록", "연속 정답과 배지를 저장해요", 3),
        ],
        "captions": ["오늘 단서와 목표가 첫 화면에서 바로 보입니다.", "선택 카드가 큼직해 빠른 판단에 집중할 수 있어요.", "결과에서 연속 정답과 수집 진행을 확인합니다."],
    },
    {
        "dir": "11-mongle-jump",
        "app_name": "mongle-jump",
        "display": "몽글 점프",
        "logo_sub": "타이밍 점프",
        "kind": "jump",
        "mark": "↑",
        "accent": "#19B37A",
        "secondary": "#A8EAD0",
        "hero": "#8AE3B5",
        "soft": "#ECFFF6",
        "intro": "퍼펙트 존과 황금 구름을 노려 더 높이 올라요.",
        "goal": "황금 구름",
        "start": "점프 시작",
        "play_note": "초록 안전 구간에 맞춰요",
        "result": "점프 기록",
        "score": "12층",
        "highlight": "퍼펙트 착지",
        "collectible": "구름 조각",
        "hero_lines": ["타이밍을 맞춰", "더 높은 구름으로 올라요"],
        "screens": [
            ("오늘의 점프", "황금 구름을 노려요", 1),
            ("퍼펙트 존", "초록 구간에서 지금 점프", 2),
            ("높이 기록", "층수와 구름 조각을 남겨요", 3),
        ],
        "captions": ["첫 화면에서 오늘 목표와 최고 높이를 확인합니다.", "타이밍 바와 버튼이 한 화면에 안정적으로 들어와요.", "결과에서 높이와 연속 기록을 이어갑니다."],
    },
    {
        "dir": "12-mongle-maze",
        "app_name": "mongle-maze",
        "display": "몽글 미로 탈출",
        "logo_sub": "짧은 미로 퍼즐",
        "kind": "maze",
        "mark": "◇",
        "accent": "#F07A3F",
        "secondary": "#FFD0B4",
        "hero": "#FFB16E",
        "soft": "#FFF4EC",
        "intro": "열쇠와 반짝 조각을 챙겨 짧은 길로 탈출해요.",
        "goal": "최단 12걸음",
        "start": "탈출 시작",
        "play_note": "벽은 피하고 조각을 챙겨요",
        "result": "탈출 성공",
        "score": "11걸음",
        "highlight": "최단 루트 성공",
        "collectible": "비밀 지도",
        "hero_lines": ["짧은 길을 찾고", "반짝 조각까지 챙겨요"],
        "screens": [
            ("오늘의 미로", "열쇠와 최단 루트를 확인해요", 1),
            ("방향 퍼즐", "위 아래 왼쪽 오른쪽으로 이동", 2),
            ("탈출 기록", "걸음 수와 지도 조각을 저장해요", 3),
        ],
        "captions": ["홈에서 오늘 미로 목표를 간단히 확인합니다.", "5x5 미로와 방향 버튼이 한 화면에 들어와요.", "결과에서 최단 루트와 수집 진행을 이어갑니다."],
    },
]


if __name__ == "__main__":
    for app_config in APPS:
        generate(app_config)
