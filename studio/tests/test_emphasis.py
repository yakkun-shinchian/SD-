import copy
import json
import math
from pathlib import Path
import sys
import tempfile
import unittest
import wave

import numpy as np
from PIL import ImageChops

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'motion'))
from render import Timeline, Camera, Painter, prepare_overlays, render_frame, build_narration
from emphasis import preview_segments, validate_frames, validate_source, sha256

SAMPLE = Path(__file__).resolve().parents[1] / 'samples/qsofa/timeline.json'


class EmphasisTests(unittest.TestCase):
    def setUp(self):
        self.tl = Timeline(str(SAMPLE))
        self.tl.preview = True
        self.tl.duration = preview_segments(self.tl)+self.tl.d['tail']

    def check(self):
        overlays = prepare_overlays(self.tl)
        return validate_frames(self.tl, Camera(self.tl), overlays)

    def test_sample_and_m4_common_contract(self):
        self.assertEqual(self.check()['overlap_count'], 0)
        self.tl.d['profile'] = 'M4'
        self.assertEqual(self.check()['profile'], 'M4')

    def test_red_body_rejected(self):
        self.tl.d['overlays'][1]['color'] = 'red'
        with self.assertRaisesRegex(ValueError, 'requires yellow'): self.check()

    def test_yellow_heading_rejected(self):
        self.tl.d['overlays'][0]['color'] = 'yellow'
        with self.assertRaisesRegex(ValueError, 'requires red'): self.check()

    def test_underline_rejected(self):
        self.tl.d['overlays'][1]['type'] = 'underline'
        with self.assertRaisesRegex(ValueError, 'underline'): self.check()

    def test_duplicate_rejected(self):
        self.tl.d['overlays'].append(copy.deepcopy(self.tl.d['overlays'][1]))
        with self.assertRaisesRegex(ValueError, 'duplicate'): self.check()

    def test_existing_underline_or_unknown_rejected(self):
        for value in (True, None):
            self.tl.layout['anchor_meta']['c1_value']['existing_emphasis'] = value
            with self.assertRaisesRegex(ValueError, 'existing or unknown'): self.check()

    def test_coordinate_change_rejected(self):
        self.tl.anchors['c1_value'] = [100, 590, 364, 58]
        with self.assertRaisesRegex(ValueError, 'visually reviewed'): self.check()

    def test_source_replacement_rejected(self):
        self.tl.layout['image_sha256'] = 'changed'
        with self.assertRaisesRegex(ValueError, 'Source image changed'): self.check()

    def test_out_of_bounds_rejected(self):
        self.tl.anchors['c1_value'] = [1070, 590, 364, 58]
        with self.assertRaisesRegex(ValueError, 'outside source'): self.check()

    def test_fractional_sync_rejected(self):
        self.tl.d['overlays'][1]['sync'] = 'n2'
        with self.assertRaisesRegex(ValueError, 'not fractions'): self.check()

    def test_fade_overlap_rejected(self):
        c = self.tl.d['cues'][1]
        c.update(segment='n1', preview_start=3.9, preview_end=4.4)
        # First cue ends at 3.8; its fade lasts until 4.0.
        with self.assertRaisesRegex(ValueError, 'Concurrent'): self.check()

    def test_alias_sequential_emphasis_rejected(self):
        c = self.tl.d['cues'][1]
        c.update(segment='n1', target='title_alias', preview_start=4.1, preview_end=4.5)
        self.tl.anchors['title_alias'] = self.tl.anchors['title'][:]
        self.tl.layout['anchor_meta']['title_alias'] = copy.deepcopy(self.tl.layout['anchor_meta']['title'])
        self.tl.layout['heading_anchors'].append('title_alias')
        self.tl.d['overlays'][1].update(target='title_alias', color='red')
        with self.assertRaisesRegex(ValueError, 'aliased'): self.check()

    def test_invalid_timing_rejected(self):
        for invalid in (None, float('nan'), float('inf'), -1, 5):
            self.tl.d['cues'][0]['preview_start'] = invalid
            with self.assertRaises(ValueError): self.check()

    def test_unverified_production_rejected(self):
        self.tl.preview = False
        with self.assertRaisesRegex(ValueError, 'final WAV missing'): self.check()

    def test_changed_audio_rejected_and_real_wav_path(self):
        self.tl.preview = False
        with tempfile.TemporaryDirectory() as tmp:
            wav = str(Path(tmp)/'fixture.wav')
            with wave.open(wav, 'wb') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000)
                w.writeframes(np.zeros(240000, dtype=np.int16).tobytes())
            # Synthetic silence tests the contract only; it is not sample narration.
            for s in self.tl.d['narration']['segments']:
                s.update(wav=wav, alignment={'status':'verified','method':'listening','audio_sha256':sha256(wav)})
            for c in self.tl.d['cues']:
                c.update(start=c['preview_start'], end=c['preview_end'])
            self.tl.seg = {}
            self.tl.duration = build_narration(self.tl, tmp)+1.6
            self.check()
            self.tl.d['narration']['segments'][0]['alignment']['audio_sha256'] = 'old'
            with self.assertRaisesRegex(ValueError, 'audio changed'): self.check()

    def test_camera_moving_during_phrase_rejected(self):
        self.tl.d['camera'].append({'at':7.5, 'focus':'c1','move':1})
        with self.assertRaisesRegex(ValueError, 'arrive before'): self.check()

    def test_camera_clipping_rejected(self):
        self.tl.d['camera_max_zoom'] = 3
        self.tl.d['camera'] = [{'at':0,'focus':'c3','move':0,'pad':0}]
        with self.assertRaisesRegex(ValueError, 'clipped'): self.check()

    def test_subtitles_rejected(self):
        self.tl.d['subtitles'] = True
        with self.assertRaisesRegex(ValueError, 'subtitles=false'): self.check()

    def test_fade_and_pixel_geometry(self):
        overlays = prepare_overlays(self.tl)
        cam = Camera(self.tl)
        for o in overlays:
            for t in (o['_t0']-1/30, o['_t0'], o['_until']+o['_fade']):
                self.assertIsNone(ImageChops.difference(render_frame(self.tl, cam, [o], t),
                                                      render_frame(self.tl, cam, [], t)).getbbox())
            t = o['_t0']+o['_dur']+.1
            bb = ImageChops.difference(render_frame(self.tl, cam, [o], t), render_frame(self.tl, cam, [], t)).getbbox()
            self.assertIsNotNone(bb)
            x,y,w,h = self.tl.rect(o['target'])
            pt = Painter(self.tl, cam.at(t))
            x0,y0 = pt.P(x, y+h*(1-o['thickness_ratio']))
            x1,y1 = pt.P(x+w, y+h)
            self.assertGreaterEqual(bb[0], x0/2-1)
            self.assertGreaterEqual(bb[1], y0/2-1)
            self.assertLessEqual(bb[2], math.ceil(x1/2)+1)
            self.assertLessEqual(bb[3], math.ceil(y1/2)+1)

    def test_other_aspects_contain_anchors(self):
        for wh in ((1080,1350),(1920,1080)):
            self.tl.W,self.tl.H = wh
            self.check()

    def test_legacy_omitted_until_expires(self):
        self.tl.d.pop('profile')
        self.tl.d['overlays'] = [{'type':'highlight','target':'c1_value','sync':'n2','color':'yellow'}]
        o = prepare_overlays(self.tl)[0]
        self.assertEqual(o['_until'], self.tl.seg['n2'][1])
        cam = Camera(self.tl); t = o['_until']+.4
        self.assertIsNone(ImageChops.difference(render_frame(self.tl,cam,[o],t), render_frame(self.tl,cam,[],t)).getbbox())


if __name__ == '__main__':
    unittest.main()
