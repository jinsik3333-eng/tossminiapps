from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap
import zipfile

ROOT = Path('/Users/jinsik/Desktop/Workspace/01_project_tossminiapps')
OUT = ROOT / 'assets/app-store/salary-thief-finder'
OUT.mkdir(parents=True, exist_ok=True)
SRC = OUT / 'sources/salary-thief-hero-source.png'
FONT = '/System/Library/Fonts/AppleSDGothicNeo.ttc'


def font(size, weight=400):
    idx = 5 if weight >= 700 else 3 if weight >= 600 else 0
    try:
        return ImageFont.truetype(FONT, size, index=idx)
    except Exception:
        return ImageFont.truetype(FONT, size)


def cover(img, size):
    img = img.convert('RGB')
    sw, sh = size
    r = max(sw / img.width, sh / img.height)
    nw, nh = int(img.width * r), int(img.height * r)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    return img.crop(((nw - sw) // 2, (nh - sh) // 2, (nw + sw) // 2, (nh + sh) // 2)).convert('RGBA')


def gradient(size, top, bottom):
    w, h = size
    im = Image.new('RGB', size)
    px = im.load()
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(w):
            px[x, y] = c
    return im.convert('RGBA')


def shadow(canvas, xy, radius, blur=24, alpha=55, offset=(0, 12)):
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x1, y1, x2, y2 = xy
    d.rounded_rectangle((x1 + offset[0], y1 + offset[1], x2 + offset[0], y2 + offset[1]), radius=radius, fill=(24, 36, 80, alpha))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def text(draw, xy, value, size, fill=(25, 31, 40), weight=400, anchor=None, align='left', spacing=6):
    draw.multiline_text(xy, value, font=font(size, weight), fill=fill, anchor=anchor, align=align, spacing=spacing)


def rounded_paste(base, img, xy, radius):
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, img.width, img.height), radius=radius, fill=255)
    base.paste(img, xy, mask)


def pill(draw, xy, label, fill=(255,255,255,232), color=(25,31,40), size=34):
    x, y = xy
    f = font(size, 800)
    bbox = draw.textbbox((0,0), label, font=f)
    w = bbox[2]-bbox[0]+40
    h = bbox[3]-bbox[1]+24
    draw.rounded_rectangle((x,y,x+w,y+h), radius=h//2, fill=fill)
    draw.text((x+w/2,y+h/2-1), label, font=f, fill=color, anchor='mm')

src = Image.open(SRC)

# app logo
for name, dark in [('app-logo-600.png', False), ('app-logo-dark-600.png', True)]:
    base = gradient((600,600), (237,244,255) if not dark else (13,20,44), (226,232,255) if not dark else (30,22,68))
    art = cover(src, (520,520))
    shadow(base, (50,50,550,550), 118, 30, 45)
    rounded_paste(base, art, (40,40), 118)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle((128,454,472,526), radius=34, fill=(255,255,255,235) if not dark else (17,24,39,230))
    text(d, (300,491), '도둑찾기', 40, fill=(25,31,40) if not dark else (255,255,255), weight=900, anchor='mm')
    base.convert('RGB').save(OUT/name)

# thumbnail
base = gradient((1932,828), (237,245,255), (231,224,255))
art = cover(src, (940,680))
shadow(base, (910,74,1850,754), 70, 42, 55)
rounded_paste(base, art, (910,74), 70)
d = ImageDraw.Draw(base)
pill(d, (120,118), '60초 소비 습관 진단', color=(49,130,246), size=34)
text(d, (120,240), '내 월급을 사라지게 한\n소비 패턴은?', 82, fill=(17,24,39), weight=900, spacing=12)
text(d, (124,474), '배달비 · 편의점 · 구독료 · 택시비\n직접 고른 답변으로 소비 습관을 점검해요', 40, fill=(78,89,104), weight=700, spacing=10)
d.rounded_rectangle((120,636,520,720), radius=34, fill=(49,130,246))
text(d, (320,679), '도둑 찾기 시작', 36, fill=(255,255,255), weight=800, anchor='mm')
base.convert('RGB').save(OUT/'thumbnail-1932x828.png')

# vertical screenshots
screens = [
    ('screenshot-01-636x1048.png', '월급 도둑 찾기', '내 소비 습관을\n60초만에 점검해요', '내 답변 기반 소비 습관 점검'),
    ('screenshot-02-636x1048.png', '5문항 소비 점검', '배달비·편의점·구독료\n반복 패턴을 골라요', '자동조회가 아닌 자가 점검'),
    ('screenshot-03-636x1048.png', '결과 카드와 루틴', '도둑 유형과 오늘의\n방어 루틴을 확인해요', '결과에 맞는 체크리스트 확인'),
]
for file, title, headline, caption in screens:
    base = gradient((636,1048), (246,250,255), (232,236,255))
    art = cover(src, (560,430))
    shadow(base, (38,72,598,502), 52, 30, 45)
    rounded_paste(base, art, (38,72), 52)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle((54,92,260,148), radius=28, fill=(255,255,255,235))
    text(d, (157,120), title, 27, fill=(112,72,232), weight=900, anchor='mm')
    text(d, (58,586), headline, 52, fill=(17,24,39), weight=900, spacing=10)
    text(d, (62,738), caption, 30, fill=(78,89,104), weight=800)
    d.rounded_rectangle((58,860,578,934), radius=30, fill=(49,130,246))
    text(d, (318,897), '월급 도둑 찾기', 31, fill=(255,255,255), weight=900, anchor='mm')
    base.convert('RGB').save(OUT/file)

# horizontal screenshot
base = gradient((1504,741), (239,247,255), (230,225,255))
art = cover(src, (710,560))
shadow(base, (748,82,1458,642), 60, 40, 50)
rounded_paste(base, art, (748,82), 60)
d = ImageDraw.Draw(base)
pill(d, (84,96), '생활비 습관 테스트', color=(49,130,246), size=30)
text(d, (84,210), '조용히 새는 월급을\n게임처럼 찾아요', 72, fill=(17,24,39), weight=900, spacing=12)
text(d, (88,418), '금융상품 추천이 아닌 생활 소비 습관 자가 점검 앱입니다.', 32, fill=(78,89,104), weight=600)
d.rounded_rectangle((84,552,434,628), radius=30, fill=(49,130,246))
text(d, (259,590), '60초 진단 시작', 32, fill=(255,255,255), weight=900, anchor='mm')
base.convert('RGB').save(OUT/'screenshot-horizontal-1504x741.png')

# contact sheet
files = ['app-logo-600.png','app-logo-dark-600.png','thumbnail-1932x828.png','screenshot-01-636x1048.png','screenshot-02-636x1048.png','screenshot-03-636x1048.png','screenshot-horizontal-1504x741.png']
thumbs=[]
for f in files:
    im=Image.open(OUT/f).convert('RGB')
    im.thumbnail((360,360), Image.Resampling.LANCZOS)
    thumbs.append((f,im.copy()))
sheet=Image.new('RGB',(760,1500),(245,247,251))
d=ImageDraw.Draw(sheet)
x=y=24
for i,(name,im) in enumerate(thumbs):
    if i==2:
        x=24; y+=430
    elif i>0 and i!=2:
        x = 396 if x==24 else 24
        if x==24: y += 430
    sheet.paste(im,(x,y))
    text(d,(x,y+im.height+16),name,24,fill=(50,60,75),weight=700)
sheet.save(OUT/'contact-sheet.png')

zip_path=OUT/'salary-thief-finder-appstore-assets.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for f in files:
        z.write(OUT/f, arcname=f)
print(zip_path)
