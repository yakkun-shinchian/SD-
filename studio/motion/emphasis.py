"""M3/M4 emphasis contract. No OCR or audio alignment is inferred here.

Reviewed source rectangles and measured phrase offsets are explicit inputs.
Preview timing can validate geometry/lifecycle, never actual voice alignment.
"""
import hashlib
import math
from pathlib import Path


def require(ok, message):
    if not ok:
        raise ValueError(message)


def number(value, label):
    require(isinstance(value, (int, float)) and not isinstance(value, bool)
            and math.isfinite(value), f'{label}: finite number required')
    return float(value)


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def intersects(a, b):
    x, y, w, h = a
    u, v, s, t = b
    return x < u+s and u < x+w and y < v+t and v < y+h


def validate_source(tl):
    require(tl.layout.get('image_sha256') == sha256(tl.p(tl.d['image'])),
            'Source image changed or image_sha256 missing; review anchors again')
    require(tl.W > 0 and tl.H > 0 and 0 < number(tl.fps, 'fps') <= 120,
            'Invalid output dimensions/fps')
    for name, r in tl.anchors.items():
        require(isinstance(r, list) and len(r) == 4, f'{name}: rectangle required')
        x, y, w, h = [number(v, name) for v in r]
        require(x >= 0 and y >= 0 and w > 0 and h > 0
                and x+w <= tl.src_w and y+h <= tl.src_h,
                f'{name}: anchor outside source')
    # Subtitles/labels/wiggle can obscure or alter the original. This strict
    # profile intentionally supports marker-only annotations; legacy mode remains.
    require(tl.d.get('subtitles') is False, 'M3/M4 requires subtitles=false')
    segments = tl.d.get('narration', {}).get('segments', [])
    ids = [s.get('id') for s in segments]
    require(all(ids) and len(set(ids)) == len(ids), 'Unique narration IDs required')
    require(tl.d.get('cues'), 'At least one explicit phrase cue required')
    cue_ids = [c.get('id') for c in tl.d['cues']]
    require(all(cue_ids) and len(set(cue_ids)) == len(cue_ids), 'Unique cue IDs required')


def validate_audio(tl):
    for s in tl.d.get('narration', {}).get('segments', []):
        a = s.get('alignment', {})
        require(s.get('wav') and Path(tl.p(s['wav'])).is_file(),
                f"{s['id']}: final WAV missing; preview is not audio verification")
        require(a.get('status') == 'verified' and a.get('method') in ('listening', 'forced_alignment_reviewed'),
                f"{s['id']}: measured/listened alignment required")
        require(a.get('audio_sha256') == sha256(tl.p(s['wav'])),
                f"{s['id']}: audio changed; remeasure phrase offsets")


def preview_segments(tl):
    require(tl.d.get('profile') in ('M3', 'M4'), 'Preview requires M3/M4')
    nd = tl.d['narration']
    t = number(nd.get('lead_in', 0), 'lead_in')
    for s in nd['segments']:
        if 'at' in s:
            t = tl.t(s['at'])
        duration = number(s.get('preview_duration'), 'preview_duration')
        require(duration > 0 and t >= 0, 'Invalid preview segment interval')
        tl.seg[s['id']] = (t, t+duration)
        t += duration + number(s.get('pause', nd.get('gap', 0)), 'gap')
    return t


