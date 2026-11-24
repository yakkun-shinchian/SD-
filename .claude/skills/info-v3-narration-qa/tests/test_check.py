import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import check

EXAMPLE = ROOT / "examples/synthetic.json"


class NarrationQA(unittest.TestCase):
    def setUp(self):
        self.doc = json.loads(EXAMPLE.read_text("utf-8"))
        self.cue = self.doc["speech"][0]
        self.mark = self.doc["underlines"][0]

    def codes(self, **kw):
        return {item["code"] for item in check.audit(self.doc, **kw).errors}

    def test_example_passes_only_as_synthetic(self):
        self.assertEqual(check.check_file(EXAMPLE)["status"], "SYNTHETIC_PASS")
        self.assertEqual(self.codes(require_measured=True), {"FIXTURE_ONLY"})

    def test_fourth_slide_wrong_duplicate_text_at_exact_time(self):
        wrong = self.doc["slides"][3]["sentences"][2]["lines"][0]
        mark = self.doc["underlines"][-2]
        cue = self.doc["speech"][-2]
        self.assertEqual(cue["transcript"], wrong["text"])
        mark.update(line_id=wrong["id"], segment=[90, 948, 940])
        self.assertEqual(self.codes(), {"WRONG_TARGET"})

    def test_correct_label_but_segment_at_other_row(self):
        self.doc["underlines"][-2]["segment"][1] = 948
        self.assertEqual(self.codes(), {"UNDERLINE_POSITION"})

    def test_heard_different_sentence(self):
        self.doc["speech"][-1]["transcript"] = self.doc["speech"][-2]["transcript"]
        self.assertEqual(self.codes(), {"SPOKEN_TEXT"})

    def test_drift_boundaries_at_both_ends(self):
        for key, code in [("on_ms", "START_DRIFT"), ("focus_end_ms", "END_DRIFT")]:
            # The second cue has space on both sides, independent of fade.
            mark = self.doc["underlines"][1]
            mark["off_ms"] = 12500
            if key == "focus_end_ms":
                # Use the first cue instead, with a sufficient fade margin.
                mark = self.mark
                mark["off_ms"] = self.cue["end_ms"] + 200
            original = mark[key]
            for delta in [-201, -151, -150, 0, 150, 151, 201]:
                with self.subTest(key=key, delta=delta):
                    mark[key] = original + delta
                    if abs(delta) <= 150:
                        self.assertEqual(self.codes(), set())
                    else:
                        self.assertIn(code, self.codes())
            mark[key] = original

    def test_fade_is_separate_from_active_end(self):
        self.mark["off_ms"] = self.cue["end_ms"] + 220
        self.assertEqual(self.codes(), set())
        self.mark["off_ms"] = self.doc["speech"][1]["start_ms"] + 1
        self.assertIn("STALE_UNDERLINE", self.codes())

    def test_multiline_stays_until_sentence_ends(self):
        first, last = self.doc["underlines"][2:4]
        first["off_ms"] = last["off_ms"]
        self.assertEqual(self.codes(), set())
        first["off_ms"] = last["focus_end_ms"] + 301
        self.assertIn("STALE_UNDERLINE", self.codes())

    def test_missing_second_half_of_sentence(self):
        self.doc["speech"].pop(3)
        self.assertIn("SPEECH_PLAN", self.codes())
        self.assertIn("EXTRA_UNDERLINE", self.codes())

    def test_missed_duplicate_extra_and_unknown_marks(self):
        for mode, code in [("missing","MISSING_UNDERLINE"),("duplicate","DUPLICATE"),
                           ("extra","EXTRA_UNDERLINE"),("unknown","UNKNOWN_LINE")]:
            with self.subTest(mode=mode):
                self.setUp()
                if mode == "missing":
                    self.doc["underlines"].pop(0)
                elif mode == "duplicate":
                    self.doc["underlines"].append(dict(self.mark))
                elif mode == "extra":
                    self.doc["underlines"].append(dict(self.mark, cue_id="other"))
                else:
                    self.mark["line_id"] = "unknown"
                self.assertIn(code, self.codes())

    def test_essential_and_context(self):
        self.doc["plan"].remove("S1")
        self.assertIn("ESSENTIAL_OMITTED", self.codes())
        self.doc["plan"].remove("S2")
        self.assertTrue({"MISSING_CONTEXT","ABRUPT_OPENING","SILENT_SLIDE"} <= self.codes())

    def test_reading_detail_over_core_generates_editorial_note(self):
        self.doc["plan"].remove("S6")
        self.doc["plan"].insert(5, "D3")
        report = check.audit(self.doc)
        self.assertTrue(any("S6" in note for note in report.notes))

    def test_approved_kana_and_meaningful_symbols(self):
        line = self.doc["slides"][0]["sentences"][0]["lines"][0]
        line["spoken"] = "いちびょう、まちます。"
        self.cue["transcript"] = "いちびょう まちます"
        self.assertEqual(self.codes(), set())
        for original, changed in [("増えません","増えます"),("1.5","15"),("-2","+2")]:
            with self.subTest(original=original):
                line["spoken"], self.cue["transcript"] = original, changed
                self.assertIn("SPOKEN_TEXT", self.codes())

    def test_color_precedence_including_v3_defaults(self):
        self.doc.pop("underline_colors")
        for i, mark in enumerate(self.doc["underlines"]):
            mark["color"] = "red" if i == 0 else "yellow"
        self.assertEqual(self.codes(), set())
        self.doc["underline_colors"] = {"all":"#80DEEA", "heading":"#1133CC"}
        for mark in self.doc["underlines"]:
            mark["color"] = "#80deea"
        self.assertEqual(self.codes(), {"COLOR"})
        self.mark["color"] = "#1133cc"
        self.assertEqual(self.codes(), set())

    def test_speed_ceiling_and_clarity(self):
        del self.doc["speed"]
        self.assertEqual(self.codes(), set())
        self.doc["speed"] = 1.5
        self.assertEqual(self.codes(), set())
        self.doc["speed"] = 1.501
        self.assertEqual(self.codes(), {"SPEED"})
        self.doc.update(speed=1.3,listenability="revise")
        self.assertEqual(self.codes(), {"LISTENABILITY"})

    def test_four_pages_and_hard_runtime_limit(self):
        self.doc["duration_ms"] = self.doc["slides"][-1]["end_ms"] = 60000
        self.assertEqual(self.codes(), set())
        self.doc["duration_ms"] = self.doc["slides"][-1]["end_ms"] = 60001
        self.assertEqual(self.codes(), {"DURATION"})
        self.doc["slides"].pop()
        self.assertIn("PAGE_COUNT", self.codes())

    def test_slide_mismatch_and_unordered_audio(self):
        self.doc["slides"][0]["end_ms"] = self.doc["slides"][1]["start_ms"] = 12000
        self.assertTrue({"SPEECH_SLIDE","UNDERLINE_SLIDE"} <= self.codes())
        self.doc["speech"].reverse()
        self.assertTrue({"SPEECH_TIME","SPEECH_PLAN"} <= self.codes())

    def test_bridge_is_unmarked_and_requires_approved_text(self):
        cue = dict(id="b1",line_id=None,transcript="次の例を見ます。",start_ms=6450,end_ms=6560)
        self.doc["speech"].insert(1,cue)
        self.doc["bridges"] = {"b1":cue["transcript"]}
        self.assertEqual(self.codes(), set())
        self.mark["off_ms"] = 6500
        self.assertIn("STALE_UNDERLINE", self.codes())
        self.doc["underlines"].append(dict(self.mark,cue_id="b1"))
        self.assertIn("BRIDGE_UNDERLINE", self.codes())
        self.doc["bridges"] = {}
        self.assertIn("BRIDGE", self.codes())

    def test_estimates_and_relabelled_fixture_rejected(self):
        self.doc["audio_timing"] = "character_ratio"
        self.assertIn("FORMAT", self.codes())
        self.doc.update(evidence="measured",audio_timing="fixture")
        self.assertIn("FORMAT", self.codes())

    def test_malformed_unknown_key(self):
        self.mark["onn_ms"] = self.mark.pop("on_ms")
        self.assertEqual(self.codes(), {"FORMAT"})

    def test_cli_scores_each_half_independently(self):
        with tempfile.TemporaryDirectory() as directory:
            back = Path(directory) / "back.json"
            self.doc.update(part="後半",duration_ms=61000)
            back.write_text(json.dumps(self.doc), "utf-8")
            cmd = [sys.executable,str(ROOT / "scripts/check.py"),str(EXAMPLE),str(back)]
            result = subprocess.run(cmd, capture_output=True, encoding="utf-8")
            self.assertEqual(result.returncode, 1)
            self.assertEqual([r["status"] for r in json.loads(result.stdout)],
                             ["SYNTHETIC_PASS","SYNTHETIC_FAIL"])
            back.write_text('{"version":1,"version":1}', "utf-8")
            result = subprocess.run(cmd, capture_output=True, encoding="utf-8")
            self.assertEqual(result.returncode, 2)
            self.assertEqual(json.loads(result.stdout)[1]["status"], "INPUT_ERROR")

    def test_changed_or_missing_media_cannot_pass(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            (folder/"audio.wav").write_bytes(b"fixture only")
            self.doc.update(evidence="measured",audio_timing="reviewed_alignment",
                            underline_timing="render_log",listenability="clear",
                            media={k:{"path":name,"sha256":"0"*64} for k,name in
                                  [("audio","audio.wav"),("video","missing.mp4")]})
            path = folder / "record.json"
            path.write_text(json.dumps(self.doc),"utf-8")
            result = check.check_file(path,require_measured=True)
            self.assertEqual(result["status"],"MEASURED_FAIL")
            self.assertEqual({e["code"] for e in result["errors"]},{"MEDIA_HASH","MEDIA_READ"})

    def test_media_probe_duration_and_streams_using_mock_only(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            asset = folder / "fake"
            asset.write_bytes(b"not audio or video")
            ref = {"path":"fake","sha256":check.file_digest(asset)}
            self.doc["media"] = {"audio":ref,"video":ref}
            probe = {"format":{"duration":"61.000"},"streams":[{"codec_type":"audio"}]}
            report = check.Report()
            with patch.object(subprocess, "run", return_value=subprocess.CompletedProcess([], 0, stdout=json.dumps(probe))):
                check.verify_media(self.doc,folder,report)
                self.assertIn("MEDIA_READ", {e["code"] for e in report.errors})
                probe["streams"].append({"codec_type":"video"})
            report = check.Report()
            with patch.object(subprocess, "run", return_value=subprocess.CompletedProcess([], 0, stdout=json.dumps(probe))):
                check.verify_media(self.doc,folder,report)
            self.assertEqual([e["code"] for e in report.errors],["MEDIA_DURATION"])


if __name__ == "__main__":
    unittest.main()
