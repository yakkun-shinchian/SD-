#!/usr/bin/env python3
"""Compose extracted transparent layers and one narration clip per balloon.

Usage: python render_layer_reel.py PROJECT.json FINAL.mp4
PROJECT paths are relative to its directory. Requires Pillow and FFmpeg.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageFilter


def probe_duration(path):
    out = subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'default=noprint_wrappers=1:nokey=1', str(path)], text=True)
    return float(out.strip())


def run(project_path, output_path):
    project_path = Path(project_path).resolve()
    output_path = Path(output_path).resolve()
    data = json.loads(project_path.read_text(encoding='utf-8'))
    root = project_path.parent
    path = lambda name: (root / name).resolve()
    base = path(data['base'])
    total = float(data['duration'])
    if total <= 3:
        raise ValueError('The video needs time for narration and a final card')
    if Image.open(base).size != (1080, 1920):
        raise ValueError('base must measure 1080x1920')
    layers = data['layers']
    if not layers or not any(item['kind'] == 'title' for item in layers):
        raise ValueError('A separate title layer is required')
    if len([item for item in layers if item['kind'] == 'point']) != 1:
        raise ValueError('Exactly one final 国試POINT layer is required')
    point = next(item for item in layers if item['kind'] == 'point')
    if float(point['start']) < total - 3.5 or float(point['start']) > total - 2:
        raise ValueError('Show the 国試POINT for approximately the last three seconds')
    bubbles = [item for item in layers if item['kind'] == 'bubble']
    if not bubbles or any(not item.get('audio') for item in bubbles):
        raise ValueError('Every bubble needs a downloaded narration file')
    if len([item for item in layers if item['kind'] == 'title']) != 1:
        raise ValueError('Exactly one title layer is required')
    last_end = 0.0
    voices = []
    for item in bubbles:
        voice = path(item['audio'])
        if not voice.is_file() or voice.stat().st_size == 0:
            raise FileNotFoundError(f'Missing narration: {voice}')
        start = float(item['start'])
        dur = float(item['duration'])
        if start < last_end + .08:
            raise ValueError(f'Next bubble appears before previous voice ends: {item["image"]}')
        onset = start + dur + .12
        end = onset + probe_duration(voice)
        voices.append((voice, onset, end))
        last_end = end
    if float(point['start']) < last_end:
        raise ValueError('Last voice must end before the final 国試POINT appears')
    if layers != sorted(layers, key=lambda item: float(item['start'])):
        raise ValueError('Sort layers by start time; balloons must follow reading order')

    with tempfile.TemporaryDirectory(prefix='pathogen_reel_') as temp_name:
        temp = Path(temp_name)
        visual = []
        for item in layers:
            image = path(item['image'])
            if not image.is_file():
                raise FileNotFoundError(image)
            rendered = Image.open(image).convert('RGBA')
            if int(item['x']) < 0 or int(item['y']) < 0 or int(item['x']) + rendered.width > 1080 or int(item['y']) + rendered.height > 1920:
                raise ValueError(f'Layer outside video canvas: {image}')
            if item['kind'] == 'title':
                small = rendered.resize((round(rendered.width * .95), round(rendered.height * .95)), Image.Resampling.LANCZOS)
                soft = temp / 'title_soft.png'
                small.filter(ImageFilter.GaussianBlur(7)).save(soft)
                visual.append((soft, dict(item, kind='title_soft', x=int(item['x']) + (rendered.width-small.width)//2, y=int(item['y']) + (rendered.height-small.height)//2)))
            visual.append((image, item))

        cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
               '-loop', '1', '-framerate', '30', '-i', str(base)]
        for image, _ in visual:
            cmd += ['-loop', '1', '-framerate', '30', '-i', str(image)]
        for voice, _, _ in voices:
            cmd += ['-i', str(voice)]
        filters = []
        previous = '0:v'
        for i, (_, item) in enumerate(visual, 1):
            kind = item['kind']
            start = float(item['start'])
            duration = float(item['duration'])
            if duration <= 0:
                raise ValueError('Animation duration must be positive')
            if kind == 'title_soft':
                f = f'format=rgba,fade=t=in:st={start}:d=0.25:alpha=1,fade=t=out:st={start+0.55}:d=0.45:alpha=1'
            else:
                fade_start = start + .18 if kind == 'title' else start
                fade_duration = max(.1, duration - .18) if kind == 'title' else duration
                f = f'format=rgba,fade=t=in:st={fade_start}:d={fade_duration}:alpha=1'
            label = f'layer{i}'
            filters.append(f'[{i}:v]{f}[{label}]')
            x, y = int(item['x']), int(item['y'])
            progress = f'max(0\\,1-(t-{start})/{duration})'
            motion = item.get('motion', 'down') if kind == 'bubble' else 'none'
            if motion == 'down':
                yexpr = f'{y}-36*pow({progress}\\,2)'
                xexpr = str(x)
            elif motion in ('left', 'right'):
                direction = -40 if motion == 'left' else 40
                xexpr = f'{x}+{direction}*pow({progress}\\,2)'
                yexpr = str(y)
            elif motion == 'none':
                xexpr, yexpr = str(x), str(y)
            else:
                raise ValueError(f'Unknown motion: {motion}')
            output = f'v{i}'
            filters.append(f'[{previous}][{label}]overlay=x={xexpr}:y={yexpr}:shortest=1:format=auto[{output}]')
            previous = output
        filters.append(f'[{previous}]format=yuv420p[v]')
        first_audio_index = len(visual) + 1
        for i, (_, onset, _) in enumerate(voices):
            ms = round(onset * 1000)
            filters.append(f'[{first_audio_index+i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]')
        audio_inputs = ''.join(f'[a{i}]' for i in range(len(voices)))
        filters.append(f'{audio_inputs}amix=inputs={len(voices)}:duration=longest:dropout_transition=0,'
                       f'apad,atrim=duration={total},alimiter=limit=0.97[a]')
        cmd += ['-filter_complex', ';'.join(filters), '-map', '[v]', '-map', '[a]',
                '-t', str(total), '-r', '30', '-c:v', 'libx264', '-preset', 'veryfast',
                '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                '-movflags', '+faststart', '-pix_fmt', 'yuv420p', str(output_path)]
        subprocess.run(cmd, check=True)
    print(f'Wrote {output_path}; voices={len(voices)}; duration={probe_duration(output_path):.3f}s')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    run(sys.argv[1], sys.argv[2])
