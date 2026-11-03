"""CT-only, atomic annotation groups; all coordinates are source logical pixels."""
import math
import os
from functools import lru_cache
from PIL import ImageFont

CANDIDATES = [
    '/usr/local/share/fonts/NotoSansCJKjp-Regular.otf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf',
    '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc',
    'C:/Windows/Fonts/meiryo.ttc',
]

@lru_cache(maxsize=128)
def ct_font(path, size):
    f = ImageFont.truetype(path, size)
    # Reject missing-glyph/tofu fonts instead of silently emitting unreadable Japanese.
    masks = [bytes(f.getmask(c)) for c in '脳室頭蓋骨']
    if len(set(masks)) != len(masks) or not all(masks):
        raise ValueError('CT requires a Japanese font with anatomy glyphs')
    return f


def prepare_ct(tl):
    if tl.d.get('overlays'):
        raise ValueError('CT uses ct_annotations only; legacy overlays are not mixed')
    path = tl.p(tl.d['ct_font']) if tl.d.get('ct_font') else next((p for p in CANDIDATES if os.path.isfile(p)), None)
    if not path:
        raise ValueError('Install Noto Sans CJK JP or specify ct_font')
    ct_font(path, 48)
    out = []
    for group in tl.d.get('ct_annotations', []):
        start, dur = tl.t(group['start']), float(group.get('duration', 1.0))
        if not math.isfinite(start) or not math.isfinite(dur) or start < 0 or dur <= 0:
            raise ValueError('Invalid CT timing')
        first = math.ceil(start * tl.fps - 1e-9)
        count = max(1, int(math.floor(dur * tl.fps + .5)))
        if first + count > round(tl.duration * tl.fps):
            raise ValueError('CT annotation exceeds timeline duration')
        items = []
        for item in group['items']:
            item = dict(item)
            text = item['text']
            if not isinstance(text, str) or not text.strip() or '\n' in text:
                raise ValueError('CT label must be nonempty single-line text')
            points = [tl.point(p) for p in item['points']]
            at = tl.point(item['at_point'])
            if len(points) < 2:
                raise ValueError('CT leader requires at least two points')
            for x, y in points + [at]:
                if not all(math.isfinite(v) for v in (x,y)) or not (0 <= x <= tl.src_w and 0 <= y <= tl.src_h):
                    raise ValueError('CT point outside source')
            size, width = float(item.get('font', 48)), float(item.get('width', 3))
            if not math.isfinite(size) or size < 40 or not math.isfinite(width) or width <= 0:
                raise ValueError('CT font must be >=40 output pixels at width 1080; width must be positive')
            # Also validate every label glyph, not just the font's sample characters.
            f = ct_font(path, 48)
            missing = bytes(f.getmask(chr(0x10ffff)))
            if any(bytes(f.getmask(c)) == missing for c in text if not c.isspace()):
                raise ValueError('CT label contains unsupported glyph')
            item.update(points=points, at_point=at, font=size, width=width)
            items.append(item)
        if not items:
            raise ValueError('CT annotation group is empty')
        out.append(dict(type='ct_group', items=items, font_path=path,
                        _first=first, _count=count, _t0=first/tl.fps, _dur=count/tl.fps))
    return out


def draw_ct(o, t, pt, tl, color, ss):
    frame = math.floor(t * tl.fps + 1e-7)
    if not o['_first'] <= frame < o['_first'] + o['_count']:
        return
    d = pt.L()
    scale = tl.W / 1080
    for item in o['items']:
        col = color(item.get('color', '#52ddff'))
        pts = item['points']
        # Width and type size remain screen-sized while endpoints follow the camera.
        pt.stroke(pts, col, item['width'] * scale / pt.s)
        f = ct_font(o['font_path'], max(1, round(item['font'] * scale * ss)))
        pos = pt.P(*item['at_point'])
        bb = d.textbbox(pos, item['text'], font=f, anchor='mm')
        pad = 8 * scale * ss
        box = [bb[0]-pad, bb[1]-pad, bb[2]+pad, bb[3]+pad]
        if box[0] < 0 or box[1] < 0 or box[2] > tl.W*ss or box[3] > tl.H*ss:
            raise ValueError('CT label clipped by camera/output')
        for p in pts:
            x,y = pt.P(*p)
            if not (0 <= x < tl.W*ss and 0 <= y < tl.H*ss):
                raise ValueError('CT leader clipped by camera/output')
        d.rounded_rectangle(box, radius=8*scale*ss, fill=(5,15,29,255))
        d.text(pos, item['text'], font=f, anchor='mm', fill=col+(255,))
