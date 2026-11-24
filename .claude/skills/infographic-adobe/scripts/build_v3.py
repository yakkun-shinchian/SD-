"""Create a standalone AE JSX from the approved V3 script and measured final voice."""
import argparse
import json
import math
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "info-v3-narration-qa" / "scripts"))
import check as qa
from jsonschema import Draft202012Validator

TEMPLATE = HERE / "YakubonInfographic.jsx"
TOKEN = "/* @V3_JOB@ */ null"
COLORS = {"red":"ff0000", "yellow":"ffff00", "blue":"0000ff", "green":"008000",
          "lightblue":"add8e6", "cyan":"00ffff", "white":"ffffff"}


def source_schema():
    # Final video and observed underlines are produced after AE authoring.
    # Keep the shared contract for the artwork, plan and voice lists.
    base = qa.SCHEMA.schema
    fields = ("version", "part", "duration_ms", "speed", "evidence", "audio_timing",
              "listenability", "slides", "plan", "speech", "bridges", "underline_colors")
    return Draft202012Validator({
        "$defs": base["$defs"], "type":"object",
        "properties": {k:base["properties"][k] for k in fields},
        "required":[k for k in fields if k not in ("bridges","underline_colors")],
    })


def rgb(value):
    value = COLORS.get(value, value.lstrip("#"))
    return [int(value[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def compile_job(doc, base, output_dir, fps):
    errors = list(source_schema().iter_errors(doc))
    if errors:
        raise ValueError(f"{errors[0].json_path}: {errors[0].message}")
    if doc["evidence"] != "measured" or doc["audio_timing"] not in ("reviewed_alignment", "final_audio_listening"):
        raise ValueError("速度調整・無音編集後の完成音声の実測値を指定してください。")
    if doc["speed"] > 1.5 or doc["duration_ms"] > qa.LIMIT_MS or doc["listenability"] != "clear":
        raise ValueError("台本の尺、速度、試聴結果を確認してください。")
    report = qa.Report()
    sentences, lines = qa.index_source(doc, report)
    expected = qa.audit_plan(doc, sentences, report)
    qa.audit_speech(doc, lines, expected, report)
    if report.errors:
        raise ValueError(json.dumps(report.errors, ensure_ascii=False))

    def asset_path(value):
        path = (base / value).resolve(strict=True)
        if not path.is_file():
            raise ValueError(f"ファイルを指定してください：{path}")
        try:
            relative = os.path.relpath(path, output_dir)
        except ValueError:  # Drive letter differs on Windows.
            return path, path.as_posix()
        return path, Path(relative).as_posix()

    media = doc.get("media")
    audio = media.get("audio") if isinstance(media, dict) else None
    if not isinstance(audio, dict) or not isinstance(audio.get("path"), str):
        raise ValueError("media.audio に完成音声の path と sha256 を指定してください。")
    audio_file, audio_ref = asset_path(audio["path"])
    if qa.file_digest(audio_file) != audio.get("sha256"):
        raise ValueError("完成音声のSHA-256が一致しません。実測した版を指定してください。")
    pages = {}
    for page in doc["slides"]:
        _, image_ref = asset_path(page["image"])
        pages[page["id"]] = dict(id=page["id"], image=image_ref, start=page["start_ms"],
                                 end=page["end_ms"], marks=[])

    palette = doc.get("underline_colors", {})
    for cue in doc["speech"]:
        if cue["line_id"] is None:
            continue
        line, sentence, page = lines[cue["line_id"]]
        start, end = cue["start_ms"], cue["end_ms"]
        if math.ceil(start * fps / 1000) >= math.ceil(end * fps / 1000):
            raise ValueError(f"{cue['id']} の区間に表示フレームがありません。fpsと実測時刻を確認してください。")
        role = sentence["kind"]
        color = palette.get(role, palette.get("all", "red" if role == "heading" else "yellow"))
        pages[page["id"]]["marks"].append(dict(cue=cue["id"], line=line["id"], box=line["box"],
                                               start=start, end=end, color=rgb(color)))
    return dict(part=doc["part"], durationMs=doc["duration_ms"], audio=audio_ref,
                lastSpeechMs=doc["speech"][-1]["end_ms"], fps=fps, slides=list(pages.values()))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("output", type=Path, help="新規作成する .jsx")
    parser.add_argument("--fps", type=int, choices=range(1, 100), metavar="1-99", default=30)
    args = parser.parse_args()
    if args.output.suffix.lower() != ".jsx":
        parser.error("出力の拡張子は .jsx です。")
    try:
        doc = json.loads(args.manifest.read_text("utf-8-sig"), object_pairs_hook=qa.unique_keys,
                         parse_constant=qa.reject_constant)
        job = compile_job(doc, args.manifest.parent, args.output.parent.resolve(), args.fps)
        template = TEMPLATE.read_text("utf-8")
        if template.count(TOKEN) != 1:
            raise ValueError("JSXテンプレートの挿入箇所を確認してください。")
        jsx = template.replace(TOKEN, json.dumps(job, ensure_ascii=True, allow_nan=False))
        with args.output.open("x", encoding="utf-8-sig") as out:
            out.write(jsx)
    except (OSError, ValueError) as exc:
        parser.exit(1, f"{exc}\n")
    print(args.output)


if __name__ == "__main__":
    main()
