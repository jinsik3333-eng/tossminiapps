from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/app-store/spending-defense-roulette"
SRC = OUT / "sources/roulette-hero-source.png"
OUT.mkdir(parents=True, exist_ok=True)

FONT_PATHS = [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
]

def font(size, index=0):
    for path in FONT_PATHS:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size, index=index)
    return ImageFont.load_default()

F_HEAVY = lambda s: font(s, 8)
F_BOLD = lambda s: font(s, 6)
F_REG = lambda s: font(s, 0)

BLUE = (49, 130, 246)
MINT = (0, 199, 115)
DARK = (25, 31, 40)
GRAY = (78, 89, 104)
BG = (245, 249, 255)

def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def cover_image(size):
    im = Image.open(SRC).convert("RGB")
    w, h = im.size
    tw, th = size
    scale = max(tw / w, th / h)
    nw, nh = int(w * scale), int(h * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))

def text(draw, xy, s, f, fill=DARK, anchor=None, spacing=6, align="left"):
    draw.multiline_text(xy, s, font=f, fill=fill, anchor=anchor, spacing=spacing, align=align)

def pill(draw, xy, label, fill=BLUE, fg=(255,255,255), pad=(18,9), f=None):
    f = f or F_BOLD(26)
    x, y = xy
    box = draw.textbbox((0,0), label, font=f)
    w, h = box[2]-box[0], box[3]-box[1]
    rect = (x, y, x+w+pad[0]*2, y+h+pad[1]*2)
    rounded_rect(draw, rect, 999, fill)
    draw.text((x+pad[0], y+pad[1]-2), label, font=f, fill=fg)
    return rect

def make_logo(path, dark=False):
    im = Image.new("RGB", (600,600), (17,24,39) if dark else BG)
    d = ImageDraw.Draw(im)
    cx, cy = 300, 260
    # wheel
    d.ellipse((145,105,455,415), fill=(255,255,255), outline=(70,90,120) if dark else (214,224,236), width=8)
    segments = [BLUE, MINT, (124,92,255), (255,138,61), (255,212,59)]
    for i, c in enumerate(segments):
        d.pieslice((165,125,435,395), start=i*72-90, end=(i+1)*72-90, fill=c)
    d.ellipse((238,198,362,322), fill=(255,255,255))
    d.polygon([(300,92),(338,150),(262,150)], fill=(25,31,40) if not dark else (255,255,255))
    d.text((300,470), "소비 방어", font=F_HEAVY(54), fill=(255,255,255) if dark else DARK, anchor="mm")
    d.text((300,525), "룰렛", font=F_HEAVY(54), fill=(137,199,255) if dark else BLUE, anchor="mm")
    im.save(path)

