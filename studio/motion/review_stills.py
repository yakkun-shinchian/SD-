#!/usr/bin/env python3
"""Reproducible contact sheet: renders original pixels via the production renderer.
Captions live outside each frame; placeholder timing is never presented as audio QA.
"""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from render import Timeline, Camera, prepare_overlays, render_frame
from emphasis import preview_segments, validate_frames


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('timeline')
    ap.add_argument('outdir')
    args = ap.parse_args()
    out = Path(args.outdir)
    out.mkdir(parents=True, exist_ok=True)
    tl = Timeline(args.timeline)
    tl.preview = True
    tl.duration = preview_segments(tl)+float(tl.d.get('tail', 1.2))
    cam = Camera(tl)
    overlays = prepare_overlays(tl)
    report = validate_frames(tl, cam, overlays)
    (out/'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17) if Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf').exists() else ImageFont.load_default()
    width, height = 270, 480
    sheet = Image.new('RGB', (width*4, (height+54)*len(overlays)+60), '#eef2f6')
    draw = ImageDraw.Draw(sheet)
    draw.text((12, 10), 'M3 / M4 - GEOMETRY PREVIEW ONLY - NO AUDIO VERIFIED', font=font, fill='black')
    review_frames = []
    for row, o in enumerate(overlays):
        times = [('before',o['_t0']-1/tl.fps), ('marked',o['_t0']+o['_dur']),
                 ('fading',o['_until']+o['_fade']/2), ('cleared',o['_until']+o['_fade'])]
        for col, (stage, t) in enumerate(times):
            frame = render_frame(tl, cam, overlays, t)
            name = f"{row:02d}_{o['target']}_{stage}.png"
            frame.save(out/name)
            x,y = col*width,60+row*(height+54)
            sheet.paste(frame.resize((width,height),Image.Resampling.LANCZOS),(x,y))
            draw.text((x+6,y+height+3), f"{o['target']} / {stage}",font=font,fill='black')
            draw.text((x+6,y+height+25), f'preview {t:.3f}s',font=font,fill='#394457')
            review_frames.append({'file':name,'preview_time':t,'stage':stage,'target':o['target']})
    sheet.save(out/'contact_sheet.png')
    (out/'stills.json').write_text(json.dumps(review_frames,indent=2)+'\n')
    print(out/'contact_sheet.png')


if __name__ == '__main__':
    main()
