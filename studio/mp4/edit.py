#!/usr/bin/env python3
"""Local-only MP4 assembly. No generation, network access or M3/M4 imports."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

VERSION = 1

NEON_GREEN = {'font': 'Noto Sans CJK JP', 'size': 96, 'color': '#39FF14',
              'glow': {'blur': 10, 'strength': 0.65}}


def speed(a):
    value = number(a.get('speed', 1), 'audio.speed', .5)
    if value > 2:
        raise ValueError('audio.speed must be between 0.5 and 2')
    return value


def run(args, cwd=None):
    p = subprocess.run([str(x) for x in args], cwd=cwd, capture_output=True)
    if p.returncode:
        raise ValueError(p.stderr.decode(errors='replace')[-4000:])
    return p.stdout


def probe(path):
    return json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path]))


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return h.hexdigest()


def digest(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()


def number(v, name, minimum=0):
    if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or v < minimum:
        raise ValueError(f'{name}: invalid number {v!r}')
    return v


def existing(path):
    if not path.is_file():
        raise ValueError(f'Input file missing: {path}')
    return path


def load(path):
    d = json.loads(path.read_text(encoding='utf-8'))
    if d.get('version') != 1:
        raise ValueError('manifest version must be 1')
    base = path.parent
    out = d.get('output', {})
    w, h = out.get('size', [1080, 1920])
    fps = out.get('fps', 30)
    for n, v in [('width', w), ('height', h), ('fps', fps)]:
        number(v, n, 1)
        if int(v) != v:
            raise ValueError(f'{n} must be an integer')
    if w % 2 or h % 2:
        raise ValueError('output dimensions must be even')
    scenes, cues, offset, ids = [], [], 0, set()
    for s in d['scenes']:
        if not isinstance(s.get('id'), str) or s['id'] in ids:
            raise ValueError('scene id must be a unique string')
        ids.add(s['id'])
        start = number(s['in'], 'scene.in')
        end = number(s['out'], 'scene.out')
        if end <= start:
            raise ValueError('scene.out must exceed scene.in')
        # Quantize each scene once; concatenation then has an exact frame count.
        frames = round((end-start)*fps)
        if frames < 1:
            raise ValueError('scene shorter than one output frame')
        duration = frames/fps
        scenes.append({'id': s['id'], 'file': str((base/s['file']).resolve()),
                       'in': start, 'out': end, 'frames': frames})
        for c in s.get('subtitles', []):
            a = number(c.get('start', 0), 'subtitle.start')
            b = number(c.get('end', duration), 'subtitle.end')
            if 'audio_index' in c:
                index = c['audio_index']
                tracks = d.get('audio', [])
                if type(index) is not int or not 0 <= index < len(tracks):
                    raise ValueError('Invalid subtitle audio_index')
                track = tracks[index]
                if 'start' not in c or 'end' not in c or track.get('out') is None:
                    raise ValueError('Audio-linked subtitles require start, end and explicit audio.out')
                trim = number(track.get('in', 0), 'audio.in')
                stop = number(track['out'], 'audio.out')
                if not trim <= a < b <= stop:
                    raise ValueError('subtitle timing outside audio trim')
                at = number(track.get('at', 0), 'audio.at')
                a, b = (at+(a-trim)/speed(track)-offset,
                        at+(b-trim)/speed(track)-offset)
            if not 0 <= a < b <= duration + 1e-6:
                raise ValueError('subtitle timing outside scene')
            preset = d.get('subtitle_preset')
            if preset not in (None, 'neon_green'):
                raise ValueError('Unknown subtitle_preset')
            style = dict(NEON_GREEN if preset else {})
            style.update(d.get('subtitle_style', {}))
            if preset:
                style.setdefault('position', [w/2, h*.18])
            style.update(c.get('style', {}))
            cues.append({'start': offset+a, 'end': offset+b, 'text': c['text'], 'style': style})
        offset += duration
    if not scenes:
        raise ValueError('at least one scene required')
    if 'max_duration' in out and offset > number(out['max_duration'], 'max_duration', .01):
        raise ValueError('Output exceeds max_duration')
    audio = []
    for a in d.get('audio', []):
        audio.append({'file': str((base/a['file']).resolve()),
                      'at': number(a.get('at', 0), 'audio.at'),
                      'in': number(a.get('in', 0), 'audio.in'),
                      'out': a.get('out'), 'volume': number(a.get('volume', 1), 'audio.volume')})
        speed(a)  # Validate even when there are no linked subtitles.
        if 'speed' in a:
            audio[-1]['speed'] = a['speed']
    plan = {'version': VERSION, 'size': [w, h], 'fps': fps, 'scenes': scenes, 'audio': audio}
    return plan, cues, offset


def validate_inputs(plan, duration):
    fingerprints = {}
    for scene in plan['scenes']:
        p = existing(Path(scene['file']))
        data = probe(p)
        streams = [s for s in data['streams'] if s['codec_type'] == 'video']
        if not streams:
            raise ValueError(f'No video stream: {p}')
        length = float(streams[0].get('duration', data['format']['duration']))
        if scene['out'] > length + .001:
            raise ValueError(f'Trim exceeds video duration: {p}')
        fingerprints[str(p)] = sha(p)
    for a in plan['audio']:
        p = existing(Path(a['file']))
        data = probe(p)
        streams = [s for s in data['streams'] if s['codec_type'] == 'audio']
        if not streams:
            raise ValueError(f'No audio stream: {p}')
        length = float(streams[0].get('duration', data['format']['duration']))
        end = length if a['out'] is None else number(a['out'], 'audio.out')
        if not a['in'] < end <= length + .001:
            raise ValueError(f'Invalid audio trim: {p}')
        if a['at'] + (end-a['in'])/speed(a) > duration + .001:
            raise ValueError('Audio would be cut off; extend scene selection or explicitly trim audio')
        fingerprints[str(p)] = sha(p)
    return fingerprints


def timestamp(t):
    cs = round(t*100)
    return f'{cs//360000}:{cs//6000%60:02}:{cs//100%60:02}.{cs%100:02}'


def ass(cues, w, h):
    installed = set()
    if cues:
        for line in run(['fc-list', '--format', '%{family}\n']).decode().splitlines():
            installed.update(name.strip().casefold() for name in line.split(','))
    lines = [f'[Script Info]\nScriptType: v4.00+\nPlayResX: {w}\nPlayResY: {h}\nWrapStyle: 2\n',
             '[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
             'Style: Default,DejaVu Sans,48,&H0000FFFF,&H0000FFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,5,0,0,0,1',
             '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
    for c in cues:
        s = c['style']
        font = s.get('font', 'Noto Serif CJK JP')
        if not isinstance(font, str) or re.search(r'[\\{},\r\n]', font):
            raise ValueError('Invalid font family')
        if font.casefold() not in installed:
            raise ValueError(f'Font not installed: {font}')
        size = number(s.get('size', 64), 'subtitle size', 1)
        color = s.get('color', '#FFD166')
        if not re.fullmatch(r'#[0-9a-fA-F]{6}', color):
            raise ValueError('subtitle color must be #RRGGBB')
        x, y = s.get('position', [w/2, h*.82])
        number(x, 'subtitle x'); number(y, 'subtitle y')
        if x > w or y > h:
            raise ValueError('subtitle position outside canvas')
        text = c['text']
        # Literal text only. Reject ASS override syntax instead of permitting injection.
        if not isinstance(text, str) or any(ch in text for ch in ('{', '}', '\\', '\r')):
            raise ValueError('subtitle text must be literal; braces/backslash are not supported')
        text = text.replace('\n', r'\N')
        bgr = color[5:7]+color[3:5]+color[1:3]
        tag = '{'+f'\\an5\\pos({x},{y})\\fn{font}\\fs{size}\\c&H{bgr}&'+'}'
        glow = s.get('glow', {})
        if not isinstance(glow, dict):
            raise ValueError('glow must be an object')
        blur = number(glow.get('blur', 10), 'glow.blur')
        strength = number(glow.get('strength', 0), 'glow.strength')
        if blur > 50 or strength > 1:
            raise ValueError('glow.blur must be <= 50 and glow.strength <= 1')
        if timestamp(c['start']) == timestamp(c['end']):
            raise ValueError('subtitle shorter than ASS centisecond resolution')
        if strength:
            # Two blurred colored outlines behind a sharp, readable foreground.
            for layer, radius in ((0, blur), (1, blur/2)):
                alpha = round(255*(1-strength))
                halo = tag[:-1]+f'\\bord{max(1, radius/2)}\\blur{radius}\\3c&H{bgr}&\\alpha&H{alpha:02X}&'+'}'
                lines.append(f'Dialogue: {layer},{timestamp(c["start"])},{timestamp(c["end"])},Default,,0,0,0,,{halo}{text}')
            tag = tag[:-1]+r'\bord0\shad0\blur0'+'}'
        lines.append(f'Dialogue: 2,{timestamp(c["start"])},{timestamp(c["end"])},Default,,0,0,0,,{tag}{text}')
    return '\n'.join(lines)+'\n'


def ff(args, cwd=None):
    return run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], cwd)


def encode():
    return ['-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-threads', '2']


def audio_filter(a):
    """Shared rendering/check path: source trim, tempo, gain, timeline placement."""
    end = '' if a['out'] is None else f':end={a["out"]}'
    tempo = f'atempo={speed(a)},asetpts=N/SR/TB,' if speed(a) != 1 else ''
    return (f'atrim=start={a["in"]}{end},asetpts=PTS-STARTPTS,aresample=48000,'
            f'{tempo}volume={a["volume"]},adelay={round(a["at"]*1000)}:all=1')


def silence_settings(manifest, duration, count):
    raw = json.loads(manifest.read_text()).get('silence_check', {})
    if not isinstance(raw, dict):
        raise ValueError('silence_check must be an object')
    enabled = raw.get('enabled', True)
    if not isinstance(enabled, bool):
        raise ValueError('silence_check.enabled must be boolean')
    noise = number(raw.get('noise_db', -40), 'silence_check.noise_db', -120)
    minimum = number(raw.get('min_duration', .5), 'silence_check.min_duration', .001)
    if noise > 0:
        raise ValueError('silence_check.noise_db must be <= 0')
    tracks = raw.get('narration_tracks', list(range(count)))
    if not isinstance(tracks, list) or any(type(i) is not int or not 0 <= i < count for i in tracks):
        raise ValueError('narration_tracks must contain valid zero-based audio indices')
    if len(set(tracks)) != len(tracks):
        raise ValueError('duplicate narration_tracks')
    keep = raw.get('keep', [])
    if not isinstance(keep, list):
        raise ValueError('silence_check.keep must be an array')
    for item in keep:
        a = number(item['start'], 'keep.start')
        b = number(item['end'], 'keep.end')
        if not a < b <= duration or not isinstance(item.get('reason'), str) or not item['reason'].strip():
            raise ValueError('keep requires start < end <= duration and a nonempty reason')
    return dict(enabled=enabled, noise_db=noise, min_duration=minimum,
                narration_tracks=tracks, keep=keep)


def check_silence(plan, duration, config, old, fingerprints, mode):
    """Detect the rendered narration bus, never the BGM or compressed master."""
    if not config['enabled'] or not config['narration_tracks']:
        return {'status': 'disabled' if not config['enabled'] else 'no_narration', 'warnings': []}
    tracks = [plan['audio'][i] for i in config['narration_tracks']]
    key = digest({'tracks': tracks, 'duration': duration,
                  'inputs': {a['file']: fingerprints[a['file']] for a in tracks},
                  'noise': config['noise_db'], 'minimum': config['min_duration'], 'version': 1})
    cached = old.get('silence_report', {})
    reused = cached.get('detection_key') == key
    if reused:
        candidates = cached['candidates']
    else:
        # In subtitles mode the master may outlive its sources. Never inspect a
        # changed source and misrepresent it as the audio in that master.
        for a in tracks:
            if sha(existing(Path(a['file']))) != fingerprints[a['file']]:
                raise ValueError('Narration source changed; run build before silence check')
        args, filters = [], []
        for i, a in enumerate(tracks):
            args += ['-i', a['file']]
            filters.append(f'[{i}:a:0]{audio_filter(a)}[n{i}]')
        labels = ''.join(f'[n{i}]' for i in range(len(tracks)))
        samples = round(duration*48000)
        filters.append(f'{labels}amix=inputs={len(tracks)}:normalize=0,'
                       f'apad=whole_len={samples},atrim=end_sample={samples},asetpts=N/SR/TB,'
                       f'silencedetect=noise={config["noise_db"]}dB:d={config["min_duration"]}[check]')
        result = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-loglevel', 'info',
            *args, '-filter_complex', ';'.join(filters), '-map', '[check]', '-f', 'null', '-'], capture_output=True)
        if result.returncode:
            raise ValueError(result.stderr.decode(errors='replace')[-4000:])
        candidates, start = [], None
        for kind, value in re.findall(r'silence_(start|end):\s*([0-9.eE+\-]+)', result.stderr.decode()):
            if kind == 'start':
                start = max(0, float(value))
            elif start is not None:
                candidates.append({'start': start, 'end': min(duration, float(value))})
                start = None
        if start is not None:
            candidates.append({'start': start, 'end': duration})
    warnings, kept = [], []
    for c in candidates:
        a, b = c['start'], c['end']
        kind = 'entire' if a <= .001 and b >= duration-.001 else ('leading' if a <= .001 else 'trailing' if b >= duration-.001 else 'internal')
        pieces = [(a, b)]
        for k in sorted(config['keep'], key=lambda x: x['start']):
            remaining = []
            for lo, hi in pieces:
                left, right = max(lo, k['start']), min(hi, k['end'])
                if left < right:
                    kept.append(dict(start=left, end=right, reason=k['reason'], kind=kind))
                    if lo < left: remaining.append((lo, left))
                    if right < hi: remaining.append((right, hi))
                else:
                    remaining.append((lo, hi))
            pieces = remaining
        # Even short residuals are reported: a keep interval cannot conceal the
        # rest of an already qualifying candidate.
        warnings.extend(dict(start=lo, end=hi, duration=hi-lo, kind=kind) for lo, hi in pieces)
    return dict(status='checked', detection_key=key, detection_reused=reused,
                settings=config, candidates=candidates, warnings=warnings, kept=kept,
                time_basis='final_video_seconds')


def build_master(plan, duration, work):
    w, h = plan['size']; fps = plan['fps']
    for i, s in enumerate(plan['scenes']):
        vf = (f'trim=start={s["in"]}:end={s["out"]},setpts=PTS-STARTPTS,'
              f'scale={w}:{h}:force_original_aspect_ratio=decrease,'
              f'pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={fps}')
        ff(['-i', s['file'], '-map', '0:v:0', '-vf', vf, '-frames:v', s['frames'], '-an', *encode(), work/f'{i}.mp4'])
    (work/'concat.txt').write_text(''.join(f"file '{i}.mp4'\n" for i in range(len(plan['scenes']))))
    ff(['-f', 'concat', '-safe', '1', '-i', 'concat.txt', '-c', 'copy', 'visual.mp4'], work)
    args = ['-i', 'visual.mp4']
    for a in plan['audio']:
        args += ['-i', a['file']]
    if plan['audio']:
        filters = []
        for i, a in enumerate(plan['audio'], 1):
            filters.append(f'[{i}:a:0]{audio_filter(a)}[a{i}]')
        labels = ''.join(f'[a{i}]' for i in range(1, len(plan['audio'])+1))
        tail = f'apad,atrim=duration={duration}'
        if any(speed(a) != 1 for a in plan['audio']):
            samples = round(duration*48000)
            tail = f'apad=whole_len={samples},atrim=end_sample={samples},asetpts=N/SR/TB'
        filters.append(f'{labels}amix=inputs={len(plan["audio"])}:normalize=0,{tail}[audio]')
        args += ['-filter_complex', ';'.join(filters), '-map', '0:v:0', '-map', '[audio]', '-c:a', 'aac', '-b:a', '192k']
    else:
        args += ['-map', '0:v:0', '-an']
    ff([*args, '-c:v', 'copy', '-movflags', '+faststart', 'master.mp4'], work)


def black_settings(manifest):
    raw = json.loads(manifest.read_text()).get('leading_black', {})
    if not isinstance(raw, dict) or set(raw) - {'auto_cut', 'reviewed_master_sha256', 'keep'}:
        raise ValueError('leading_black accepts only auto_cut, reviewed_master_sha256 and keep')
    auto = raw.get('auto_cut', False)
    if type(auto) is not bool:
        raise ValueError('leading_black.auto_cut must be boolean')
    reviewed = raw.get('reviewed_master_sha256')
    if reviewed is not None and (not isinstance(reviewed, str) or
                                 not re.fullmatch(r'[0-9a-f]{64}', reviewed)):
        raise ValueError('leading_black.reviewed_master_sha256 must be a SHA256')
    keep = raw.get('keep', [])
    if not isinstance(keep, list):
        raise ValueError('leading_black.keep must be an array')
    for item in keep:
        if not isinstance(item, dict):
            raise ValueError('leading_black.keep requires interval objects')
        a = number(item.get('start'), 'leading_black.keep.start')
        b = number(item.get('end'), 'leading_black.keep.end')
        if a >= b or not isinstance(item.get('reason'), str) or not item['reason'].strip():
            raise ValueError('leading_black.keep requires start < end and a reason')
    return dict(auto_cut=auto, reviewed_master_sha256=reviewed, keep=keep)


def apply_black_policy(report, settings, master_hash, silence_keep):
    """Require review of this exact master; never cut a protected prefix."""
    report['master_sha256'] = master_hash
    report['cut_seconds'] = 0
    report['cut_frames'] = 0
    proposed = report['proposed_cut_seconds']
    overlaps = [k for k in settings['keep'] + silence_keep
                if k['start'] < proposed and k['end'] > 0]
    report['protected_intervals'] = overlaps
    report['review_matches_master'] = settings['reviewed_master_sha256'] == master_hash
    if overlaps:
        report['status'] = 'protected'
        report['blocked_reason'] = 'protected_interval'
    elif settings['auto_cut'] and proposed:
        if not report['review_matches_master']:
            report['blocked_reason'] = 'master_review_required'
        else:
            report['cut_seconds'] = proposed
            report['cut_frames'] = round(proposed * report['fps'])
    return report


def leading_black(source, plan, auto):
    """Strict full-resolution RGB inspection. Never seek past the first content.

    Thresholds are deliberately fixed: every channel <= 4, channel spread <= 2.
    No percentage allowance: even a small bright CT mark protects the frame.
    Inspect at most 3 seconds plus one frame; retain one black guard frame.
    """
    w, h = plan['size']; fps = plan['fps']
    limit = 3 * fps + 1
    frame_bytes = w * h * 3
    count, boundary = 0, False
    with tempfile.TemporaryFile() as errors:
        proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(source),
            '-map', '0:v:0', '-frames:v', str(limit), '-pix_fmt', 'rgb24',
            '-threads', '1', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE, stderr=errors)
        try:
            for _ in range(limit):
                frame = proc.stdout.read(frame_bytes)
                if not frame:
                    break
                if len(frame) != frame_bytes:
                    raise ValueError('Incomplete frame during black detection')
                peak = max(frame)
                neutral = peak <= 2 or (peak <= 4 and all(
                    max(frame[i:i+3])-min(frame[i:i+3]) <= 2
                    for i in range(0, len(frame), 3)))
                if not neutral:
                    boundary = True
                    break
                count += 1
            # Drain bounded output so decoder errors are not hidden by SIGPIPE.
            while proc.stdout.read(frame_bytes):
                pass
            if proc.wait():
                errors.seek(0)
                raise ValueError(errors.read().decode(errors='replace')[-4000:])
        finally:
            proc.stdout.close()
            if proc.poll() is None:
                proc.kill(); proc.wait()
    eligible = boundary and count / fps >= .2
    proposed = max(0, count - 1) if eligible else 0
    applied = proposed if auto else 0
    return dict(time_basis='uncut_master_seconds', detected_start=0 if count else None,
                detected_end=count/fps if count else None, boundary_found=boundary,
                status='candidate' if eligible else 'no_leading_black' if not count else 'protected',
                auto_cut=auto, proposed_cut_seconds=proposed/fps,
                cut_seconds=applied/fps, cut_frames=applied,
                guard_frames=1, max_scan_seconds=3, fps=fps,
                rule='all RGB channels <= 4 and channel spread <= 2; no scaling')


def shifted_cues(cues, cut):
    return [dict(c, start=max(0, c['start']-cut), end=c['end']-cut)
            for c in cues if c['end'] > cut]


def edit(manifest, output, mode='build'):
    plan, cues, duration = load(manifest.resolve())
    black_config = black_settings(manifest)
    config = silence_settings(manifest, duration, len(plan['audio']))
    subtitle = ass(cues, *plan['size'])  # Validate before writing any deliverable.
    output = output.resolve()
    reserved = {output/n for n in ('master.mp4', 'final.mp4', 'cache.json', 'captions.ass', 'silence_report.json', 'black_report.json')}
    if any(Path(a['file']) in reserved for a in plan['scenes']+plan['audio']):
        raise ValueError('Input/output collision')
    master, cache = output/'master.mp4', output/'cache.json'
    old = json.loads(cache.read_text()) if cache.exists() else {}
    signature = digest(plan)
    valid_master = master.exists() and old.get('plan') == signature and old.get('master_sha256') == sha(master)
    if mode == 'subtitles':
        if not valid_master:
            raise ValueError('Master missing, changed, or timeline/audio settings changed; run build first')
        fingerprints = old['inputs']
    else:
        fingerprints = validate_inputs(plan, duration)
        valid_master = valid_master and old.get('inputs') == fingerprints
    silence_report = check_silence(plan, duration, config, old, fingerprints, mode)
    output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.edit-', dir=output) as temp:
        work = Path(temp)
        if not valid_master:
            build_master(plan, duration, work)
        source = master if valid_master else work/'master.mp4'
        black_report = apply_black_policy(
            leading_black(source, plan, black_config['auto_cut']),
            black_config, sha(source), config['keep'])
        cut = black_report['cut_seconds']
        final_duration = duration - cut
        final_cues = shifted_cues(cues, cut)
        if cut:
            filters = f'trim=start_frame={black_report["cut_frames"]},setpts=N/({plan["fps"]}*TB)'
            args = ['-i', source, '-vf', filters, '-map', '0:v:0', '-map', '0:a?']
            if plan['audio']:
                args += ['-af', f'atrim=start={cut},asetpts=PTS-STARTPTS', '-c:a', 'aac', '-b:a', '192k']
            ff([*args, *encode(), '-r', plan['fps'], '-fps_mode', 'cfr', '-movflags', '+faststart', work/'trimmed.mp4'])
        render_source = work/'trimmed.mp4' if cut else source
        subtitle = ass(final_cues, *plan['size'])
        (work/'captions.ass').write_text(subtitle, encoding='utf-8')
        if final_cues:
            ff(['-i', render_source, '-vf', 'ass=captions.ass', '-map', '0:v:0', '-map', '0:a?', *encode(), '-fps_mode', 'passthrough', '-c:a', 'copy', '-movflags', '+faststart', 'final.mp4'], work)
        else:
            shutil.copyfile(render_source, work/'final.mp4')
        result = probe(work/'final.mp4')
        video = next(s for s in result['streams'] if s['codec_type'] == 'video')
        if int(video.get('nb_frames', -1)) != sum(s['frames'] for s in plan['scenes']) - black_report['cut_frames']:
            raise ValueError('Output frame count verification failed')
        if abs(float(result['format']['duration'])-final_duration) > max(.1, 2/plan['fps']):
            raise ValueError('Output duration verification failed')
        audio_ends = old.get('audio_ends', []) if valid_master else []
        if not valid_master:
            for a in plan['audio']:
                end = a['out']
                if end is None:
                    data = probe(a['file'])
                    stream = next(s for s in data['streams'] if s['codec_type'] == 'audio')
                    end = float(stream.get('duration', data['format']['duration']))
                audio_ends.append(a['at']+(end-a['in'])/speed(a))
        audio_stream = next((s for s in result['streams'] if s['codec_type'] == 'audio'), None)
        if plan['audio'] and (audio_stream is None or
                abs(float(audio_stream['duration'])-final_duration) > .1):
            raise ValueError('Output audio duration verification failed')
        info = {'black_report': black_report, 'uncut_duration': duration, 'silence_report': silence_report, 'audio_ends': audio_ends,
                'subtitle_times': [{'start': c['start'], 'end': c['end']} for c in final_cues],
                'audio_stream_duration': float(audio_stream['duration']) if audio_stream else None,
                'plan': signature, 'inputs': fingerprints, 'master_sha256': sha(source),
                'duration': final_duration, 'master_reused': valid_master, 'mode': mode}
        # Keep cached detection in original coordinates, expose final coordinates separately.
        final_silence = dict(silence_report, time_basis='final_video_seconds')
        for key in ('candidates', 'warnings', 'kept'):
            if key in silence_report:
                final_silence[key] = shifted_cues(silence_report[key], cut)
                for item in final_silence[key]:
                    if 'duration' in item:
                        item['duration'] = item['end'] - item['start']
        final_silence['settings_time_basis'] = 'uncut_master_seconds'
        for warning in final_silence['warnings']:
            print(f"WARNING narration silence (final video): "
                  f"{warning['start']:.3f}–{warning['end']:.3f}s", file=sys.stderr)
        info['final_silence_report'] = final_silence
        info['final_audio_ends'] = [max(0, t-cut) for t in audio_ends]
        info['silence_report'] = dict(silence_report, time_basis='uncut_master_seconds')
        (work/'black_report.json').write_text(json.dumps(black_report, indent=2)+'\n')
        (work/'silence_report.json').write_text(json.dumps(final_silence, ensure_ascii=False, indent=2)+'\n')
        (work/'cache.json').write_text(json.dumps(info, indent=2)+'\n')
        for name in (['master.mp4'] if not valid_master else []) + ['captions.ass', 'final.mp4', 'cache.json', 'silence_report.json', 'black_report.json']:
            os.replace(work/name, output/name)
    return info


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('mode', choices=['build', 'subtitles'])
    p.add_argument('manifest', type=Path)
    p.add_argument('--output-dir', type=Path, required=True)
    a = p.parse_args()
    try:
        print(json.dumps(edit(a.manifest, a.output_dir, a.mode), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError) as e:
        print(f'ERROR: {e}', file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
