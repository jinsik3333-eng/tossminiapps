from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math, textwrap, zipfile

OUT = Path('/Users/jinsik/Desktop/Workspace/01_project_tossminiapps/assets/app-store/money-leak-test')
OUT.mkdir(parents=True, exist_ok=True)
ICON_SRC = Path('/Users/jinsik/.hermes/cache/images/openai_codex_gpt-image-2-high_20260502_212147_02fae8e2.png')
LAND_SRC = Path('/Users/jinsik/.hermes/cache/images/openai_codex_gpt-image-2-high_20260502_212243_fa4a4176.png')
PORT_SRC = Path('/Users/jinsik/.hermes/cache/images/openai_codex_gpt-image-2-high_20260502_212343_d04f520b.png')
FONT = '/System/Library/Fonts/AppleSDGothicNeo.ttc'

def font(size, weight=0):
    # AppleSDGothicNeo.ttc faces vary by index; 0 is regular enough, 5 tends bold on macOS.
    idx = 5 if weight >= 700 else 3 if weight >= 600 else 0
    try:
        return ImageFont.truetype(FONT, size, index=idx)
    except Exception:
        return ImageFont.truetype(FONT, size)

def cover_resize(img, size):
    img = img.convert('RGB')
    sw, sh = size
    r = max(sw/img.width, sh/img.height)
    nw, nh = int(img.width*r), int(img.height*r)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    return img.crop(((nw-sw)//2, (nh-sh)//2, (nw+sw)//2, (nh+sh)//2))

def fit_resize(img, size):
    img = img.convert('RGBA')
    sw, sh = size
    r = min(sw/img.width, sh/img.height)
    nw, nh = int(img.width*r), int(img.height*r)
    return img.resize((nw, nh), Image.Resampling.LANCZOS)

def rr(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def shadow(canvas, xy, radius, blur=22, alpha=50, offset=(0,10)):
    layer = Image.new('RGBA', canvas.size, (0,0,0,0))
    d=ImageDraw.Draw(layer)
    x1,y1,x2,y2=xy
    d.rounded_rectangle((x1+offset[0],y1+offset[1],x2+offset[0],y2+offset[1]), radius=radius, fill=(30,60,100,alpha))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))

def text(draw, xy, s, size, fill=(20,28,45), weight=400, anchor=None, align='left', spacing=4):
    return draw.multiline_text(xy, s, font=font(size,weight), fill=fill, anchor=anchor, align=align, spacing=spacing)

def wrapped(s, chars):
    return '\n'.join(textwrap.wrap(s, width=chars, break_long_words=False))

def gradient(size, top=(245,250,255), bottom=(224,246,238)):
    w,h=size
    im=Image.new('RGB',size)
    px=im.load()
    for y in range(h):
        t=y/(h-1)
        col=tuple(int(top[i]*(1-t)+bottom[i]*t) for i in range(3))
        for x in range(w): px[x,y]=col
    return im.convert('RGBA')

def add_blob(bg, center, r, color, blur=50):
    layer=Image.new('RGBA',bg.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
    x,y=center
    d.ellipse((x-r,y-r,x+r,y+r), fill=color)
    bg.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))

# 1) App logo 600x600
src_icon = Image.open(ICON_SRC)
base = gradient((600,600), (247,251,255), (225,244,255))
add_blob(base,(450,130),150,(73,133,255,60),45); add_blob(base,(120,500),160,(52,211,153,55),55)
icon = cover_resize(src_icon, (520,520)).convert('RGBA')
# rounded mask for icon source to avoid hard edge
mask=Image.new('L',(520,520),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,520,520), radius=120, fill=255)
shadow(base,(50,50,550,550),120,28,45,(0,16))
base.paste(icon,(40,40),mask)
base.save(OUT/'app-logo-600.png')

