from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import qrcode, urllib.parse, zipfile

ROOT = Path('/Users/macmonster/Desktop/STL_Diving_Website')
OUT = ROOT / 'marketing' / 'tv-display'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 3840, 2160
BLUE = '#223f99'
BLUE2 = '#14265e'
RED = '#ed1c2a'
WHITE = '#ffffff'
CYAN = '#bfefff'

font_black = '/System/Library/Fonts/Supplemental/Arial Black.ttf'
font_bold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
font_reg = '/System/Library/Fonts/Supplemental/Arial.ttf'
def font(size, bold=False, black=False):
    return ImageFont.truetype(font_black if black else font_bold if bold else font_reg, size)

def cover(im, size, focus_x=0.52, focus_y=0.45):
    tw, th = size
    iw, ih = im.size
    scale = max(tw/iw, th/ih)
    nw, nh = int(iw*scale), int(ih*scale)
    im = im.resize((nw, nh), Image.LANCZOS)
    left = int((nw - tw) * focus_x)
    top = int((nh - th) * focus_y)
    left = max(0, min(left, nw-tw)); top=max(0,min(top,nh-th))
    return im.crop((left, top, left+tw, top+th))

def text_width(d, text, f):
    b=d.textbbox((0,0), text, font=f); return b[2]-b[0]

# Background: use a real STL Diving site photo and make it TV-safe.
bg = Image.open(ROOT/'assets/photos/dive-tuck-over-pool.jpg').convert('RGB')
bg = cover(bg, (W,H), 0.56, 0.50).filter(ImageFilter.GaussianBlur(1.0))
img = bg.convert('RGBA')

# Dark blue overlay gradient for strong readability.
overlay = Image.new('RGBA', (W,H), (0,0,0,0))
od = ImageDraw.Draw(overlay)
for x in range(W):
    t = x / W
    alpha = int(225 - 70*t)
    od.line((x,0,x,H), fill=(10,27,78,alpha))
# lower contrast band
for y in range(H):
    t=y/H
    if t > .62:
        a=int((t-.62)/.38*80)
        od.line((0,y,W,y), fill=(0,10,35,a))
img = Image.alpha_composite(img, overlay)
d = ImageDraw.Draw(img)

# Brand accent bars.
d.rounded_rectangle((180,145,1450,165), radius=10, fill=RED)
d.rounded_rectangle((180,175,1980,196), radius=10, fill=WHITE)

# Logo panel.
logo = Image.open(ROOT/'assets/stl-diving-logo-transparent.png').convert('RGBA')
logo.thumbnail((330, 420), Image.LANCZOS)
logo_panel = Image.new('RGBA', (430,430), (255,255,255,238))
pd = ImageDraw.Draw(logo_panel)
pd.rounded_rectangle((0,0,430,430), radius=52, fill=(255,255,255,238), outline=(255,255,255,255), width=4)
logo_panel.alpha_composite(logo, ((430-logo.width)//2, (430-logo.height)//2))
img.alpha_composite(logo_panel, (185,245))

# Main text.
x0=690
d.text((x0,260), 'STL DIVING', font=font(104, black=True), fill=WHITE)
d.text((x0,395), 'LEARN TO DIVE', font=font(188, black=True), fill=WHITE)
d.text((x0,595), 'OR SHARPEN YOUR SKILLS', font=font(118, black=True), fill=CYAN)

# Simple support copy — readable from across a room.
d.text((x0,790), 'Springboard • Tower • High School Prep • Club Training', font=font(54, bold=True), fill=(245,250,255,245))

# Use the user's existing STL Diving REGISTER QR panel from the approved flyer.
qr_source = OUT / 'stl-diving-existing-register-qr-crop.png'
if not qr_source.exists():
    flyer = Image.open(ROOT.parent / 'STL_Diving_Learn_to_Dive_Flyer.png').convert('RGBA')
    flyer.crop((1770,2380,2310,2910)).save(qr_source)
qr_panel = Image.open(qr_source).convert('RGBA')
qr_panel.thumbnail((560, 475), Image.LANCZOS)

# QR card right side.
card_x, card_y, card_w, card_h = 2840, 1130, 780, 720
d.rounded_rectangle((card_x,card_y,card_x+card_w,card_y+card_h), radius=46, fill=(255,255,255,245), outline=(255,255,255,255), width=5)
d.text((card_x+70, card_y+72), 'SCAN TO REGISTER', font=font(54, black=True), fill=BLUE2)
img.alpha_composite(qr_panel, (card_x+(card_w-qr_panel.width)//2, card_y+190))

# Bottom ribbon.
d.rounded_rectangle((180,1835,2500,1992), radius=38, fill=(237,28,42,235))
d.text((250,1878), 'Build confidence. Improve technique. Have fun.', font=font(66, black=True), fill=WHITE)

# Small safety/placement note.
d.text((190,2040), 'ST. LOUIS, MO  |  BEGINNER TO COMPETITIVE DIVERS', font=font(42, bold=True), fill=(255,255,255,230))

png = OUT/'stl-diving-tv-display-4k.png'
jpg = OUT/'stl-diving-tv-display-4k.jpg'
pdf = OUT/'stl-diving-tv-display-4k.pdf'
img_rgb = img.convert('RGB')
img_rgb.save(png, quality=95)
img_rgb.save(jpg, quality=95, subsampling=0)
img_rgb.save(pdf, 'PDF', resolution=300.0)

# also a smaller 1080p preview for quick texting
preview = img_rgb.resize((1920,1080), Image.LANCZOS)
preview.save(OUT/'stl-diving-tv-display-1080p-preview.jpg', quality=92, subsampling=0)

zip_path = OUT/'STL_Diving_TV_Display_Marketing_Material.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in [png,jpg,pdf,OUT/'stl-diving-tv-display-1080p-preview.jpg']:
        z.write(p, p.relative_to(ROOT))

print('QR_SOURCE=' + str(qr_source))
print(png)
print(jpg)
print(pdf)
print(zip_path)
