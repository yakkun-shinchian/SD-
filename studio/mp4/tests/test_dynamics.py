"""check_dynamics の判定部分の試験。ffmpeg も動画も使いません。"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import check_dynamics as cd  # noqa: E402


def cut(no, start, dur, motion):
    return {"no": no, "start": start, "end": start + dur, "dur": dur,
            "motion": motion, "motion_peak": motion}


class Level(unittest.TestCase):
    def test_still_stays_still_even_when_everything_is_still(self):
        """全部が止まっているとき、中央値0でも「動」と呼ばない。"""
        cuts = [cut(i, i * 3.0, 3.0, 0.0) for i in range(1, 5)]
        cd.judge(cuts, set(), 3.0)
        self.assertEqual([c["level"] for c in cuts], ["止"] * 4)

    def test_one_moving_cut_among_still_ones(self):
        cuts = [cut(1, 0, 3, 0.0), cut(2, 3, 3, 4.0), cut(3, 6, 3, 0.0)]
        cd.judge(cuts, set(), 3.0)
        self.assertEqual([c["level"] for c in cuts], ["止", "動", "止"])

    def test_relative_levels_when_video_moves(self):
        cuts = [cut(1, 0, 3, 1.0), cut(2, 3, 3, 5.0), cut(3, 6, 3, 0.5),
                cut(4, 9, 3, 1.1)]
        cd.judge(cuts, set(), 3.0)
        self.assertEqual(cuts[1]["level"], "動")
        self.assertEqual(cuts[2]["level"], "静")


class Notes(unittest.TestCase):
    def test_all_still_is_reported(self):
        cuts = [cut(i, i * 3.0, 3.0, 0.01) for i in range(1, 4)]
        _, _, notes = cd.judge(cuts, set(), 3.0)
        self.assertTrue(any("全編がほぼ静止画" in n for n in notes))

    def test_still_tail_is_reported_with_share(self):
        cuts = [cut(1, 0, 10, 3.0), cut(2, 10, 10, 3.0), cut(3, 20, 10, 0.02)]
        _, _, notes = cd.judge(cuts, set(), 3.0)
        self.assertTrue(any("ほぼ静止のカット" in n and "33%" in n for n in notes))

    def test_weak_highlight_is_flagged(self):
        cuts = [cut(1, 0, 4, 3.0), cut(2, 4, 4, 3.0), cut(3, 8, 4, 0.5)]
        _, _, notes = cd.judge(cuts, {3}, 3.0)
        self.assertTrue(any("カット3（山場）の動き" in n for n in notes))

    def test_highlight_that_moves_and_is_long_is_not_flagged_for_motion(self):
        cuts = [cut(1, 0, 2, 0.4), cut(2, 2, 8, 6.0), cut(3, 10, 2, 0.4)]
        _, _, notes = cd.judge(cuts, {2}, 3.0)
        self.assertFalse(any("山場）の動き" in n for n in notes))
        self.assertFalse(any("山場）の尺" in n for n in notes))

    def test_short_highlight_is_flagged(self):
        cuts = [cut(1, 0, 8, 1.0), cut(2, 8, 2, 9.0), cut(3, 10, 8, 1.0)]
        _, _, notes = cd.judge(cuts, {2}, 3.0)
        self.assertTrue(any("山場）の尺" in n for n in notes))

    def test_noisy_run_up_to_highlight_is_flagged(self):
        cuts = [cut(1, 0, 4, 3.0), cut(2, 4, 4, 3.0), cut(3, 8, 8, 9.0)]
        _, _, notes = cd.judge(cuts, {3}, 3.0)
        self.assertTrue(any("直前（カット2）が静かではありません" in n for n in notes))

    def test_missing_highlight_number_is_reported(self):
        cuts = [cut(1, 0, 4, 1.0), cut(2, 4, 4, 1.0)]
        _, _, notes = cd.judge(cuts, {9}, 3.0)
        self.assertTrue(any("カット9は見つかりません" in n for n in notes))

    def test_weak_opening_is_flagged(self):
        cuts = [cut(1, 0, 2, 0.5), cut(2, 2, 6, 9.0), cut(3, 8, 6, 8.0)]
        _, _, notes = cd.judge(cuts, set(), 3.0)
        self.assertTrue(any("つかみが弱い" in n for n in notes))


class Cuts(unittest.TestCase):
    def test_marks_closer_than_min_gap_are_merged(self):
        scenes = [(1.0, 0.9), (1.2, 0.9), (5.0, 0.9), (6.0, 0.1)]
        self.assertEqual(cd.find_cuts(scenes, 0.4, 0.8), [1.0, 5.0])

    def test_frames_right_after_a_cut_are_skipped(self):
        motion = [(0.0, 9.9), (0.1, 9.9), (0.5, 1.0), (0.9, 1.0),
                  (2.1, 9.9), (2.6, 2.0), (2.9, 2.0)]
        cuts = cd.build_cuts(motion, [2.0], 3.0, 0.25)
        self.assertEqual(cuts[0]["motion"], 1.0)
        self.assertEqual(cuts[1]["motion"], 2.0)

    def test_a_cut_with_too_few_samples_falls_back(self):
        motion = [(0.0, 4.0), (0.1, 6.0)]
        cuts = cd.build_cuts(motion, [], 0.2, 0.25)
        self.assertEqual(cuts[0]["motion"], 5.0)


if __name__ == "__main__":
    unittest.main()