# 2) Dark logo 600x600
base = gradient((600,600), (14,24,46), (4,12,28))
add_blob(base,(455,120),170,(49,130,246,75),50); add_blob(base,(150,470),150,(37,211,102,55),55)
# same generated object in circular glass card
card=Image.new('RGBA',(520,520),(0,0,0,0)); cd=ImageDraw.Draw(card)
cd.rounded_rectangle((0,0,520,520), radius=126, fill=(245,250,255,24), outline=(255,255,255,40), width=3)
base.alpha_composite(card,(40,40))
icon = cover_resize(src_icon, (490,490)).convert('RGBA')
mask=Image.new('L',(490,490),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,490,490), radius=112, fill=230)
base.paste(icon,(55,55),mask)
base.save(OUT/'app-logo-dark-600.png')

# Common phone mockup drawing
BLUE=(49,130,246); MINT=(24,185,129); NAVY=(24,31,54); MUTED=(104,118,140)

def draw_phone(canvas, xy, scale=1, screen='intro'):
    x,y,w,h = xy
    d=ImageDraw.Draw(canvas)
    shadow(canvas, (x,y,x+w,y+h), int(40*scale), blur=int(28*scale), alpha=45, offset=(0,int(14*scale)))
    rr(d,(x,y,x+w,y+h),int(42*scale),(24,31,54),None)
    rr(d,(x+int(10*scale),y+int(10*scale),x+w-int(10*scale),y+h-int(10*scale)),int(35*scale),(248,251,255),None)
    # status
    text(d,(x+int(35*scale),y+int(38*scale)),'12:45',int(18*scale),NAVY,700)
    rr(d,(x+int(185*scale),y+int(38*scale),x+int(255*scale),y+int(45*scale)),int(5*scale),(210,220,235))
    content_y=y+int(88*scale)
    if screen=='intro':
        text(d,(x+int(36*scale),content_y),'요즘 카드값 보고\n뜨끔했다면',int(20*scale),(75,92,120),600,spacing=int(4*scale))
        text(d,(x+int(36*scale),content_y+int(75*scale)),'월급이 새는 구멍,\n60초 만에 찾아봐',int(33*scale),NAVY,800,spacing=int(3*scale))
        # visual card
        rr(d,(x+int(32*scale),content_y+int(185*scale),x+w-int(32*scale),content_y+int(390*scale)),int(28*scale),(232,243,255))
        d.ellipse((x+int(95*scale),content_y+int(260*scale),x+int(185*scale),content_y+int(350*scale)), fill=(16,24,39))
        d.text((x+int(110*scale),content_y+int(286*scale)),'돈구멍',font=font(int(18*scale),700), fill=(255,255,255))
        rr(d,(x+int(175*scale),content_y+int(230*scale),x+int(300*scale),content_y+int(315*scale)),int(22*scale),BLUE)
        text(d,(x+int(194*scale),content_y+int(258*scale)),'월급\n지갑',int(18*scale),(255,255,255),700,spacing=0)
        for i in range(5):
            cx=x+int((105+i*37)*scale); cy=content_y+int((218+i%2*22)*scale)
            d.ellipse((cx,cy,cx+int(28*scale),cy+int(28*scale)), fill=(255,202,75), outline=(232,154,35), width=max(1,int(2*scale)))
        rr(d,(x+int(36*scale),y+h-int(120*scale),x+w-int(36*scale),y+h-int(62*scale)),int(22*scale),BLUE)
        text(d,(x+w//2,y+h-int(91*scale)),'내 돈구멍 60초 진단하기',int(18*scale),(255,255,255),700,anchor='mm')
    elif screen=='quiz':
        text(d,(x+int(36*scale),content_y),'Q3. 월급날 이후\n가장 먼저 하는 일은?',int(27*scale),NAVY,800,spacing=int(4*scale))
        opts=['배달앱부터 열어본다','구독 결제를 확인한다','편의점에서 소소하게 쓴다']
        oy=content_y+int(120*scale)
        for i,o in enumerate(opts):
            fy=oy+i*int(82*scale)
            rr(d,(x+int(34*scale),fy,x+w-int(34*scale),fy+int(62*scale)),int(20*scale),(255,255,255), (224,232,244), width=max(1,int(2*scale)))
            text(d,(x+int(58*scale),fy+int(31*scale)),o,int(18*scale),NAVY,600,anchor='lm')
        rr(d,(x+int(36*scale),y+h-int(150*scale),x+w-int(36*scale),y+h-int(138*scale)),int(6*scale),(225,235,250))
        rr(d,(x+int(36*scale),y+h-int(150*scale),x+int(210*scale),y+h-int(138*scale)),int(6*scale),MINT)
        text(d,(x+int(36*scale),y+h-int(110*scale)),'8문항으로 가볍게 확인',int(18*scale),MUTED,600)
    else:
        text(d,(x+int(36*scale),content_y),'내 돈구멍 유형',int(18*scale),MUTED,600)
        text(d,(x+int(36*scale),content_y+int(36*scale)),'배달 누수형',int(34*scale),NAVY,800)
        rr(d,(x+int(32*scale),content_y+int(92*scale),x+w-int(32*scale),content_y+int(265*scale)),int(26*scale),(232,246,255))
        d.ellipse((x+int(75*scale),content_y+int(155*scale),x+int(155*scale),content_y+int(235*scale)), fill=(16,24,39))
        text(d,(x+int(115*scale),content_y+int(195*scale)),'돈구멍',int(14*scale),(255,255,255),700,anchor='mm')
        rr(d,(x+int(205*scale),content_y+int(140*scale),x+int(315*scale),content_y+int(215*scale)),int(20*scale),BLUE)
        for i in range(4):
            cx=x+int((152+i*34)*scale); cy=content_y+int((130+i%2*25)*scale)
            d.ellipse((cx,cy,cx+int(24*scale),cy+int(24*scale)), fill=(255,202,75), outline=(232,154,35))
        text(d,(x+int(36*scale),content_y+int(295*scale)),'오늘 막은 구멍 4/5',int(19*scale),NAVY,700)
        for i in range(5):
            px=x+int((38+i*55)*scale); py=content_y+int(334*scale)
            rr(d,(px,py,px+int(42*scale),py+int(42*scale)),int(14*scale),MINT if i<4 else (235,240,248))
        rr(d,(x+int(36*scale),y+h-int(130*scale),x+w-int(36*scale),y+h-int(72*scale)),int(22*scale),MINT)
        text(d,(x+w//2,y+h-int(101*scale)),'짧은 광고 보고 절약 배지 받기',int(16*scale),(255,255,255),700,anchor='mm')

# 3) Thumbnail 1932x828
land=cover_resize(Image.open(LAND_SRC),(1932,828)).convert('RGBA')
over=Image.new('RGBA',(1932,828),(255,255,255,0)); od=ImageDraw.Draw(over)
# soft white gradient overlay left
for x in range(1200):
    a=int(238*(1-x/1200))
    od.line((x,0,x,828), fill=(246,250,255,a))
land.alpha_composite(over)
add_blob(land,(250,650),280,(52,211,153,55),65)
text(ImageDraw.Draw(land),(112,118),'돈 새는 구멍 테스트',58,(31,54,92),700)
text(ImageDraw.Draw(land),(112,205),'월급이 새는 구멍,\n60초 만에 확인해요',92,(13,26,54),800,spacing=8)
text(ImageDraw.Draw(land),(118,445),'배달비 · 구독료 · 편의점 · 택시비\n일상 소비 습관을 확인해요',45,(82,100,130),600,spacing=8)
rr(ImageDraw.Draw(land),(118,625,500,700),32,BLUE)
text(ImageDraw.Draw(land),(309,663),'소비 누수 진단하기',34,(255,255,255),700,anchor='mm')
land.save(OUT/'thumbnail-1932x828.png')

# vertical screenshots
for idx,(screen,title,sub) in enumerate([
    ('intro','첫 화면에서 바로 시작','가입 없이 8문항, 60초 진단'),
    ('quiz','내 소비 패턴을 선택','배달비·구독료·편의점 습관 체크'),
    ('result','결과 카드와 절약 루틴','공유하고 오늘의 배지까지')], start=1):
    bg=gradient((636,1048),(247,251,255),(231,247,241))
    add_blob(bg,(520,160),170,(49,130,246,60),45); add_blob(bg,(110,880),210,(52,211,153,50),70)
    d=ImageDraw.Draw(bg)
    text(d,(54,58),title,42,NAVY,800)
    text(d,(56,114),sub,24,(85,102,128),600)
    draw_phone(bg,(132,190,372,750),scale=0.86,screen=screen)
    # bottom caption card: keep the copy optically centered, not bottom-heavy.
    rr(d,(48,898,588,996),28,(255,255,255,235),(224,232,244),2)
    if idx==1:
        cap='카드값이 낯설게 커졌다면, 어디서 새는지 먼저 확인해요.'
    elif idx==2:
        cap='일상 선택지만 눌러도 내 소비 습관 유형이 정리돼요.'
    else:
        cap='광고 기반 배지와 공유 루틴으로 가볍게 마무리해요.'
    text(d,(78,925),wrapped(cap,19),26,NAVY,700,spacing=5)
    bg.save(OUT/f'screenshot-{idx:02d}-636x1048.png')

# horizontal screenshot 1504x741
bg=gradient((1504,741),(246,250,255),(230,247,240))
add_blob(bg,(1240,130),250,(49,130,246,60),65); add_blob(bg,(230,610),260,(52,211,153,55),75)
d=ImageDraw.Draw(bg)
text(d,(90,88),'60초 소비 습관 진단',42,(74,95,124),700)
text(d,(90,152),'월급이 어디로 새는지\n결과 카드로 확인해요',66,NAVY,800,spacing=8)
text(d,(96,340),'배달비, 구독료, 편의점, 택시비처럼\n일상에서 자주 새는 소비 패턴을 가볍게 점검합니다.',34,(82,100,130),600,spacing=8)
rr(d,(96,510,420,582),30,BLUE)
text(d,(258,546),'소비 누수 진단 시작',28,(255,255,255),700,anchor='mm')
draw_phone(bg,(735,70,300,600),scale=0.74,screen='intro')
draw_phone(bg,(980,95,300,600),scale=0.74,screen='result')
bg.save(OUT/'screenshot-horizontal-1504x741.png')

# make contact sheet
files=['app-logo-600.png','app-logo-dark-600.png','thumbnail-1932x828.png','screenshot-01-636x1048.png','screenshot-02-636x1048.png','screenshot-03-636x1048.png','screenshot-horizontal-1504x741.png']
thumbs=[]
for f in files:
    im=Image.open(OUT/f).convert('RGB')
    im.thumbnail((320,220),Image.Resampling.LANCZOS)
    canvas=Image.new('RGB',(340,270),'white')
    canvas.paste(im,((340-im.width)//2,10))
    dd=ImageDraw.Draw(canvas)
    dd.text((14,235),f,font=font(16,600),fill=(20,28,45))
    thumbs.append(canvas)
sheet=Image.new('RGB',(1020,810),(242,246,250))
for i,t in enumerate(thumbs):
    sheet.paste(t,((i%3)*340,(i//3)*270))
sheet.save(OUT/'contact-sheet.png')

zip_path=OUT/'money-leak-test-appstore-assets.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for f in files:
        z.write(OUT/f, arcname=f)
print('created')
for f in files+['contact-sheet.png','money-leak-test-appstore-assets.zip']:
    p=OUT/f
    im=None
    if p.suffix.lower() in ['.png','.jpg','.jpeg']:
        im=Image.open(p)
        print(f, im.size, p.stat().st_size)
    else:
        print(f, p.stat().st_size)
