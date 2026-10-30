#!/usr/bin/env python3
"""Create a non-destructive project scaffold from the bundled templates."""

from __future__ import annotations

import argparse
import copy
import csv
import json
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any


SKILL_ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = SKILL_ROOT / "assets"
PACK_TEMPLATE = ASSET_ROOT / "lesson-pack.template.json"
SAFETY_TEMPLATE = ASSET_ROOT / "medical-language-safety-register-50.csv"
METADATA_TEMPLATE = ASSET_ROOT / "kdp-metadata.template.json"
SOURCE_TEMPLATE = ASSET_ROOT / "source-verification.template.csv"

DUPLICATION_HEADER = [
    "lesson_no", "part", "title_ja", "scene_key", "learning_goal_key",
    "dialogue_signature", "explanation_signature", "grammar_pattern",
    "character_signature", "expression_signature", "composition_signature",
    "visual_signature", "patient_task", "safety_tier",
    "duplicate_checked_by", "review_date", "status", "notes",
]

VISUAL_QA_HEADER = [
    "lesson_no", "part", "exactly_four_panels", "no_generated_text",
    "rounded_balloons_inside_panels", "no_face_head_hand_equipment_overlap",
    "complete_adult_anatomy", "clinical_action_plausible",
    "comic_explanation_match", "translation_match", "linebreaks_safe",
    "ipad_100_percent", "scene_dialogue_visual_unique", "image_quality",
    "later_page_quality", "reviewer", "review_date", "final_status", "notes",
]


def part_for(lesson_no: int, lesson_count: int) -> int:
    return min(5, ((lesson_no - 1) * 5) // lesson_count + 1)


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"Template is not a JSON object: {path}")
    return data


def make_lesson(template: dict[str, Any], lesson_no: int, lesson_count: int) -> dict[str, Any]:
    lesson = copy.deepcopy(template)
    lesson["lesson_no"] = lesson_no
    lesson["part"] = part_for(lesson_no, lesson_count)
    prefix = f"L{lesson_no:02d}"
    panels = lesson["comic"]["panels"]
    for panel in panels:
        panel_no = panel["panel_no"]
        for balloon_no, utterance in enumerate(panel["dialogue"], start=1):
            utterance["balloon_id"] = f"{prefix}-P{panel_no}-B{balloon_no}"
    lesson["explanation"]["required_phrase_refs"] = [
        f"{prefix}-P1-B1",
        f"{prefix}-P3-B1",
    ]
    lesson["explanation"]["grammar"]["example_ref"] = f"{prefix}-P1-B1"
    return lesson


def read_header(path: Path) -> list[str]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.reader(handle)
        try:
            return next(reader)
        except StopIteration as exc:
            raise ValueError(f"CSV template has no header: {path}") from exc


def write_register(
    path: Path,
    header: list[str],
    lesson_count: int,
    defaults: dict[str, str],
) -> None:
    with path.open("x", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=header, extrasaction="ignore")
        writer.writeheader()
        for lesson_no in range(1, lesson_count + 1):
            row = {key: "" for key in header}
            row.update(defaults)
            row["lesson_no"] = str(lesson_no)
            row["part"] = str(part_for(lesson_no, lesson_count))
            writer.writerow(row)


def ensure_empty_target(target: Path) -> None:
    if target.exists():
        if not target.is_dir():
            raise FileExistsError(f"Target exists and is not a directory: {target}")
        if any(target.iterdir()):
            raise FileExistsError(f"Target directory is not empty: {target}")
    else:
        target.mkdir(parents=True)


