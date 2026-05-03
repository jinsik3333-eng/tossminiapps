from pathlib import Path
import math
import shutil
import zipfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path('/Users/jinsik/Desktop/Workspace/01_project_tossminiapps')
OUT_ROOT = ROOT / 'assets' / 'app-store'
FONT_PATH = '/System/Library/Fonts/AppleSDGothicNeo.ttc'


def font(size, weight=0):
    # AppleSDGothicNeo.ttc face indexes vary by macOS; 0 is safe and deterministic enough.
    try:
        return ImageFont.truetype(FONT_PATH, size=size, index=weight)
    except Exception:
        return ImageFont.truetype(FONT_PATH, size=size)

F_REG = lambda s: font(s, 0)
F_BOLD = lambda s: font(s, 6)


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size, c1, c2, vertical=True):
    w, h = size
    im = Image.new('RGB', size, c1)
    px = im.load()
    for y in range(h):
        for x in range(w):
            t = y / max(1, h - 1) if vertical else x / max(1, w - 1)
            px[x, y] = lerp(c1, c2, t)
    return im.convert('RGBA')


def rounded(draw, xy, r, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def text_size(draw, txt, f):
    b = draw.textbbox((0, 0), txt, font=f)
    return b[2] - b[0], b[3] - b[1]


def center_text(draw, y, txt, f, fill, w, stroke_width=0, stroke_fill=None):
    tw, th = text_size(draw, txt, f)
    draw.text(((w - tw) / 2, y), txt, font=f, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)
    return y + th


def wrap_text(draw, text, f, max_w):
    lines, cur = [], ''
    for token in text.split(' '):
        cand = token if not cur else cur + ' ' + token
        if text_size(draw, cand, f)[0] <= max_w:
            cur = cand
        else:
            if cur:
                lines.append(cur)
            cur = token
    if cur:
        lines.append(cur)
    out = []
    for line in lines:
        if text_size(draw, line, f)[0] <= max_w:
            out.append(line)
            continue
        buf = ''
        for ch in line:
            cand = buf + ch
            if text_size(draw, cand, f)[0] <= max_w:
                buf = cand
            else:
                out.append(buf)
                buf = ch
        if buf:
            out.append(buf)
    return out


def draw_phone(draw, x, y, w, h, bg='#ffffff'):
    shadow = Image.new('RGBA', (w + 50, h + 50), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((25, 25, w + 25, h + 25), radius=48, fill=(0, 0, 0, 62))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    return shadow


def paste_phone(canvas, x, y, w, h, app, screen_kind):
    phone = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(phone)
    rounded(d, (0, 0, w-1, h-1), 50, '#101318')
    rounded(d, (12, 12, w-13, h-13), 42, bg := app['screen_bg'])
    # status bar
    d.text((34, 31), '9:41', font=F_BOLD(18), fill=app['ink'])
    d.rounded_rectangle((w-94, 35, w-54, 49), radius=6, outline=app['muted'], width=2)
    d.rectangle((w-51, 40, w-47, 44), fill=app['muted'])
    d.ellipse((w/2-31, 27, w/2+31, 43), fill='#101318')
    # content
    if screen_kind == 'home':
        d.text((34, 86), app['short'], font=F_BOLD(28), fill=app['ink'])
        d.text((34, 126), app['home_sub'], font=F_REG(18), fill=app['muted'])
        draw_character(d, w//2, 275, 100, app, mood='hero')
        card_y = 410
        rounded(d, (34, card_y, w-34, card_y+152), 30, '#ffffff')
        d.text((58, card_y+28), app['card_title'], font=F_BOLD(24), fill=app['ink'])
        d.text((58, card_y+70), app['card_body'], font=F_REG(17), fill=app['muted'])
        rounded(d, (58, card_y+108, w-58, card_y+134), 13, app['soft'])
        d.text((75, card_y+109), app['pill'], font=F_BOLD(15), fill=app['accent'])
        rounded(d, (34, h-112, w-34, h-52), 25, app['accent'])
        center_text(d, h-94, app['cta'], F_BOLD(22), '#ffffff', w)
    elif screen_kind == 'quiz':
        d.text((34, 86), app['quiz_title'], font=F_BOLD(27), fill=app['ink'])
        d.text((34, 126), app['quiz_sub'], font=F_REG(18), fill=app['muted'])
        rounded(d, (34, 170, w-34, 214), 22, app['soft'])
        d.rectangle((34, 170, 34 + int((w-68)*0.64), 214), fill=app['accent'])
        d.text((52, 178), app['progress'], font=F_BOLD(16), fill='#ffffff')
        rounded(d, (34, 248, w-34, 395), 28, '#ffffff')
        d.text((58, 278), app['question'], font=F_BOLD(23), fill=app['ink'])
        y0 = 430
        for i, opt in enumerate(app['options']):
            fill = '#ffffff' if i != 1 else app['soft']
            outline = app['accent'] if i == 1 else '#E7E9EF'
            rounded(d, (34, y0+i*72, w-34, y0+55+i*72), 22, fill, outline, 2)
            d.text((60, y0+14+i*72), opt, font=F_BOLD(18), fill=app['ink'])
    elif screen_kind == 'result':
        d.text((34, 86), app['result_title'], font=F_BOLD(28), fill=app['ink'])
        d.text((34, 126), app['result_sub'], font=F_REG(18), fill=app['muted'])
        draw_character(d, w//2, 273, 96, app, mood='result')
        rounded(d, (34, 390, w-34, 560), 32, '#ffffff')
        d.text((58, 422), app['metric_big'], font=F_BOLD(36), fill=app['accent'])
        d.text((58, 472), app['metric_small'], font=F_REG(18), fill=app['muted'])
        y = 515
        for i in range(7):
            x0 = 58 + i*42
            rounded(d, (x0, y, x0+28, y+28), 10, app['accent'] if i < app['checks'] else '#EEF0F5')
        rounded(d, (34, h-112, w-34, h-52), 25, app['accent'])
        center_text(d, h-94, app['result_cta'], F_BOLD(21), '#ffffff', w)
    return phone


def draw_character(d, cx, cy, r, app, mood='hero'):
    accent = app['accent']
    soft = app['soft']
    if app['kind'] == 'monster':
        d.ellipse((cx-r, cy-r, cx+r, cy+r), fill=accent)
        d.polygon([(cx-r*0.62, cy-r*0.72), (cx-r*0.35, cy-r*1.18), (cx-r*0.10, cy-r*0.72)], fill=accent)
        d.polygon([(cx+r*0.12, cy-r*0.72), (cx+r*0.40, cy-r*1.20), (cx+r*0.62, cy-r*0.72)], fill=accent)
        d.ellipse((cx-r*0.48, cy-r*0.20, cx-r*0.12, cy+r*0.16), fill='#ffffff')
        d.ellipse((cx+r*0.12, cy-r*0.20, cx+r*0.48, cy+r*0.16), fill='#ffffff')
        d.ellipse((cx-r*0.34, cy-r*0.06, cx-r*0.20, cy+r*0.08), fill='#101318')
        d.ellipse((cx+r*0.20, cy-r*0.06, cx+r*0.34, cy+r*0.08), fill='#101318')
        d.arc((cx-r*0.37, cy+r*0.12, cx+r*0.37, cy+r*0.52), 0, 180, fill='#ffffff', width=7)
        d.rounded_rectangle((cx-r*1.32, cy+r*0.70, cx+r*1.32, cy+r*1.05), radius=22, fill=soft)
    else:
        # friendly ghost
        d.ellipse((cx-r, cy-r, cx+r, cy+r*0.72), fill='#ffffff', outline=accent, width=7)
        d.rectangle((cx-r, cy, cx+r, cy+r*0.85), fill='#ffffff')
        for i in range(4):
            x = cx-r + i*(2*r/3)
            d.pieslice((x, cy+r*0.48, x+2*r/3, cy+r*1.08), 0, 180, fill='#ffffff', outline=accent, width=6)
        d.ellipse((cx-r*0.42, cy-r*0.20, cx-r*0.18, cy+r*0.04), fill=accent)
        d.ellipse((cx+r*0.18, cy-r*0.20, cx+r*0.42, cy+r*0.04), fill=accent)
        d.arc((cx-r*0.28, cy+r*0.08, cx+r*0.28, cy+r*0.38), 0, 180, fill=accent, width=6)
        d.rounded_rectangle((cx-r*1.25, cy+r*0.82, cx+r*1.25, cy+r*1.15), radius=22, fill=soft)


def make_logo(app, dark=False):
    bg1, bg2 = (hex_to_rgb('#111827'), hex_to_rgb('#243042')) if dark else (hex_to_rgb(app['logo_bg1']), hex_to_rgb(app['logo_bg2']))
    im = gradient((600, 600), bg1, bg2)
    d = ImageDraw.Draw(im)
    for i, alpha in enumerate([45, 32, 20]):
        d.ellipse((65+i*40, 70+i*20, 535-i*10, 540-i*30), fill=(*hex_to_rgb(app['accent']), alpha))
    draw_character(d, 300, 265, 135, app, 'hero')
    center_text(d, 438, app['logo_text'], F_BOLD(54), '#ffffff', 600)
    center_text(d, 500, app['logo_sub'], F_BOLD(24), '#DCE4F2', 600)
    return im.convert('RGB')


def make_marketing(app, size, horizontal=False):
    w, h = size
    im = gradient(size, hex_to_rgb(app['hero_bg1']), hex_to_rgb(app['hero_bg2']), vertical=False)
    d = ImageDraw.Draw(im)
    for rr, aa, off in [(420, 34, 0), (280, 28, 130), (180, 20, -130)]:
        d.ellipse((w-rr-off, -rr//3+off//5, w+rr-off, rr*1.7+off//5), fill=(*hex_to_rgb('#FFFFFF'), aa))
    if horizontal:
        left = 96
        d.text((left, 110), app['title'], font=F_BOLD(72), fill='#ffffff')
        for i, line in enumerate(app['hero_lines']):
            d.text((left, 220+i*62), line, font=F_BOLD(42), fill='#EEF6FF')
        rounded(d, (left, 415, left+520, 487), 36, '#ffffff')
        center_text(d, 432, app['cta'], F_BOLD(28), app['accent'], left*2+520)
        phone = paste_phone(im, 0, 0, 360, 640, app, 'home')
        im.alpha_composite(phone, (w-520, 65))
        draw_character(d, w-670, 390, 90, app, 'hero')
    else:
        d.text((112, 128), app['title'], font=F_BOLD(82), fill='#ffffff')
        d.text((112, 235), app['thumb_sub'], font=F_BOLD(44), fill='#EEF6FF')
        d.text((112, 302), app['thumb_note'], font=F_REG(30), fill='#D7E6FF')
        rounded(d, (112, 395, 112+560, 477), 40, '#ffffff')
        d.text((152, 417), app['cta'], font=F_BOLD(32), fill=app['accent'])
        phone = paste_phone(im, 0, 0, 420, 700, app, 'home')
        im.alpha_composite(phone, (w-610, 70))
        draw_character(d, w-760, 530, 120, app, 'hero')
    return im.convert('RGB')


def make_screenshot(app, idx):
    w, h = 636, 1048
    im = gradient((w, h), hex_to_rgb(app['shot_bg1']), hex_to_rgb(app['shot_bg2']))
    d = ImageDraw.Draw(im)
    headline, sub, kind = app['screens'][idx-1]
    center_text(d, 54, headline, F_BOLD(48), '#ffffff', w)
    for j, line in enumerate(wrap_text(d, sub, F_BOLD(25), w-92)[:2]):
        center_text(d, 122+j*34, line, F_BOLD(25), '#EAF3FF', w)
    phone = paste_phone(im, 0, 0, 432, 710, app, kind)
    im.alpha_composite(phone, (102, 270))
    # caption panel
    rounded(d, (46, 908, w-46, 1010), 28, (255,255,255,235))
    for j, line in enumerate(wrap_text(d, app['captions'][idx-1], F_REG(24), w-116)[:2]):
        center_text(d, 932+j*33, line, F_REG(24), app['ink'], w)
    return im.convert('RGB')


def make_contact(app, folder):
    thumbs = []
    files = ['app-logo-600.png', 'app-logo-dark-600.png', 'thumbnail-1932x828.png', 'screenshot-01-636x1048.png', 'screenshot-02-636x1048.png', 'screenshot-03-636x1048.png', 'screenshot-horizontal-1504x741.png']
    canvas = Image.new('RGB', (1020, 810), '#F3F6FB')
    d = ImageDraw.Draw(canvas)
    d.text((34, 22), app['title'] + ' 이미지 패키지', font=F_BOLD(30), fill='#111827')
    positions = [(34, 78, 180, 180), (234, 78, 180, 180), (434, 78, 540, 231), (34, 330, 170, 280), (224, 330, 170, 280), (414, 330, 170, 280), (624, 330, 360, 177)]
    for f, (x,y,tw,th) in zip(files, positions):
        im = Image.open(folder/f).convert('RGB')
        im.thumbnail((tw, th), Image.LANCZOS)
        rounded(d, (x-6, y-6, x+tw+6, y+th+6), 18, '#FFFFFF')
        canvas.paste(im, (x + (tw-im.width)//2, y + (th-im.height)//2))
        d.text((x, y+th+14), f, font=F_REG(15), fill='#4B5563')
    return canvas


def cover_image(src, size, focus=(0.5, 0.5)):
    src = src.convert('RGB')
    tw, th = size
    scale = max(tw / src.width, th / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    src = src.resize((nw, nh), Image.LANCZOS)
    left = int((nw - tw) * focus[0])
    top = int((nh - th) * focus[1])
    return src.crop((left, top, left + tw, top + th)).convert('RGBA')


def overlay_scrim(im, alpha=72):
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w, h = im.size
    d.rectangle((0, 0, w, h), fill=(44, 24, 97, alpha))
    d.ellipse((-int(w * 0.24), -int(h * 0.32), int(w * 0.58), int(h * 0.72)), fill=(124, 58, 237, int(alpha * 0.45)))
    return Image.alpha_composite(im.convert('RGBA'), layer)


def make_source_logo(app, dark=False):
    im = cover_image(Image.open(app['source_icon']), (600, 600), focus=(0.5, 0.44))
    if dark:
        tint = Image.new('RGBA', (600, 600), '#121826')
        im = Image.blend(im, tint, 0.34)
        im = overlay_scrim(im, 42)
    d = ImageDraw.Draw(im)
    rounded(d, (68, 460, 532, 542), 42, (255, 255, 255, 228))
    center_text(d, 480, '구독유령', F_BOLD(44), app['accent'], 600)
    return im.convert('RGB')


def make_source_marketing(app, size, horizontal=False):
    im = cover_image(Image.open(app['source_landscape']), size, focus=(0.56, 0.5))
    im = overlay_scrim(im, 70 if horizontal else 78)
    d = ImageDraw.Draw(im)
    left = 96 if horizontal else 112
    d.text((left, 104 if horizontal else 120), app['title'], font=F_BOLD(66 if horizontal else 78), fill='#ffffff')
    if horizontal:
        for i, line in enumerate(app['hero_lines']):
            d.text((left, 214 + i * 58), line, font=F_BOLD(40), fill='#F2F7FF')
        d.text((left, 344), '내 답변을 바탕으로 참고 후보를 정리해요', font=F_REG(27), fill='#DCE9FF')
        rounded(d, (left, 430, left + 456, 502), 36, '#ffffff')
        center_text(d, 448, app['cta'], F_BOLD(29), app['accent'], left * 2 + 456)
    else:
        d.text((left, 228), app['thumb_sub'], font=F_BOLD(42), fill='#F2F7FF')
        d.text((left, 294), app['thumb_note'], font=F_REG(30), fill='#DCE9FF')
        rounded(d, (left, 394, left + 530, 476), 40, '#ffffff')
        d.text((left + 40, 417), app['cta'], font=F_BOLD(32), fill=app['accent'])
    return im.convert('RGB')


def make_source_screenshot(app, idx):
    w, h = 636, 1048
    im = cover_image(Image.open(app['source_portrait']), (w, h), focus=(0.52, 0.48))
    im = overlay_scrim(im, 78)
    d = ImageDraw.Draw(im)
    headline, sub, _kind = app['screens'][idx - 1]
    center_text(d, 58, headline, F_BOLD(47), '#ffffff', w)
    for j, line in enumerate(wrap_text(d, sub, F_BOLD(27), w - 92)[:2]):
        center_text(d, 126 + j * 36, line, F_BOLD(27), '#ECF6FF', w)
    panel_y = 738
    rounded(d, (52, panel_y, w - 52, panel_y + 146), 34, (255, 255, 255, 232))
    callouts = [
        ('구독 습관을 직접 점검', 'OTT·멤버십·클라우드 후보 확인'),
        ('민감정보 입력 없이 선택', '내 답변으로만 결과 구성'),
        ('내 답변 기준 후보', '정리 루틴까지 이어서 확인'),
    ]
    big, small = callouts[idx - 1]
    center_text(d, panel_y + 30, big, F_BOLD(31), app['ink'], w)
    center_text(d, panel_y + 82, small, F_REG(25), app['muted'], w)
    rounded(d, (104, 918, w - 104, 990), 36, app['accent'])
    center_text(d, 938, ['자가 점검 시작', '질문에 답하기', '정리 루틴 보기'][idx - 1], F_BOLD(28), '#ffffff', w)
    return im.convert('RGB')


def make_zip(folder, app_id):
    zpath = folder / f'{app_id}-appstore-assets.zip'
    if zpath.exists():
        zpath.unlink()
    names = ['app-logo-600.png','app-logo-dark-600.png','thumbnail-1932x828.png','screenshot-01-636x1048.png','screenshot-02-636x1048.png','screenshot-03-636x1048.png','screenshot-horizontal-1504x741.png','contact-sheet.png']
    with zipfile.ZipFile(zpath, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for name in names:
            z.write(folder/name, arcname=name)
    return zpath

APPS = {
    'daily-waste-quiz': {
        'kind':'monster','title':'오늘의 헛돈 방어전','short':'헛돈 방어전','logo_text':'헛돈방어','logo_sub':'5초 생활비 퀴즈',
        'home_sub':'매일 바뀌는 생활 습관 퀴즈','card_title':'오늘의 괴물 등장','card_body':'짧게 풀고\n습관을 확인해요','pill':'직접 고르는 3문제','cta':'5초 퀴즈 시작','card_title2':'',
        'accent':'#2F7DFF','soft':'#EAF2FF','ink':'#111827','muted':'#697386','screen_bg':'#F7FAFF',
        'logo_bg1':'#2F7DFF','logo_bg2':'#7C3AED','hero_bg1':'#2563EB','hero_bg2':'#7C3AED','shot_bg1':'#2563EB','shot_bg2':'#7C3AED',
        'thumb_sub':'매일 5초, 소비 습관 체크','thumb_note':'가볍게 보는 생활 루틴 콘텐츠',
        'hero_lines':['3문제만 빠르게 풀고','오늘의 생활 습관 확인'],
        'quiz_title':'5초 안에 탭!','quiz_sub':'3문제 · 직접 선택','progress':'2 / 3  진행 중','question':'배달 앱을 켰을 때\n먼저 볼 것은?','options':['바로 주문하기','냉장고와 계획 확인','기분 따라 고르기'],
        'result_title':'참여 완료','result_sub':'오늘의 퀴즈 결과','metric_big':'체크 완료','metric_small':'입력 답변 기준의 참고용 결과','checks':5,'result_cta':'오늘 루틴 보기',
        'screens':[('오늘의 헛돈 방어전','5초 안에 생활 습관 체크','home'),('5초 안에 탭!','3문제, 각 5초 제한','quiz'),('체크 완료','오늘의 선택 결과 확인','result')],
        'captions':['매일 새로운 생활비 괴물이 나타나요.','짧은 퀴즈로 소비 상황을 직접 확인해요.','결과 카드로 오늘의 참여를 남겨요.']
    },
    'subscription-ghost-finder': {
        'kind':'ghost','title':'구독료 유령 찾기','short':'구독료 유령','logo_text':'구독유령','logo_sub':'60초 자가 점검',
        'home_sub':'직접 답하는 구독 체크','card_title':'잊은 구독 후보','card_body':'답변을 바탕으로\n확인할 항목을 정리해요','pill':'직접 답변 기준','cta':'자가 점검 시작',
        'accent':'#7C3AED','soft':'#F0E9FF','ink':'#111827','muted':'#697386','screen_bg':'#FBFAFF',
        'logo_bg1':'#7C3AED','logo_bg2':'#06B6D4','hero_bg1':'#6D28D9','hero_bg2':'#0891B2','shot_bg1':'#6D28D9','shot_bg2':'#0891B2',
        'thumb_sub':'구독 습관 60초 자가 점검','thumb_note':'직접 답변으로 만드는 참고 콘텐츠',
        'hero_lines':['직접 답하고','확인할 구독 후보 정리'],
        'quiz_title':'직접 답하는 점검','quiz_sub':'내 선택으로만 결과 구성','progress':'5 / 8  진행 중','question':'요즘 거의 쓰지 않는\n구독이 있나요?','options':['없어요','애매해요','확인해볼래요'],
        'result_title':'답변 기반 후보 3개','result_sub':'직접 고른 답변의 참고 결과','metric_big':'후보 3개','metric_small':'직접 확인할 항목을 보기 쉽게 정리','checks':3,'result_cta':'정리 루틴 보기',
        'screens':[('구독료 유령 찾기','60초 자가 점검 시작','home'),('직접 답하는 구독 점검','입력한 선택으로만 결과를 만들어요','quiz'),('내 답변 기반 점검 후보','직접 입력한 답변 기준으로 정리','result')],
        'captions':['OTT·멤버십·클라우드 등 구독 습관을 직접 점검해요.','민감한 정보 입력 없이 선택한 답변으로만 진행해요.','답변 기준 참고 후보와 정리 루틴을 보여줘요.'],
        'source_icon':str(OUT_ROOT / 'subscription-ghost-finder' / 'sources' / 'ghost-icon-source.png'),
        'source_landscape':str(OUT_ROOT / 'subscription-ghost-finder' / 'sources' / 'ghost-landscape-source.png'),
        'source_portrait':str(OUT_ROOT / 'subscription-ghost-finder' / 'sources' / 'ghost-portrait-source.png')
    }
}

EXPECTED = {
    'app-logo-600.png': (600,600),
    'app-logo-dark-600.png': (600,600),
    'thumbnail-1932x828.png': (1932,828),
    'screenshot-01-636x1048.png': (636,1048),
    'screenshot-02-636x1048.png': (636,1048),
    'screenshot-03-636x1048.png': (636,1048),
    'screenshot-horizontal-1504x741.png': (1504,741),
    'contact-sheet.png': (1020,810),
}


def generate(app_id, app):
    folder = OUT_ROOT / app_id
    folder.mkdir(parents=True, exist_ok=True)
    if 'source_icon' in app:
        make_source_logo(app, False).save(folder/'app-logo-600.png', optimize=True)
        make_source_logo(app, True).save(folder/'app-logo-dark-600.png', optimize=True)
        make_source_marketing(app, (1932, 828), horizontal=False).save(folder/'thumbnail-1932x828.png', optimize=True)
        for idx in (1,2,3):
            make_source_screenshot(app, idx).save(folder/f'screenshot-0{idx}-636x1048.png', optimize=True)
        make_source_marketing(app, (1504, 741), horizontal=True).save(folder/'screenshot-horizontal-1504x741.png', optimize=True)
    else:
        make_logo(app, False).save(folder/'app-logo-600.png', optimize=True)
        make_logo(app, True).save(folder/'app-logo-dark-600.png', optimize=True)
        make_marketing(app, (1932, 828), horizontal=False).save(folder/'thumbnail-1932x828.png', optimize=True)
        for idx in (1,2,3):
            make_screenshot(app, idx).save(folder/f'screenshot-0{idx}-636x1048.png', optimize=True)
        make_marketing(app, (1504, 741), horizontal=True).save(folder/'screenshot-horizontal-1504x741.png', optimize=True)
    make_contact(app, folder).save(folder/'contact-sheet.png', optimize=True)
    zpath = make_zip(folder, app_id)
    print(f'[{app_id}]')
    for name, expected in EXPECTED.items():
        im = Image.open(folder/name)
        print(f'  {name}: {im.size} expected={expected} ok={im.size == expected}')
    print(f'  zip: {zpath} bytes={zpath.stat().st_size}')

if __name__ == '__main__':
    for app_id, app in APPS.items():
        generate(app_id, app)
