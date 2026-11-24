"""Audit an Info V3 narration/underline manifest. Python 3.9+."""
import argparse
import hashlib
import json
import subprocess
import sys
import unicodedata
from collections import Counter
from decimal import Decimal, InvalidOperation
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = Draft202012Validator(json.loads((ROOT / "references/manifest.schema.json").read_text("utf-8")))
LIMIT_MS = 60_000
SYNC_MS = 150
FADE_MS = 300
CORE = {"conclusion", "mechanism", "observation"}


def spoken_form(value):
    # Preserve clinical punctuation, signs, units, digits and negation.
    text = unicodedata.normalize("NFC", value)
    return "".join(c for c in text if not c.isspace() and c not in "、。")


class Report:
    def __init__(self):
        self.errors = []
        self.notes = []

    def fail(self, code, where, message):
        self.errors.append({"code": code, "at": where, "message": message})

    def unique(self, items, label):
        for key, count in Counter(items).items():
            if count > 1:
                self.fail("DUPLICATE", key, f"{label} が {count} 回あります。")


def index_source(doc, report):
    slides = doc["slides"]
    if len(slides) != 4:
        report.fail("PAGE_COUNT", doc["part"], f"原図は {len(slides)} 枚です。1部4枚で構成してください。")
    report.unique([slide["id"] for slide in slides], "原図ID")
    sentences, lines = {}, {}
    last_end = 0
    for slide in slides:
        if slide["start_ms"] != last_end or slide["end_ms"] <= slide["start_ms"]:
            report.fail("SLIDE_TIME", slide["id"], "原図の表示区間に重なり、空白、または逆転があります。")
        last_end = slide["end_ms"]
        for sentence in slide["sentences"]:
            sid = sentence["id"]
            if sid in sentences:
                report.fail("DUPLICATE", sid, "文IDが重複しています。")
            sentences[sid] = (sentence, slide)
            for line in sentence["lines"]:
                lid = line["id"]
                if lid in lines:
                    report.fail("DUPLICATE", lid, "原図の行IDが重複しています。")
                lines[lid] = (line, sentence, slide)
                left, top, right, bottom = line["box"]
                if left >= right or top >= bottom:
                    report.fail("TEXT_BOX", lid, "原図の文字矩形に幅または高さがありません。")
    if last_end != doc["duration_ms"]:
        report.fail("SLIDE_TIME", doc["part"], "最終原図の終了時刻と動画尺が一致しません。")
    return sentences, lines


def audit_plan(doc, sentences, report):
    plan = doc["plan"]
    report.unique(plan, "台本の文ID")
    seen, covered, expected = set(), set(), []
    for i, sid in enumerate(plan):
        if sid not in sentences:
            report.fail("UNKNOWN_SENTENCE", sid, "台本の文が原図にありません。")
            continue
        sentence, slide = sentences[sid]
        if i == 0 and not sentence["can_open"]:
            report.fail("ABRUPT_OPENING", sid, "テーマや主語が分かる導入文を先に選んでください。")
        for dep in sentence.get("requires", []):
            if dep not in seen:
                report.fail("MISSING_CONTEXT", sid, f"前提の文 {dep} が先に読まれていません。")
        expected.extend(line["id"] for line in sentence["lines"])
        seen.add(sid)
        covered.add(slide["id"])
    for slide in doc["slides"]:
        if slide["id"] not in covered:
            report.fail("SILENT_SLIDE", slide["id"], "この原図の読み上げがありません。")
        reads_detail = any(s["id"] in seen and s["role"] == "detail" for s in slide["sentences"])
        for sentence in slide["sentences"]:
            sid = sentence["id"]
            if sid not in seen:
                if sentence["essential"]:
                    report.fail("ESSENTIAL_OMITTED", sid, "この教材の必読文が台本から抜けています。")
                elif reads_detail and sentence["role"] in CORE:
                    report.notes.append(f"{sid}：同じ原図の補足を読む前に、この重要文の優先度を再確認してください。")
    roles_read = {sentences[sid][0]["role"] for sid in seen}
    for role, label in [("conclusion", "結論"), ("mechanism", "発生機序"), ("observation", "観察ポイント")]:
        if role not in roles_read and any(s["role"] == role for s, _ in sentences.values()):
            report.notes.append(f"原図にある{label}が、この部の台本に採用されていません。選定理由を確認してください。")
    return expected