def build_project(
    target: Path,
    lesson_count: int,
    prototype_count: int,
    overrides: dict[str, Any],
) -> list[Path]:
    if lesson_count < 1:
        raise ValueError("lesson count must be at least 1")
    if prototype_count < 1 or prototype_count > lesson_count:
        raise ValueError("prototype count must be between 1 and lesson count")
    ensure_empty_target(target)

    pack = load_json(PACK_TEMPLATE)
    project = pack["project"]
    project.update(overrides)
    project["lesson_count"] = lesson_count
    project["prototype_count"] = prototype_count
    lesson_template = pack["lessons"][0]
    pack["lessons"] = [
        make_lesson(lesson_template, lesson_no, lesson_count)
        for lesson_no in range(1, lesson_count + 1)
    ]

    for relative in (
        "art/source",
        "pages/editable",
        "pages/final",
        "review",
        "metadata",
        "output",
    ):
        (target / relative).mkdir(parents=True, exist_ok=True)

    created: list[Path] = []
    pack_path = target / "lesson-pack.json"
    with pack_path.open("x", encoding="utf-8") as handle:
        json.dump(pack, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    created.append(pack_path)

    duplication_path = target / "lesson-duplication-check.csv"
    write_register(duplication_path, DUPLICATION_HEADER, lesson_count, {"status": "planned"})
    created.append(duplication_path)

    qa_path = target / "visual-text-qa-register.csv"
    qa_header = VISUAL_QA_HEADER
    qa_defaults = {
        key: "pending"
        for key in qa_header
        if key not in {"lesson_no", "part", "reviewer", "review_date", "notes"}
    }
    write_register(qa_path, qa_header, lesson_count, qa_defaults)
    created.append(qa_path)

    safety_path = target / "medical-language-safety-register.csv"
    safety_header = read_header(SAFETY_TEMPLATE)
    safety_defaults = {
        key: "pending"
        for key in safety_header
        if key not in {"lesson_no", "part", "reviewer", "review_date", "notes"}
    }
    write_register(safety_path, safety_header, lesson_count, safety_defaults)
    created.append(safety_path)

    metadata = load_json(METADATA_TEMPLATE)
    metadata["title"]["japanese"] = project["title_ja"]
    metadata["title"]["english"] = project["title_en"]
    metadata["author"]["display"] = project["author"]
    metadata["author"]["romanization"] = project["author"]
    metadata["series"]["display"] = project["series"]
    metadata["series"]["volume"] = project["volume"]
    metadata_path = target / "metadata" / "kdp-metadata.json"
    with metadata_path.open("x", encoding="utf-8") as handle:
        json.dump(metadata, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    created.append(metadata_path)

    source_path = target / "review" / "source-verification.csv"
    shutil.copyfile(SOURCE_TEMPLATE, source_path)
    created.append(source_path)
    return created


def self_test() -> int:
    with tempfile.TemporaryDirectory(prefix="nurse-manga-studio-") as temp_dir:
        target = Path(temp_dir) / "project"
        created = build_project(
            target,
            lesson_count=7,
            prototype_count=3,
            overrides={"specialty": "test ward", "visual_mood": "test mood"},
        )
        if len(created) != 6 or not all(path.exists() for path in created):
            print("SELF-TEST FAILED: expected project files were not created", file=sys.stderr)
            return 1
        pack = load_json(target / "lesson-pack.json")
        lessons = pack.get("lessons", [])
        if len(lessons) != 7:
            print("SELF-TEST FAILED: lesson count is wrong", file=sys.stderr)
            return 1
        balloon_ids = {
            utterance["balloon_id"]
            for lesson in lessons
            for panel in lesson["comic"]["panels"]
            for utterance in panel["dialogue"]
        }
        if len(balloon_ids) != 28:
            print("SELF-TEST FAILED: balloon IDs are not unique", file=sys.stderr)
            return 1
        for filename in (
            "lesson-duplication-check.csv",
            "visual-text-qa-register.csv",
            "medical-language-safety-register.csv",
        ):
            with (target / filename).open("r", encoding="utf-8", newline="") as handle:
                rows = list(csv.reader(handle))
            if len(rows) != 8 or any(len(row) != len(rows[0]) for row in rows):
                print(f"SELF-TEST FAILED: malformed register {filename}", file=sys.stderr)
                return 1
        if not (target / "metadata" / "kdp-metadata.json").exists():
            print("SELF-TEST FAILED: KDP metadata template was not created", file=sys.stderr)
            return 1
        if not (target / "review" / "source-verification.csv").exists():
            print("SELF-TEST FAILED: source verification register was not created", file=sys.stderr)
            return 1
    print("SELF-TEST PASSED")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a nurse manga medical-English Kindle project scaffold."
    )
    parser.add_argument("project_dir", nargs="?", help="New or empty project directory")
    parser.add_argument("--lessons", type=int, default=50)
    parser.add_argument("--prototype", type=int, default=10)
    parser.add_argument("--specialty", default="general ward")
    parser.add_argument("--audience", default="Japanese nurses and nursing students")
    parser.add_argument("--cefr", default="A2-B1")
    parser.add_argument("--english-variety", default="American English")
    parser.add_argument(
        "--conversation-partner", default="English-speaking adult patient"
    )
    parser.add_argument("--volume", default="1")
    parser.add_argument(
        "--mood",
        default="Warm, gentle, lightly humorous, adult professional characters",
    )
    parser.add_argument("--self-test", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.self_test:
        return self_test()
    if not args.project_dir:
        print("ERROR: provide PROJECT_DIR or use --self-test", file=sys.stderr)
        return 2
    target = Path(args.project_dir).expanduser().resolve()
    overrides = {
        "specialty": args.specialty,
        "audience": args.audience,
        "cefr": args.cefr,
        "english_variety": args.english_variety,
        "conversation_partner": args.conversation_partner,
        "volume": args.volume,
        "visual_mood": args.mood,
    }
    try:
        created = build_project(target, args.lessons, args.prototype, overrides)
    except (FileExistsError, KeyError, OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print(f"Created project: {target}")
    for path in created:
        print(f"  - {path.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