def prepare_emphasis(tl):
    validate_source(tl)
    if not tl.preview:
        validate_audio(tl)
    cues = {c['id']: c for c in tl.d['cues']}
    used = set()
    out = []
    for raw in tl.d.get('overlays', []):
        require(raw.get('type') == 'highlight', 'M3/M4 accepts one marker only; underline/other emphasis prohibited')
        require(not set(raw).intersection({'sync', 'from', 'to', 'start', 'dur', 'until', 'offset'}),
                'Use measured cue offsets, not fractions or independent overlay timing')
        cid = raw.get('cue')
        require(cid in cues and cid not in used, f'{cid}: missing or duplicate cue overlay')
        used.add(cid)
        c = cues[cid]
        target = raw.get('target')
        require(target == c.get('target') and target in tl.anchors, f'{cid}: target mismatch')
        meta = tl.layout.get('anchor_meta', {}).get(target, {})
        require(meta.get('text') and c.get('spoken'), f'{target}: text/spoken mapping required')
        require(meta.get('reviewed_rect') == tl.anchors[target] and meta.get('review_method'),
                f'{target}: rectangle has not been visually reviewed')
        require(meta.get('existing_emphasis') is False, f'{target}: existing or unknown emphasis; do not add another mark')
        role = meta.get('role')
        require(role in ('heading', 'body'), f'{target}: explicit semantic role required')
        expected = 'red' if role == 'heading' else 'yellow'
        require(raw.get('color') == expected, f'{target}: {role} requires {expected}')
        if role == 'heading':
            require(target in tl.layout.get('heading_anchors', []), f'{target}: not a whitelisted heading')
        else:
            require(meta.get('important') is True, f'{target}: yellow is for important body text only')
        require(c.get('segment') in tl.seg, f'{cid}: unknown narration segment')
        s, e = tl.seg[c['segment']]
        prefix = 'preview_' if tl.preview else ''
        a = number(c.get(prefix+'start'), f'{cid}.start')
        b = number(c.get(prefix+'end'), f'{cid}.end')
        require(0 <= a < b <= e-s+1e-9, f'{cid}: phrase outside audio segment')
        draw = number(raw.get('draw', .3), 'draw')
        fade = number(raw.get('fade', .2), 'fade')
        opacity = number(raw.get('opacity', .4), 'opacity')
        thick = number(raw.get('thickness_ratio', .55), 'thickness_ratio')
        require(0 < draw <= min(.4, b-a)+1e-9 and (draw >= .2 or b-a < .2), 'Draw must be 0.2–0.4s or shorter than a short phrase')
        require(.15 <= fade <= .3 and .3 <= opacity <= .45 and .45 <= thick <= .65,
                'Invalid fade/opacity/thickness')
        require(raw.get('pad', 0) == 0, 'Marker padding may not extend into adjacent lines')
        out.append(dict(raw, _m3=True, _t0=s+a, _dur=draw, _until=s+b,
                        _fade=fade, pad=0, opacity=opacity, thickness_ratio=thick))
    require(used == set(cues), 'Every cue needs exactly one overlay')
    out.sort(key=lambda o: o['_t0'])
    # The previous marker must be gone before the next phrase begins, including fade.
    for prev, cur in zip(out, out[1:]):
        require(prev['_until']+prev['_fade'] <= cur['_t0']+1e-9,
                'Concurrent emphasis (including fade tail) is forbidden')
    # Alias anchors cannot bypass the duplicate rule, even for sequential effects
    # within one spoken phrase. Re-reading in a different segment is allowed.
    for i, a in enumerate(out):
        for b in out[i+1:]:
            if cues[a['cue']]['segment'] == cues[b['cue']]['segment']:
                require(not intersects(tl.rect(a['target']), tl.rect(b['target'])),
                        'Repeated/aliased emphasis in the same narration segment')
    return out


def validate_frames(tl, cam, overlays):
    duration = number(tl.duration, 'duration')
    require(duration > 0, 'Positive duration required')
    for sid, (s, e) in tl.seg.items():
        require(0 <= s < e <= duration, f'{sid}: audio outside output duration')
    spans = sorted(tl.seg.values())
    require(all(a[1] <= b[0] for a, b in zip(spans, spans[1:])), 'Narration segments overlap')
    for i, key in enumerate(cam.keys):
        require(0 <= key['t'] <= duration and key['move'] >= 0 and key['drift'] == 0,
                'Invalid camera interval or drift; keep reading view stable')
        if i:
            require(cam.keys[i-1]['t']+cam.keys[i-1]['move'] <= key['t'], 'Camera moves overlap')
        for o in overlays:
            require(not (key['move'] > 0 and key['t'] < o['_until']+o['_fade'] and key['t']+key['move'] > o['_t0']),
                    'Camera must arrive before reading and hold through fade')
    require(cam.keys and cam.keys[0]['t'] == 0, 'Camera must start at zero')
    # Evaluate every emitted frame plus exact boundaries (sub-frame cues too).
    times = {i/tl.fps for i in range(math.ceil(duration*tl.fps))}
    for o in overlays:
        require(o['_until']+o['_fade'] <= duration, 'Marker is truncated at output end')
        times.update([o['_t0'], o['_t0']+o['_dur'], o['_until'], o['_until']+o['_fade']-1e-8])
    for t in sorted(times):
        active = [o for o in overlays if o['_t0'] <= t < o['_until']+o['_fade']]
        require(len(active) <= 1, f'{t:.4f}: overlapping emphasis')
        cx, cy, vw = cam.at(t)
        vh = vw/(tl.W/tl.H)
        for o in active:
            x, y, w, h = tl.rect(o['target'])
            require(x >= cx-vw/2-1e-7 and y >= cy-vh/2-1e-7 and x+w <= cx+vw/2+1e-7 and y+h <= cy+vh/2+1e-7,
                    f"{t:.4f}: {o['target']} clipped by camera")
    return {'profile': tl.d['profile'], 'source_sha256': tl.layout['image_sha256'],
            'mode': 'UNVERIFIED_TIMING_PREVIEW' if tl.preview else 'MEASURED_CUE_VALIDATION',
            'actual_audio_sync_verified_by_this_tool': False,
            'note': 'Geometry and declared timing validated. Final audiovisual listening remains required.',
            'frames_checked': math.ceil(duration*tl.fps), 'boundary_checks': len(times),
            'overlap_count': 0,
            'cues': [{'cue': o['cue'], 'target': o['target'], 'rect': tl.rect(o['target']),
                      'color': o['color'], 'start': o['_t0'], 'draw_end': o['_t0']+o['_dur'],
                      'speech_end': o['_until'], 'clear_at': o['_until']+o['_fade']} for o in overlays]}