def audit_speech(doc, lines, expected, report):
    cues = doc["speech"]
    report.unique([c["id"] for c in cues], "発話ID")
    actual = [c["line_id"] for c in cues if c["line_id"] is not None]
    if actual != expected:
        report.fail("SPEECH_PLAN", doc["part"], f"台本の行順 {expected} と発話の行順 {actual} が異なります。")
    last_end = 0
    sentence_ends = {}
    bridges = doc.get("bridges", {})
    recorded_bridges = {c["id"] for c in cues if c["line_id"] is None}
    for cid in bridges.keys() - recorded_bridges:
        report.fail("BRIDGE", cid, "台本のつなぎ文に対応する発話がありません。")
    for cue in cues:
        cid, lid = cue["id"], cue["line_id"]
        start, end = cue["start_ms"], cue["end_ms"]
        if not last_end <= start < end <= doc["duration_ms"]:
            report.fail("SPEECH_TIME", cid, "発話区間の順序・長さ・動画尺を確認してください。")
        last_end = end
        if lid is None:
            if cid not in bridges or spoken_form(cue["transcript"]) != spoken_form(bridges[cid]):
                report.fail("BRIDGE", cid, "原図外のつなぎ文を承認した台本と照合してください。")
            continue
        if lid not in lines:
            report.fail("UNKNOWN_LINE", cid, f"発話が参照する行 {lid} が原図にありません。")
            continue
        line, sentence, slide = lines[lid]
        if start < slide["start_ms"] or end > slide["end_ms"]:
            report.fail("SPEECH_SLIDE", cid, f"{lid} の原図が発話中に表示されていません。")
        target = spoken_form(line.get("spoken", line["text"]))
        if not target or spoken_form(cue["transcript"]) != target:
            report.fail("SPOKEN_TEXT", cid, f"聞き取った文「{cue['transcript']}」と {lid} の原文・承認読みが異なります。")
        sentence_ends[sentence["id"]] = end
    return sentence_ends


def under_text(segment, box):
    left, y, right = segment
    x1, top, x2, bottom = box
    # Full-line stroke envelope in source coordinates, independent of zoom.
    # Allow rounded ends and narrow text margins; reject a short token underline.
    width = x2 - x1
    return (width > 0 and top < bottom and right > left
            and abs(left - x1) <= width * 0.20 and abs(right - x2) <= width * 0.20
            and bottom <= y <= bottom + max(2, (bottom - top) * 0.5))


def audit_underlines(doc, lines, sentence_ends, report):
    cues = doc["speech"]
    marks = doc["underlines"]
    report.unique([m["cue_id"] for m in marks], "1発話に対応する下線")
    by_cue = {m["cue_id"]: m for m in marks}
    cue_ids = {c["id"] for c in cues}
    for extra in by_cue.keys() - cue_ids:
        report.fail("EXTRA_UNDERLINE", extra, "対応する発話がありません。")
    previous_focus_end = 0
    next_sentence_start = doc["duration_ms"]
    # Find the next sentence boundary so earlier lines of a multi-line sentence
    # can fade together, without leaving the old sentence marked under new speech.
    boundaries = {}
    next_sid, next_start = None, doc["duration_ms"]
    for cue in reversed(cues):
        row = lines.get(cue["line_id"])
        sid = row[1]["id"] if row else None
        if sid != next_sid:
            next_sentence_start = next_start
        boundaries[cue["id"]] = next_sentence_start
        next_sid, next_start = sid, cue["start_ms"]

    palette = doc.get("underline_colors", {})
    for cue in cues:
        cid, expected_lid = cue["id"], cue["line_id"]
        mark = by_cue.get(cid)
        if expected_lid is None:
            if mark is not None:
                report.fail("BRIDGE_UNDERLINE", cid, "原図に対応しないつなぎ文に下線があります。")
            continue
        if mark is None:
            report.fail("MISSING_UNDERLINE", cid, "発話に対応する下線がありません。")
            continue
        lid = mark["line_id"]
        if expected_lid != lid:
            report.fail("WRONG_TARGET", cid, f"読んだ行 {expected_lid} に対して、下線は {lid} を指しています。")
        start, focus_end, off = mark["on_ms"], mark["focus_end_ms"], mark["off_ms"]
        if not previous_focus_end <= start < focus_end <= off <= doc["duration_ms"]:
            report.fail("UNDERLINE_TIME", cid, "下線の活動区間が重なるか、表示・消去順または動画尺が不正です。")
        previous_focus_end = focus_end
        for name, actual, measured in [("START_DRIFT", start, cue["start_ms"]),
                                       ("END_DRIFT", focus_end, cue["end_ms"])]:
            delta = actual - measured
            if abs(delta) > SYNC_MS:
                sign = "+" if delta > 0 else ""
                report.fail(name, cid, f"発話時刻 {measured} ms、下線時刻 {actual} ms、差 {sign}{delta} ms（許容 ±{SYNC_MS} ms）。")
        row = lines.get(lid)
        if row is None:
            report.fail("UNKNOWN_LINE", cid, f"下線の行 {lid} が原図にありません。")
            continue
        line, sentence, slide = row
        if not under_text(mark["segment"], line["box"]):
            report.fail("UNDERLINE_POSITION", cid, f"下線の原図座標が {lid} の文字直下・行幅に合いません。")
        if start < slide["start_ms"] or off > slide["end_ms"]:
            report.fail("UNDERLINE_SLIDE", cid, f"{lid} の原図表示区間から下線がはみ出しています。")
        kind = sentence["kind"]
        color = palette.get(kind, palette.get("all", {"heading":"red", "body":"yellow"}[kind]))
        if mark["color"].lower() != color.lower():
            report.fail("COLOR", cid, f"下線色 {mark['color']} を指定色 {color} と照合してください。")
        if expected_lid in lines:
            expected_sid = lines[expected_lid][1]["id"]
            if off > min(sentence_ends[expected_sid] + FADE_MS, boundaries[cid]):
                report.fail("STALE_UNDERLINE", cid, "文末の消去期限または次の文の開始を過ぎても下線が残っています。")


