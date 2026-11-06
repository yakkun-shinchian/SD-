"""Regression coverage for PR #34's font and instantaneous-camera findings."""
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import patch, sentinel

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'motion'))
import render
from emphasis import validate_frames


class JapaneseFontTests(unittest.TestCase):
    def test_supported_platform_candidates_preserve_requested_size(self):
        for path in (
            '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc',
            'C:/Windows/Fonts/meiryob.ttc',
            'C:/Windows/Fonts/meiryo.ttc',
            'C:/Windows/Fonts/YuGothM.ttc',
            '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
            '/usr/local/share/fonts/NotoSansCJKjp-Regular.otf',
        ):
            with self.subTest(path=path), \
                 patch.object(render.os.path, 'exists', side_effect=lambda p: p == path), \
                 patch.object(render.ImageFont, 'truetype', return_value=sentinel.font) as load, \
                 patch.object(render.ImageFont, 'load_default') as fallback:
                self.assertIs(render.font(64), sentinel.font)
                load.assert_called_once_with(path, 64)
                fallback.assert_not_called()

    def test_unreadable_candidate_does_not_hide_japanese_font(self):
        with patch.object(render.os.path, 'exists', return_value=True), \
             patch.object(render.ImageFont, 'truetype', side_effect=[OSError('broken'), sentinel.font]):
            self.assertIs(render.font(48), sentinel.font)

    def test_installed_font_renders_distinct_japanese_glyphs_at_requested_size(self):
        font = render.font(48)
        self.assertIsInstance(font, render.ImageFont.FreeTypeFont)
        self.assertEqual(font.size, 48)
        masks = [bytes(font.getmask(c)) for c in '脳室頭蓋骨']
        self.assertTrue(all(masks))
        self.assertEqual(len(set(masks)), len(masks))
        self.assertGreater(render.font(72).getbbox('脳室')[2], font.getbbox('脳室')[2])


class InstantCameraTests(unittest.TestCase):
    def check_camera(self, at, focus, move=0, profile='M3'):
        tl = SimpleNamespace(
            W=100, H=100, src_w=100, src_h=100, fps=30, duration=4,
            seg={'speech': (1, 2)}, preview=True,
            layout={'image_sha256': 'fixture'},
            d={'profile': profile, 'camera': [
                {'at': 0, 'focus': [0, 0, 100, 100], 'pad': 0, 'move': 0},
                {'at': at, 'focus': focus, 'pad': 0, 'move': move}]},
            t=float, rect=lambda r, pad=0: [45, 45, 10, 10] if r == 'text' else r)
        overlays = [dict(_t0=1, _dur=.3, _until=2, _fade=.2,
                         target='text', cue='phrase', color='yellow')]
        return validate_frames(tl, render.Camera(tl), overlays)

    def test_instant_zoom_and_pan_rejected_during_phrase_and_fade(self):
        for profile in ('M3', 'M4'):
            for focus in ([10, 10, 80, 80], [0, 0, 80, 80]):
                for at in (1, 1.5, 2, 2.1, 2.2-1e-8):
                    with self.subTest(profile=profile, focus=focus, at=at):
                        with self.assertRaisesRegex(ValueError, 'hold through fade'):
                            self.check_camera(at, focus, profile=profile)

    def test_jump_before_reading_and_at_clearance_allowed(self):
        for at in (.9, 2.2, 2.3):
            with self.subTest(at=at):
                self.check_camera(at, [10, 10, 80, 80])

    def test_unchanged_view_during_reading_allowed(self):
        self.check_camera(1.5, [0, 0, 100, 100])

    def test_positive_duration_overlap_still_rejected(self):
        with self.assertRaisesRegex(ValueError, 'hold through fade'):
            self.check_camera(.9, [10, 10, 80, 80], move=.2)

    def test_positive_move_arriving_at_reading_start_allowed(self):
        self.check_camera(.5, [10, 10, 80, 80], move=.5)
