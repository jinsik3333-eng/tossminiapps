from pathlib import Path
import shutil
import zipfile

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path("/Users/jinsik/Desktop/Workspace/01_project_tossminiapps")
APP = "subscription-ghost-finder"
OUT = ROOT / "assets" / "app-store" / APP
PUBLIC = ROOT / "apps" / "05-subscription-ghost-finder" / "public"
SRC = OUT / "sources" / "ghost-landscape-source.png"
FONT_PATH = "/System/Library/Fonts/AppleSDGothicNeo.ttc"


def font(size, weight=0):
    try:
        return ImageFont.truetype(FONT_PATH, size=size, index=weight)
    except Exception:
        return ImageFont.truetype(FONT_PATH, size=size)


F_REG = lambda size: font(size, 0)
F_BOLD = lambda size: font(size, 6)


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def gradient(size, left, right):
    w, h = size
    start = hex_to_rgb(left)
    end = hex_to_rgb(right)
    im = Image.new("RGB", size, start)
    px = im.load()
    for y in range(h):
        vertical = y / max(1, h - 1)
        for x in range(w):
            horizontal = x / max(1, w - 1)
            t = horizontal * 0.82 + vertical * 0.18
            px[x, y] = tuple(int(start[i] + (end[i] - start[i]) * t) for i in range(3))
    return im.convert("RGBA")


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def center_text(draw, y, text, fnt, fill, width):
    tw, th = text_size(draw, text, fnt)
    draw.text(((width - tw) / 2, y), text, font=fnt, fill=fill)
    return y + th


def contain_image(src, box):
    bw, bh = box
    scale = min(bw / src.width, bh / src.height)
    nw = int(src.width * scale)
    nh = int(src.height * scale)
    return src.resize((nw, nh), Image.LANCZOS)


def feathered(image, feather):
    w, h = image.size
    mask = Image.new("L", (w, h), 255)
    px = mask.load()
    for y in range(h):
        dy = min(y, h - 1 - y)
        for x in range(w):
            dx = min(x, w - 1 - x)
            edge = min(dx, dy)
            if edge < feather:
                px[x, y] = int(255 * edge / max(1, feather))
    out = image.copy()
    out.putalpha(mask)
    return out


def add_soft_light(canvas):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w, h = canvas.size
    d.ellipse((-w * 0.18, -h * 0.38, w * 0.66, h * 0.8), fill=(255, 255, 255, 24))
    d.ellipse((w * 0.56, -h * 0.26, w * 1.16, h * 0.56), fill=(255, 255, 255, 18))
    d.ellipse((w * 0.34, h * 0.68, w * 1.08, h * 1.24), fill=(124, 58, 237, 32))
    canvas.alpha_composite(layer)


def rounded_panel(base, xy, radius, fill, shadow=True):
    x1, y1, x2, y2 = map(int, xy)
    if shadow:
        layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(layer)
        sd.rounded_rectangle((x1, y1 + 10, x2, y2 + 10), radius=radius, fill=(29, 18, 68, 58))
        layer = layer.filter(ImageFilter.GaussianBlur(18))
        base.alpha_composite(layer)
    ImageDraw.Draw(base).rounded_rectangle((x1, y1, x2, y2), radius=radius, fill=fill)


