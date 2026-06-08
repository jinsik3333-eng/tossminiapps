from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/app-store/receipt-monster-catcher"
SRC = ROOT / "apps/06-receipt-monster-catcher/src/assets/receipt-monster-hero.jpg"
APP = "영수증 몬스터 잡기"
PRIMARY = "#21C997"
INK = "#101828"
MUTED = "#667085"
BG = "#F6FAF8"

OUT.mkdir(parents=True, exist_ok=True)

FONT_PATHS = [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
]

def font(size, bold=False):
    path = next((p for p in FONT_PATHS if Path(p).exists()), None)
    if path:
        return ImageFont.truetype(path, size=size, index=8 if bold and path.endswith('.ttc') else 0)
    return ImageFont.load_default()

F_TITLE = font(76, True)
F_H1 = font(58, True)
F_H2 = font(42, True)
F_BODY = font(31, False)
F_SMALL = font(25, True)
F_TINY = font(25, True)


def rounded(draw, box, r, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def cover(img, size):
    img = img.convert('RGB')
    sw, sh = size
    scale = max(sw / img.width, sh / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    im = img.resize((nw, nh), Image.Resampling.LANCZOS)
    return im.crop(((nw - sw)//2, (nh - sh)//2, (nw + sw)//2, (nh + sh)//2))


def draw_wrapped(draw, text, xy, fnt, fill, max_width, line_gap=10):
    x, y = xy
    line = ''
    for ch in text:
        trial = line + ch
        if draw.textbbox((0,0), trial, font=fnt)[2] <= max_width:
            line = trial
        else:
            draw.text((x,y), line, font=fnt, fill=fill)
            y += fnt.size + line_gap
            line = ch
    if line:
        draw.text((x,y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap
    return y


def paste_hero(base, box, radius=46):
    hero = cover(Image.open(SRC), (box[2]-box[0], box[3]-box[1]))
    mask = Image.new('L', hero.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,*hero.size), radius=radius, fill=255)
    base.paste(hero, box[:2], mask)


def logo(path, dark=False):
    im = Image.new('RGB', (600,600), '#0B1220' if dark else BG)
    d = ImageDraw.Draw(im)
    rounded(d, (72,72,528,528), 130, '#17202C' if dark else '#FFFFFF')
    d.ellipse((132,118,468,454), fill=PRIMARY)
    # Draw the mascot directly instead of relying on color emoji glyphs, which
    # can render as missing-character boxes in generated PNGs.
    paper_fill = '#FFFFFF'
    paper_outline = '#E0FFF4'
    d.rounded_rectangle((224,146,376,356), radius=18, fill=paper_fill, outline=paper_outline, width=5)
    d.polygon([(224,146),(248,168),(272,146),(296,168),(320,146),(344,168),(376,146)], fill=paper_fill)
    for y in (206, 252, 296):
        d.line((254, y, 346, y), fill='#BFEBDD', width=9)
    d.ellipse((246,368,354,476), fill='#FFFFFF', outline=PRIMARY, width=8)
    d.ellipse((270,400,288,418), fill=PRIMARY)
    d.ellipse((312,400,330,418), fill=PRIMARY)
    d.arc((274,416,326,450), 0, 180, fill=PRIMARY, width=7)
    d.rounded_rectangle((194,438,406,482), radius=22, fill='#FFFFFF' if not dark else '#E7FFF4')
    d.text((300,460), 'CHECK', anchor='mm', font=font(24, True), fill=INK)
    im.save(path)


def thumbnail():
    im = Image.new('RGB', (1932,828), BG)
    d = ImageDraw.Draw(im)
    paste_hero(im, (990,86,1820,742), 62)
    d.text((120,110), '탭해서 잡는\n소비 습관 미니게임', font=F_TITLE, fill=INK, spacing=10)
    draw_wrapped(d, '영수증을 올리지 않아도 오늘의 소비 상황을 가볍게 정리해요.', (124,340), F_BODY, MUTED, 720, 12)
    rounded(d, (124,560,530,646), 43, PRIMARY)
    d.text((327,603), APP, anchor='mm', font=F_H2, fill='white')
    rounded(d, (560,560,820,646), 43, '#FFFFFF', outline='#D8E1EA', width=2)
    d.text((690,603), '단서 수집', anchor='mm', font=F_BODY, fill=INK)
    im.save(OUT/'thumbnail-1932x828.png')


def vertical(idx, title, body, badge, footer):
    im = Image.new('RGB', (636,1048), BG)
    d = ImageDraw.Draw(im)
    rounded(d, (34,34,602,1014), 56, '#FFFFFF')
    rounded(d, (70,72,268,124), 26, PRIMARY)
    d.text((169,98), badge, anchor='mm', font=F_SMALL, fill='white')
    d.text((70,160), title, font=F_H1, fill=INK, spacing=8)
    draw_wrapped(d, body, (72,308), F_BODY, MUTED, 492, 11)
    paste_hero(im, (72,450,564,760), 42)
    rounded(d, (72,806,564,930), 32, '#F2FBF7')
    d.text((104,836), footer, font=F_H2, fill=INK)
    d.text((104,890), '금융상품 추천 없이 생활 루틴만 정리해요', font=F_TINY, fill='#475467')
    im.save(OUT/f'screenshot-0{idx}-636x1048.png')


def horizontal():
    im = Image.new('RGB', (1504,741), BG)
    d = ImageDraw.Draw(im)
    paste_hero(im, (790,70,1430,670), 56)
    d.text((86,86), '영수증 몬스터를\n탭해서 잡아요', font=F_TITLE, fill=INK, spacing=8)
    draw_wrapped(d, '배달·간식·쇼핑·구독처럼 자주 흔들리는 순간을 몬스터로 보고, 잡은 뒤 오늘의 방어 루틴을 확인해요.', (90,304), F_BODY, MUTED, 610, 12)
    rounded(d, (90,548,406,626), 39, PRIMARY)
    d.text((248,587), '오늘의 몬스터', anchor='mm', font=F_BODY, fill='white')
    rounded(d, (430,548,690,626), 39, '#FFFFFF', outline='#DCE5EF', width=2)
    d.text((560,587), '30일 기록', anchor='mm', font=F_BODY, fill=INK)
    im.save(OUT/'screenshot-horizontal-1504x741.png')


def contact_sheet():
    files = ['app-logo-600.png','app-logo-dark-600.png','thumbnail-1932x828.png','screenshot-01-636x1048.png','screenshot-02-636x1048.png','screenshot-03-636x1048.png','screenshot-horizontal-1504x741.png']
    thumbs=[]
    for name in files:
        img=Image.open(OUT/name).convert('RGB')
        img.thumbnail((430,430))
        thumbs.append((name,img.copy()))
    w,h=1480,1500
    sheet=Image.new('RGB',(w,h),'#F3F6FA')
    d=ImageDraw.Draw(sheet)
    x=y=28
    for name,img in thumbs:
        rounded(d,(x,y,x+460,y+470),24,'#FFFFFF')
        sheet.paste(img,(x+15,y+48))
        d.text((x+18,y+14),name,font=font(18,True),fill=INK)
        x += 480
        if x+460>w:
            x=28; y+=490
    sheet.save(OUT/'contact-sheet.png')

logo(OUT/'app-logo-600.png')
logo(OUT/'app-logo-dark-600.png', dark=True)
thumbnail()
vertical(1, '오늘의 몬스터\n잡기', '탭할수록 영수증 몬스터의 움직임이 줄고, 오늘 점검할 소비 상황이 열려요.', '탭 게임', '소비 단서 확인')
vertical(2, '잡은 뒤에는\n루틴 카드', '배달·간식·쇼핑·구독 중 오늘의 흔들린 순간을 짧은 행동으로 바꿔요.', '루틴', '오늘의 방어 루틴')
vertical(3, '매일 다른\n단서 수집', '30일 기록에 잡은 몬스터를 쌓고 내일 다시 들어올 이유를 만들어요.', '기록', '내일 몬스터 예고')
horizontal()
contact_sheet()
zip_path=OUT/'receipt-monster-catcher-appstore-assets.zip'
with ZipFile(zip_path,'w',ZIP_DEFLATED) as z:
    for p in OUT.glob('*.png'):
        if p.name != 'contact-sheet.png':
            z.write(p,p.name)
print('generated', OUT)
print('zip', zip_path)