def make_thumbnail(path):
    im = Image.new("RGB", (1932,828), BG)
    art = cover_image((980,720)).filter(ImageFilter.GaussianBlur(0.2))
    im.paste(art, (890,54))
    overlay = Image.new("RGBA", im.size, (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    od.rectangle((850,0,1932,828), fill=(255,255,255,45))
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(im)
    pill(d, (110,104), "5초 생활 루틴", MINT, f=F_BOLD(34))
    text(d, (110,190), "소비 방어\n룰렛", F_HEAVY(108), DARK, spacing=4)
    text(d, (116,450), "오늘 막을 소비 함정을 고르고\n방어 카드로 기록해요", F_BOLD(42), GRAY, spacing=12)
    pill(d, (112,650), "오늘의 루틴 카드 열기", DARK, f=F_BOLD(32))
    im.save(path)

def make_portrait(path, title, subtitle, badge, variant=0):
    im = Image.new("RGB", (636,1048), BG)
    d = ImageDraw.Draw(im)
    art_h = 440
    art = cover_image((636, art_h))
    im.paste(art, (0,0))
    scrim = Image.new("RGBA", (636, art_h), (0,0,0,0))
    sd = ImageDraw.Draw(scrim)
    sd.rectangle((0,0,636,art_h), fill=(0,30,70,60))
    im.paste(Image.alpha_composite(art.convert("RGBA"), scrim).convert("RGB"), (0,0))
    pill(d, (34,34), badge, BLUE if variant != 1 else MINT, f=F_BOLD(24))
    card_y = 380
    rounded_rect(d, (28, card_y, 608, 1008), 36, (255,255,255), (224,232,242), 2)
    text(d, (62, card_y+56), title, F_HEAVY(58), DARK, spacing=6)
    text(d, (64, card_y+210), subtitle, F_BOLD(29), GRAY, spacing=10)
    labels = ["오늘의 룰렛", "5초 선택", "30일 기록"] if variant == 0 else ["방어 카드", "추가 루틴", "친구 공유"]
    y = card_y + 330
    for i, label in enumerate(labels):
        item_y = y + i * 68
        rounded_rect(d, (62, item_y, 574, item_y + 52), 18, (244,247,251))
        d.text((96, item_y + 13), label, font=F_BOLD(25), fill=DARK)
    rounded_rect(d, (62, 910, 574, 974), 24, BLUE, None)
    d.text((318, 942), "소비 방어 시작", font=F_HEAVY(30), fill=(255,255,255), anchor="mm")
    im.save(path)

def make_horizontal(path):
    im = Image.new("RGB", (1504,741), BG)
    art = cover_image((760,650))
    im.paste(art, (704,45))
    d = ImageDraw.Draw(im)
    pill(d, (70,76), "생활 소비 습관 체크", BLUE, f=F_BOLD(30))
    text(d, (70,160), "오늘의 소비 함정\n5초 안에 방어", F_HEAVY(78), DARK, spacing=8)
    text(d, (74,390), "내 답변을 바탕으로 오늘의 소비 방어\n루틴을 열어보는 미니앱", F_BOLD(32), GRAY, spacing=12)
    pill(d, (76,585), "오늘의 루틴 카드", DARK, f=F_BOLD(28))
    im.save(path)

def contact_sheet(path, files):
    thumbs=[]
    for file in files:
        im=Image.open(file).convert('RGB')
        im.thumbnail((320,260), Image.Resampling.LANCZOS)
        thumbs.append((file.name, im.copy()))
    w=720; h=((len(thumbs)+1)//2)*330+40
    sheet=Image.new('RGB',(w,h),(245,247,251)); d=ImageDraw.Draw(sheet)
    for idx,(name,im) in enumerate(thumbs):
        x=30+(idx%2)*345; y=30+(idx//2)*330
        sheet.paste(im,(x,y+34)); d.text((x,y),name,font=F_BOLD(18),fill=DARK)
    sheet.save(path)

def main():
    files=[]
    make_logo(OUT/'app-logo-600.png', False); files.append(OUT/'app-logo-600.png')
    make_logo(OUT/'app-logo-dark-600.png', True); files.append(OUT/'app-logo-dark-600.png')
    make_thumbnail(OUT/'thumbnail-1932x828.png'); files.append(OUT/'thumbnail-1932x828.png')
    make_portrait(OUT/'screenshot-01-636x1048.png', '돌리고\n바로 방어', '룰렛으로 오늘의 소비 함정을 고르고\n짧은 선택으로 방어 기록을 채워요.', '오늘의 룰렛', 0); files.append(OUT/'screenshot-01-636x1048.png')
    make_portrait(OUT/'screenshot-02-636x1048.png', '5초 선택\n미니 게임', '배달비·택시비·쇼핑·구독·간식 중\n오늘 흔들리는 순간을 가볍게 점검해요.', '5초 방어', 1); files.append(OUT/'screenshot-02-636x1048.png')
    make_portrait(OUT/'screenshot-03-636x1048.png', '루틴 카드와\n30일 기록', '오늘의 루틴 카드를 확인하고\n내일 다른 함정으로 다시 돌아와요.', '기록 루프', 2); files.append(OUT/'screenshot-03-636x1048.png')
    make_horizontal(OUT/'screenshot-horizontal-1504x741.png'); files.append(OUT/'screenshot-horizontal-1504x741.png')
    contact_sheet(OUT/'contact-sheet.png', files); files.append(OUT/'contact-sheet.png')
    zip_path=OUT/'spending-defense-roulette-appstore-assets.zip'
    with ZipFile(zip_path,'w',ZIP_DEFLATED) as z:
        for f in files:
            if f.name != 'contact-sheet.png':
                z.write(f, f.name)
    print(zip_path)
    for f in files:
        im=Image.open(f); print(f.name, im.size)

if __name__ == '__main__':
    main()