def make_logo(path, dark=False):
    bg = gradient((600, 600), "#5B2AE8" if not dark else "#111827", "#13B8CE" if not dark else "#263247")
    add_soft_light(bg)

    src = Image.open(SRC).convert("RGBA")
    hero = feathered(contain_image(src, (520, 346)), 42)
    # Keep the full source image visible. The added margins are intentional to avoid review rejection for cropping.
    bg.alpha_composite(hero, ((600 - hero.width) // 2, 36))

    d = ImageDraw.Draw(bg)
    rounded_panel(bg, (54, 426, 546, 530), 52, (255, 255, 255, 240))
    center_text(d, 450, "구독 유령 찾기", F_BOLD(42), "#6D28D9", 600)
    center_text(d, 505, "60초 자가 점검", F_BOLD(20), "#64748B", 600)
    bg.convert("RGB").save(path, optimize=True)


def make_thumbnail(path):
    im = gradient((1932, 828), "#5B2AE8", "#11B7C8")
    add_soft_light(im)
    d = ImageDraw.Draw(im)

    d.text((110, 116), "구독료 유령 찾기", font=F_BOLD(82), fill="#FFFFFF")
    d.text((114, 236), "구독 습관 60초 자가 점검", font=F_BOLD(43), fill="#F3F8FF")
    d.text((116, 302), "직접 답변으로 확인 후보를 정리해요", font=F_REG(31), fill="#DDEBFF")
    rounded_panel(im, (112, 402, 645, 486), 42, (255, 255, 255, 242))
    d.text((154, 426), "자가 점검 시작", font=F_BOLD(33), fill="#6D28D9")

    src = Image.open(SRC).convert("RGBA")
    hero = feathered(contain_image(src, (1040, 694)), 80)
    # Full subject stays inside the visible area with a comfortable safe margin.
    im.alpha_composite(hero, (820, 82))
    im.convert("RGB").save(path, optimize=True)


def make_contact_sheet():
    files = [
        "app-logo-600.png",
        "app-logo-dark-600.png",
        "thumbnail-1932x828.png",
        "screenshot-01-636x1048.png",
        "screenshot-02-636x1048.png",
        "screenshot-03-636x1048.png",
        "screenshot-horizontal-1504x741.png",
    ]
    canvas = Image.new("RGB", (1020, 810), "#F3F6FB")
    d = ImageDraw.Draw(canvas)
    d.text((34, 22), "구독료 유령 찾기 이미지 패키지", font=F_BOLD(30), fill="#111827")
    positions = [
        (34, 78, 180, 180),
        (234, 78, 180, 180),
        (434, 78, 540, 231),
        (34, 330, 170, 280),
        (224, 330, 170, 280),
        (414, 330, 170, 280),
        (624, 330, 360, 177),
    ]
    for name, (x, y, tw, th) in zip(files, positions):
        thumb = Image.open(OUT / name).convert("RGB")
        thumb.thumbnail((tw, th), Image.LANCZOS)
        d.rounded_rectangle((x - 6, y - 6, x + tw + 6, y + th + 6), radius=18, fill="#FFFFFF")
        canvas.paste(thumb, (x + (tw - thumb.width) // 2, y + (th - thumb.height) // 2))
        d.text((x, y + th + 14), name, font=F_REG(15), fill="#4B5563")
    canvas.save(OUT / "contact-sheet.png", optimize=True)


def make_zip():
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
    zpath = OUT / f"{APP}-appstore-assets.zip"
    if zpath.exists():
        zpath.unlink()
    with zipfile.ZipFile(zpath, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name in names:
            archive.write(OUT / name, arcname=name)


def sync_public():
    copies = [
        (OUT / "app-logo-600.png", PUBLIC / "app-icon.png"),
        (OUT / "app-logo-600.png", PUBLIC / "app-logo.png"),
        (OUT / "app-logo-dark-600.png", PUBLIC / "app-logo-dark.png"),
        (OUT / "thumbnail-1932x828.png", PUBLIC / "thumbnail.png"),
    ]
    for src, dest in copies:
        shutil.copyfile(src, dest)


def validate(path, expected):
    im = Image.open(path).convert("RGBA")
    assert im.size == expected, f"{path} has {im.size}, expected {expected}"
    assert im.getchannel("A").getextrema() == (255, 255), f"{path} has transparency"
    corners = [
        im.getpixel((0, 0)),
        im.getpixel((im.width - 1, 0)),
        im.getpixel((0, im.height - 1)),
        im.getpixel((im.width - 1, im.height - 1)),
    ]
    assert all(pixel[3] == 255 for pixel in corners), f"{path} has transparent corners"
    assert not all(sum(pixel[:3]) < 10 for pixel in corners), f"{path} still looks like a rounded crop"


def main():
    make_logo(OUT / "app-logo-600.png", dark=False)
    make_logo(OUT / "app-logo-dark-600.png", dark=True)
    make_thumbnail(OUT / "thumbnail-1932x828.png")
    make_contact_sheet()
    make_zip()
    sync_public()

    validate(OUT / "app-logo-600.png", (600, 600))
    validate(OUT / "app-logo-dark-600.png", (600, 600))
    validate(OUT / "thumbnail-1932x828.png", (1932, 828))
    validate(PUBLIC / "app-icon.png", (600, 600))
    validate(PUBLIC / "thumbnail.png", (1932, 828))
    print("subscription ghost assets rebuilt without rounded/cropped outer bounds")


if __name__ == "__main__":
    main()
