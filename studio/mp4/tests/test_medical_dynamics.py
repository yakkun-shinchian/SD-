"""医療教材の判定とCLIを仮想データで確認する。実作品は使用しない。"""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

MP4_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(MP4_DIR))
import check_dynamics as cd  # noqa: E402


def measured_cuts(durations, median=0.0, peak=0.0):
    cuts = []
    start = 0.0
    for no, duration in enumerate(durations, 1):
        cuts.append(dict(no=no, start=start, end=start + duration, dur=duration,
                         motion=median, motion_peak=peak, transition_peak=None))
        start += duration
    return cuts


class MedicalProfiles(unittest.TestCase):
    def test_four_fixed_slides_can_hold_even_at_highlight(self):
        cuts = measured_cuts([5] * 4)
        self.assertEqual(cd.judge_medical(cuts, {3}, "slides-4x5"), (0.0, 5.0, []))
        self.assertTrue(cuts[2]["highlight"])
        self.assertEqual([c["level"] for c in cuts], ["ほぼ静止"] * 4)

    def test_flexible_infographic_accepts_quiet_cuts_and_variable_pacing(self):
        cuts = measured_cuts([2, 8, 1, 12, 5], median=0.3, peak=0.8)
        self.assertFalse(cd.judge_medical(cuts, {1}, "infographic")[2])

    def test_fixed_slides_check_each_duration_even_when_total_is_right(self):
        cuts = measured_cuts([4.74, 5.26, 4.75, 5.25])
        notes = cd.judge_medical(cuts, set(), "slides-4x5")[2]
        self.assertEqual(len(notes), 2)
        self.assertIn("カット1", notes[0])
        self.assertIn("カット2", notes[1])

    def test_fixed_slides_check_total_independently_of_each_cut(self):
        for durations, expected in [([5, 5, 5, 5.25], 0), ([5.1] * 4, 1)]:
            with self.subTest(durations=durations):
                notes = cd.judge_medical(measured_cuts(durations), set(), "slides-4x5")[2]
                self.assertEqual(len(notes), expected)
                if expected:
                    self.assertIn("全尺", notes[0])

    def test_missing_transition_is_reported_without_inventing_a_slide(self):
        cuts = measured_cuts([5, 10, 5])
        notes = cd.judge_medical(cuts, {4}, "slides-4x5")[2]
        self.assertTrue(any("自動検出は3カット" in n for n in notes))
        self.assertTrue(any("カット4は見つかりません" in n for n in notes))

    def test_absolute_caps_detect_sustained_motion_and_a_single_spike(self):
        for profile, (median_cap, peak_cap) in cd.MEDICAL_LIMITS.items():
            with self.subTest(profile=profile):
                cuts = measured_cuts([5] * 4, median=median_cap, peak=peak_cap)
                self.assertFalse(cd.judge_medical(cuts, set(), profile)[2])
                for c in cuts:
                    c.update(motion=median_cap + 0.01, motion_peak=peak_cap)
                self.assertEqual(len(cd.judge_medical(cuts, set(), profile)[2]), 4)
                cuts[1].update(motion=0.0, motion_peak=peak_cap + 0.01)
                self.assertIn("一時的", cd.judge_medical(cuts, set(), profile)[2][1])

    def test_local_motion_can_be_reviewed_selectively_in_organ_cg(self):
        cuts = measured_cuts([5, 5])
        self.assertFalse(cd.judge_medical(cuts, set(), "organ-cg")[2])
        notes = cd.judge_medical(cuts, {2}, "organ-cg")[2]
        self.assertEqual(len(notes), 1)
        self.assertIn("カット2（山場）", notes[0])
        self.assertIn("意図した臓器の動き", notes[0])
        cuts[1].update(motion=5, motion_peak=14)
        self.assertFalse(cd.judge_medical(cuts, {2}, "organ-cg")[2])
        self.assertEqual(len(cd.judge_medical(cuts, {2}, "infographic")[2]), 1)

    def test_missing_samples_are_unknown_and_boundary_itself_is_excluded(self):
        motion = [(0.5, 1), (1.0, 99), (1.1, 0), (2.0, 99), (2.5, 1), (2.8, 1)]
        for skip in (0, 0.25):
            with self.subTest(skip=skip):
                cuts = cd.build_cuts(motion, [1.0, 2.0], 3, skip, medical=True)
                med, _, notes = cd.judge_medical(cuts, set(), "infographic")
                self.assertEqual(med, 1)
                self.assertIsNone(cuts[1]["motion_peak"])
                self.assertEqual([c["level"] for c in cuts], ["測定不足", "測定不足", "範囲内"])
                self.assertEqual(len(notes), 2)

    def test_all_unknown_does_not_yield_zero(self):
        cuts = cd.build_cuts([(0.1, 0)], [], 0.2, 0.25, medical=True)
        med, _, notes = cd.judge_medical(cuts, set(), "organ-cg")
        self.assertIsNone(med)
        self.assertIn("判定保留", notes[0])


@unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "ffmpeg/ffprobe が必要")
class MedicalCLI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        tmp = tempfile.TemporaryDirectory()
        cls.addClassCleanup(tmp.cleanup)
        cls.root = Path(tmp.name)
        # 5秒ごとに背景色を変更。2枚目だけ、中央の図形を5秒かけて3%拡大する。
        radius = "36*(1+0.03*clip((N-120)/119,0,1))"
        cards = f"40+45*floor(N/120)+20*clip(1-hypot(X-80,Y-120)/({radius}),0,1)"
        cls.cards = cls.make_clip("cards", cards, 20)

    @classmethod
    def make_clip(cls, name, brightness, seconds):
        path = cls.root / f"{name}.mkv"
        source = f"nullsrc=s=160x240:r=24:d={seconds},format=gray,geq=lum='{brightness}'"
        subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", source, "-c:v", "ffv1",
                        str(path)], check=True)
        return path

    def report(self, path, *args):
        out = self.root / "report.json"
        result = subprocess.run([sys.executable, str(MP4_DIR / "check_dynamics.py"), str(path),
                                 *args, "--json", str(out)], capture_output=True, text=True, check=True)
        return json.loads(out.read_text(encoding="utf-8")), result.stdout

    def test_slow_zoom_and_page_changes_through_cli(self):
        digest = hashlib.sha256(self.cards.read_bytes()).digest()
        report, stdout = self.report(self.cards, "--profile", "slides-4x5", "--highlight", "3")
        self.assertEqual(report["profile"], "slides-4x5")
        self.assertEqual([c["dur"] for c in report["cuts"]], [5.0] * 4)
        self.assertGreater(report["cuts"][1]["motion_peak"], 0)
        self.assertEqual(report["notes"], [])
        self.assertTrue(report["cuts"][2]["highlight"])
        for item in cd.MANUAL_REVIEW:
            self.assertIn(item, report["manual_review"])
            self.assertIn(item, stdout)
        self.assertEqual(digest, hashlib.sha256(self.cards.read_bytes()).digest())

    def test_legacy_default_and_explicit_classic_match(self):
        default = self.report(self.cards, "--highlight", "3")
        self.assertEqual(default, self.report(self.cards, "--profile", "classic", "--highlight", "3"))
        report, _ = default
        self.assertEqual(set(report), {"video", "info", "cuts", "motion_median", "duration_mean",
                                       "highlights", "notes"})
        self.assertEqual(set(report["cuts"][0]), {"no", "start", "end", "dur", "motion", "motion_peak",
                                                  "level", "highlight"})
        self.assertTrue(any("平均 5.0秒 の1.3倍" in n for n in report["notes"]))

    def test_single_frame_flash_detected_even_if_it_triggers_a_cut(self):
        flash = self.make_clip("flash", "40+6*eq(N,24)", 3)
        report, _ = self.report(flash, "--profile", "infographic")
        self.assertTrue(any("ピーク" in n for n in report["notes"]))

    def test_repeated_frame_changes_detected(self):
        flicker = self.make_clip("flicker", "40+4*mod(N,2)", 3)
        report, _ = self.report(flicker, "--profile", "organ-cg")
        self.assertTrue(any("中央値" in n for n in report["notes"]))

    def test_json_cannot_overwrite_input_even_through_alias(self):
        alias = self.root / "alias.json"
        alias.hardlink_to(self.cards)
        digest = hashlib.sha256(self.cards.read_bytes()).digest()
        result = subprocess.run([sys.executable, str(MP4_DIR / "check_dynamics.py"), str(self.cards),
                                 "--json", str(alias)], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("JSONの保存先", result.stderr)
        self.assertEqual(digest, hashlib.sha256(self.cards.read_bytes()).digest())


if __name__ == "__main__":
    unittest.main()