def audit(doc, *, require_measured=False):
    report = Report()
    for error in SCHEMA.iter_errors(doc):
        report.fail("FORMAT", error.json_path, error.message)
    if report.errors:
        return report
    measured = doc["evidence"] == "measured"
    if require_measured and not measured:
        report.fail("FIXTURE_ONLY", doc["part"], "仮想データは実測用の検品に使用できません。")
    if doc["duration_ms"] > LIMIT_MS:
        report.fail("DURATION", doc["part"], f"{doc['duration_ms']} msです。4枚で60秒以内に文章量を調整してください。")
    speed = doc.get("speed", 1.3)
    if speed > 1.5:
        report.fail("SPEED", doc["part"], "音声速度の上限は1.5倍です。")
    if doc["listenability"] == "revise" or (measured and doc["listenability"] != "clear"):
        report.fail("LISTENABILITY", doc["part"], "試聴で聞きやすさを確認し、聞き取りにくければ文量を減らしてください。")
    sentences, lines = index_source(doc, report)
    expected = audit_plan(doc, sentences, report)
    ends = audit_speech(doc, lines, expected, report)
    audit_underlines(doc, lines, ends, report)
    return report


def file_digest(path):
    digest = hashlib.sha256()
    with path.open("rb") as reader:
        for chunk in iter(lambda: reader.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_media(doc, folder, report):
    for kind, asset in doc["media"].items():
        path = (folder / asset["path"]).resolve()
        try:
            if file_digest(path) != asset["sha256"]:
                report.fail("MEDIA_HASH", kind, "実測した素材と現在のファイルで SHA-256 が異なります。")
                continue
            probe = subprocess.run(["ffprobe", "-v", "error",
                                    "-show_entries", "format=duration:stream=codec_type", "-of", "json",
                                    str(path)], capture_output=True, check=True, text=True)
            data = json.loads(probe.stdout)
            types = {s["codec_type"] for s in data["streams"]}
            if "audio" not in types or (kind == "video" and "video" not in types):
                raise ValueError("指定された種類のストリームがありません。")
            ms = Decimal(data["format"]["duration"]) * 1000
            if not ms.is_finite() or ms <= 0:
                raise ValueError("素材の長さを取得できません。")
            if kind == "video" and (abs(ms - Decimal(str(doc["duration_ms"]))) > 1 or ms > LIMIT_MS):
                report.fail("MEDIA_DURATION", kind, f"最終動画の実尺 {ms} ms と申告尺・60秒上限を確認してください。")
            if kind == "audio" and any(c["end_ms"] > ms + 1 for c in doc["speech"]):
                report.fail("MEDIA_DURATION", kind, "発話の終了時刻が完成音声の尺を超えています。")
        except (OSError, subprocess.SubprocessError, KeyError, ValueError, InvalidOperation) as exc:
            report.fail("MEDIA_READ", kind, f"素材または ffprobe の確認が必要です。{exc}")


def unique_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"重複したJSONキー {key}")
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError(f"JSON数値として使用できません：{value}")


def check_file(path, *, require_measured=False):
    try:
        doc = json.loads(path.read_text("utf-8-sig"), object_pairs_hook=unique_keys, parse_constant=reject_constant)
    except (OSError, ValueError) as exc:
        return {"file": str(path), "status":"INPUT_ERROR", "errors":[{"code":"INPUT","message":str(exc)}], "notes":[]}
    report = audit(doc, require_measured=require_measured)
    if any(e["code"] == "FORMAT" for e in report.errors):
        status = "INPUT_ERROR"
    else:
        if doc["evidence"] == "measured":
            verify_media(doc, path.parent, report)
        status = doc["evidence"].upper() + ("_FAIL" if report.errors else "_PASS")
    return {"file":str(path), "status":status, "errors":report.errors, "notes":report.notes}


def main():
    parser = argparse.ArgumentParser(description="インフォV3の1部4枚を検品します。時刻単位はms。")
    parser.add_argument("manifests", nargs="+", type=Path)
    parser.add_argument("--require-measured", action="store_true", help="仮想データを不合格にする")
    args = parser.parse_args()
    results = [check_file(path, require_measured=args.require_measured) for path in args.manifests]
    print(json.dumps(results, ensure_ascii=False, indent=2))
    if any(r["status"] == "INPUT_ERROR" for r in results):
        return 2
    return int(any(r["errors"] for r in results))


if __name__ == "__main__":
    sys.exit(main())
