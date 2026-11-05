"""Non-clinical geometric fixture: no patient data or anatomical claims."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
p = Path(__file__).parent
im = Image.new('RGB', (1080,1920), '#05101d')
d = ImageDraw.Draw(im)
d.text((540,120), 'RENDER TEST - NOT ANATOMY', anchor='mm', fill='white', font=ImageFont.truetype('DejaVuSans.ttf',30))
d.ellipse((250,450,830,1300), fill='#5a6069', outline='white', width=8)
for x,y in [(400,650),(680,800),(500,1100)]:
    d.ellipse((x-10,y-10,x+10,y+10), fill='white')
im.save(p/'fixture.png')
