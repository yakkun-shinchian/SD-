import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import build_v3 as builder


class BuildTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.base = Path(temp.name)
        fixture = ROOT.parent / "info-v3-narration-qa/examples/synthetic.json"
        self.doc = json.loads(fixture.read_text(encoding="utf-8"))
        # Stub assets exercise file identity and transport only.
        voice = self.base / "ナレーション.wav"
        voice.write_bytes(b"fixture bytes")
        for slide in self.doc["slides"]:
            (self.base / slide["image"]).write_bytes(b"fixture bytes")
        self.doc.update(evidence="measured", audio_timing="final_audio_listening", listenability="clear",
                        media={"audio":{"path":voice.name, "sha256":builder.qa.file_digest(voice)}})
        self.doc.pop("underlines")
        self.doc.pop("underline_timing")

    def compile(self):
        return builder.compile_job(self.doc, self.base, self.base, 30)

    def test_four_pages_and_measured_keys(self):
        job = self.compile()
        self.assertEqual(len(job["slides"]), 4)
        self.assertEqual(job["audio"], "ナレーション.wav")
        marks = [m for page in job["slides"] for m in page["marks"]]
        for cue, mark in zip(self.doc["speech"], marks):
            self.assertEqual([mark["line"], mark["start"], mark["end"]],
                             [cue["line_id"], cue["start_ms"], cue["end_ms"]])
        self.assertEqual(len(marks), len(self.doc["speech"]))
        self.assertEqual(marks[-1]["color"], [128/255,222/255,234/255])

    def test_wrong_audio_and_estimated_timing_fail(self):
        self.doc["audio_timing"] = "fixture"
        with self.assertRaises(ValueError):
            self.compile()
        self.doc["audio_timing"] = "final_audio_listening"
        self.doc["media"]["audio"]["sha256"] = "0"*64
        with self.assertRaises(ValueError):
            self.compile()

    def test_ignores_previous_wrong_mark_and_honors_role_color(self):
        self.doc["underlines"] = [{"line_id":"D4-1","on_ms":0}]
        self.doc["underline_colors"]["heading"] = "blue"
        job = self.compile()
        self.assertEqual(job["slides"][0]["marks"][0]["color"],[0,0,1])
        self.assertEqual(job["slides"][3]["marks"][0]["line"],"S7-1")

    def test_wrong_speech_and_impossible_frame_rejected(self):
        cue = self.doc["speech"][0]
        cue["transcript"] += "違う文"
        with self.assertRaisesRegex(ValueError, "SPOKEN_TEXT"):
            self.compile()
        cue["transcript"] = cue["transcript"][:-3]
        cue.update(start_ms=151, end_ms=152)
        with self.assertRaisesRegex(ValueError, "フレーム"):
            self.compile()

    def test_real_cli_emits_standalone_jsx_without_overwriting(self):
        manifest = self.base / "front.json"
        manifest.write_text(json.dumps(self.doc),encoding="utf-8")
        target = self.base / "front.jsx"
        cmd = [sys.executable,str(ROOT/"scripts/build_v3.py"),str(manifest),str(target)]
        subprocess.run(cmd, check=True, capture_output=True)
        data = target.read_text("utf-8-sig")
        self.assertNotIn(builder.TOKEN,data)
        self.assertIn("app.project.items.addComp",data)
        self.assertNotIn(str(self.base),data)
        self.assertNotEqual(subprocess.run(cmd,capture_output=True).returncode,0)
        self.assertEqual(data,target.read_text("utf-8-sig"))
