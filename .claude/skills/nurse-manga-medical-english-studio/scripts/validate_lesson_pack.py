#!/usr/bin/env python3
"""Validate canonical nurse-manga medical-English lesson data."""

from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path
import re
import sys
from typing import Any


BALLOON_ID = re.compile(r"^L(?P<lesson>\d{2,3})-P(?P<panel>[1-4])-B(?P<balloon>[1-2])$")
ALLOWED_TIERS = {"routine", "caution", "high"}
ALLOWED_INTERPRETER = {"not_needed", "consider", "qualified_required"}
APPROVED = {"approved", "pass", "passed"}
REQUIRED_QA_FIELDS = (
    "anatomy_and_clinical_action",
    "dialogue_match",
    "clinical_sequence",
    "duplicate_check",
    "image_quality",
    "interpreter_or_handoff",
    "ipad_readability",
    "medical_safety",
    "no_generated_text",
    "scene_dialogue_visual_unique",
    "text_and_linebreaks",
    "translation_match",
    "visual_overlap",
)


class Validation:
    def __init__(self, release: bool = False, template: bool = False) -> None:
        self.release = release
        self.template = template
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, path: str, message: str) -> None:
        self.errors.append(f"{path}: {message}")

    def warn(self, path: str, message: str) -> None:
        self.warnings.append(f"{path}: {message}")

    def required_text(self, value: Any, path: str) -> str:
        if not isinstance(value, str):
            self.error(path, "must be a string")
            return ""
        text = value.strip()
        if not text and not self.template:
            self.error(path, "must not be blank")
        return text

    def release_approval(self, value: Any, path: str) -> None:
        status = str(value).strip().lower()
        accepted = status in APPROVED or any(status.startswith(word + ":") for word in APPROVED)
        if self.release and not accepted:
            self.error(path, "must be approved/pass for --release")


def normalize(value: str) -> str:
    return " ".join(value.casefold().split())


def exact_duplicates(values: list[tuple[int, str]], label: str, check: Validation) -> None:
    grouped: dict[str, list[int]] = {}
    for number, value in values:
        key = normalize(value)
        if key:
            grouped.setdefault(key, []).append(number)
    for numbers in grouped.values():
        if len(numbers) > 1:
            check.error(label, f"duplicate across lessons {numbers}")


def expect_dict(value: Any, path: str, check: Validation) -> dict[str, Any]:
    if not isinstance(value, dict):
        check.error(path, "must be an object")
        return {}
    return value


def expect_list(value: Any, path: str, check: Validation) -> list[Any]:
    if not isinstance(value, list):
        check.error(path, "must be an array")
        return []
    return value


def validate_project(data: dict[str, Any], check: Validation) -> tuple[int, int]:
    project = expect_dict(data.get("project"), "project", check)
    for key in (
        "title_ja", "title_en", "volume", "specialty", "audience", "cefr",
        "english_variety", "conversation_partner", "author", "series",
    ):
        check.required_text(project.get(key), f"project.{key}")
    count = project.get("lesson_count")
    prototype = project.get("prototype_count")
    if not isinstance(count, int) or count < 1:
        check.error("project.lesson_count", "must be a positive integer")
        count = 0
    if not isinstance(prototype, int) or prototype < 1 or (count and prototype > count):
        check.error("project.prototype_count", "must be between 1 and lesson_count")
        prototype = 0
    width, height = project.get("page_width"), project.get("page_height")
    if not all(isinstance(value, int) and value > 0 for value in (width, height)):
        check.error("project.page_width/page_height", "must be positive integers")
    elif (width, height) != (1009, 1536) and abs((width / height) - (1009 / 1536)) > 0.002:
        check.warn("project.page_width/page_height", "differs from the studio 1009:1536 ratio")
    if project.get("reading_direction") not in {"ltr", "rtl"}:
        check.error("project.reading_direction", "must be ltr or rtl")
    check.release_approval(project.get("clinical_reviewer"), "project.clinical_reviewer")
    check.release_approval(project.get("english_reviewer"), "project.english_reviewer")
    return count, prototype


def validate_lesson(lesson: Any, position: int, check: Validation) -> dict[str, Any]:
    path = f"lessons[{position}]"
    item = expect_dict(lesson, path, check)
    number = item.get("lesson_no")
    if not isinstance(number, int) or number < 1:
        check.error(f"{path}.lesson_no", "must be a positive integer")
        number = position + 1
    part = item.get("part")
    if not isinstance(part, int) or part not in range(1, 6):
        check.error(f"{path}.part", "must be an integer from 1 to 5")

    texts: dict[str, str] = {}
    for key in (
        "title_ja", "title_en", "scene_key", "learning_goal", "patient_task",
        "character_signature", "expression_signature",
        "composition_signature", "visual_signature",
    ):
        texts[key] = check.required_text(item.get(key), f"{path}.{key}")

    comic = expect_dict(item.get("comic"), f"{path}.comic", check)
    panels = expect_list(comic.get("panels"), f"{path}.comic.panels", check)
    if len(panels) != 4:
        check.error(f"{path}.comic.panels", "must contain exactly four panels")
    balloon_map: dict[str, tuple[str, str]] = {}
    panel_numbers: list[int] = []
    dialogue_signature: list[str] = []
    for panel_index, panel_value in enumerate(panels):
        panel_path = f"{path}.comic.panels[{panel_index}]"
        panel = expect_dict(panel_value, panel_path, check)
        panel_no = panel.get("panel_no")
        panel_numbers.append(panel_no)
        check.required_text(panel.get("setting"), f"{panel_path}.setting")
        check.required_text(panel.get("visual_action"), f"{panel_path}.visual_action")
        dialogue = expect_list(panel.get("dialogue"), f"{panel_path}.dialogue", check)
        if not 1 <= len(dialogue) <= 2:
            check.error(f"{panel_path}.dialogue", "must contain one or two balloons")
        for balloon_index, balloon_value in enumerate(dialogue):
            balloon_path = f"{panel_path}.dialogue[{balloon_index}]"
            balloon = expect_dict(balloon_value, balloon_path, check)
            balloon_id = check.required_text(balloon.get("balloon_id"), f"{balloon_path}.balloon_id")
            speaker = check.required_text(balloon.get("speaker"), f"{balloon_path}.speaker")
            english = check.required_text(balloon.get("english"), f"{balloon_path}.english")
            japanese = check.required_text(balloon.get("japanese"), f"{balloon_path}.japanese")
            match = BALLOON_ID.match(balloon_id)
            if balloon_id and not match:
                check.error(f"{balloon_path}.balloon_id", "must match L01-P1-B1 style")
            elif match and (int(match.group("lesson")) != number or int(match.group("panel")) != panel_no):
                check.error(f"{balloon_path}.balloon_id", "lesson or panel number does not match its location")
            if balloon_id in balloon_map:
                check.error(f"{balloon_path}.balloon_id", "duplicate balloon ID")
            balloon_map[balloon_id] = (english, japanese)
            dialogue_signature.extend([speaker, english, japanese])
            if english and len(english) > 95:
                check.warn(f"{balloon_path}.english", "may be too long for one balloon")
            if japanese and len(japanese) > 55:
                check.warn(f"{balloon_path}.japanese", "may be too long for one balloon")
            if normalize(english).rstrip("?!. ") == "do you understand":
                check.warn(f"{balloon_path}.english", "do not use this as the sole comprehension check; prefer Teach-Back")
    if panel_numbers != [1, 2, 3, 4]:
        check.error(f"{path}.comic.panels", "panel_no values must be 1, 2, 3, 4 in order")

    explanation = expect_dict(item.get("explanation"), f"{path}.explanation", check)
    check.required_text(explanation.get("goal_ja"), f"{path}.explanation.goal_ja")
    refs = expect_list(explanation.get("required_phrase_refs"), f"{path}.explanation.required_phrase_refs", check)
    if not 2 <= len(refs) <= 3:
        check.error(f"{path}.explanation.required_phrase_refs", "must contain two or three balloon IDs")
    if len(refs) != len(set(refs)):
        check.error(f"{path}.explanation.required_phrase_refs", "must not repeat a balloon ID")
    for ref in refs:
        if ref not in balloon_map:
            check.error(f"{path}.explanation.required_phrase_refs", f"unknown balloon ID {ref!r}")

    vocabulary = expect_list(explanation.get("vocabulary"), f"{path}.explanation.vocabulary", check)
    if not 3 <= len(vocabulary) <= 5:
        check.error(f"{path}.explanation.vocabulary", "must contain three to five items")
    vocab_terms: list[str] = []
    for index, value in enumerate(vocabulary):
        vocab = expect_dict(value, f"{path}.explanation.vocabulary[{index}]", check)
        term = check.required_text(vocab.get("term"), f"{path}.explanation.vocabulary[{index}].term")
        vocab_terms.append(term)
        if (
            not check.template
            and not str(vocab.get("general_meaning_ja", "")).strip()
            and not str(vocab.get("medical_meaning_ja", "")).strip()
        ):
            check.error(
                f"{path}.explanation.vocabulary[{index}]",
                "must include a general or clinical Japanese meaning",
            )
        check.required_text(vocab.get("example_en"), f"{path}.explanation.vocabulary[{index}].example_en")
        check.required_text(vocab.get("example_ja"), f"{path}.explanation.vocabulary[{index}].example_ja")
    normalized_vocab = [normalize(term) for term in vocab_terms if normalize(term)]
    if len(normalized_vocab) != len(set(normalized_vocab)):
        check.error(f"{path}.explanation.vocabulary", "must not repeat a term")

    grammar = expect_dict(explanation.get("grammar"), f"{path}.explanation.grammar", check)
    check.required_text(grammar.get("pattern"), f"{path}.explanation.grammar.pattern")
    check.required_text(grammar.get("explanation_ja"), f"{path}.explanation.grammar.explanation_ja")
    example_ref = grammar.get("example_ref")
    if example_ref not in balloon_map:
        check.error(f"{path}.explanation.grammar.example_ref", f"unknown balloon ID {example_ref!r}")
    check.required_text(explanation.get("junior_high_bridge_ja"), f"{path}.explanation.junior_high_bridge_ja")

    applications = expect_list(explanation.get("applications"), f"{path}.explanation.applications", check)
    if len(applications) != 2:
        check.error(f"{path}.explanation.applications", "must contain exactly two examples")
    for index, value in enumerate(applications):
        app = expect_dict(value, f"{path}.explanation.applications[{index}]", check)
        check.required_text(app.get("english"), f"{path}.explanation.applications[{index}].english")
        check.required_text(app.get("japanese"), f"{path}.explanation.applications[{index}].japanese")

    common_error = expect_dict(explanation.get("common_error"), f"{path}.explanation.common_error", check)
    for key in ("avoid", "prefer", "why_ja"):
        check.required_text(common_error.get(key), f"{path}.explanation.common_error.{key}")
    mini = expect_dict(explanation.get("mini_practice"), f"{path}.explanation.mini_practice", check)
    for key in ("question_ja", "answer_en", "answer_ja"):
        check.required_text(mini.get(key), f"{path}.explanation.mini_practice.{key}")

    safety = expect_dict(item.get("safety"), f"{path}.safety", check)
    tier = safety.get("tier")
    if tier not in ALLOWED_TIERS:
        check.error(f"{path}.safety.tier", f"must be one of {sorted(ALLOWED_TIERS)}")
    interpreter = safety.get("interpreter_plan")
    if interpreter not in ALLOWED_INTERPRETER:
        check.error(f"{path}.safety.interpreter_plan", f"must be one of {sorted(ALLOWED_INTERPRETER)}")
    if not isinstance(safety.get("escalation_required"), bool):
        check.error(f"{path}.safety.escalation_required", "must be true or false")
    if tier == "high":
        if safety.get("escalation_required") is not True:
            check.error(f"{path}.safety.escalation_required", "must be true for high-risk lessons")
        if interpreter != "qualified_required":
            check.error(f"{path}.safety.interpreter_plan", "must be qualified_required for high-risk lessons")
        check.required_text(safety.get("handoff_phrase_en"), f"{path}.safety.handoff_phrase_en")
        check.required_text(safety.get("handoff_phrase_ja"), f"{path}.safety.handoff_phrase_ja")
        check.required_text(safety.get("potential_harm_ja"), f"{path}.safety.potential_harm_ja")
        check.required_text(explanation.get("safety_note_ja"), f"{path}.explanation.safety_note_ja")
        check.required_text(safety.get("local_policy_check_ja"), f"{path}.safety.local_policy_check_ja")
    elif tier == "caution" and not str(safety.get("local_policy_check_ja", "")).strip():
        check.warn(f"{path}.safety.local_policy_check_ja", "record the facility-policy dependency")
    check.release_approval(safety.get("human_medical_review"), f"{path}.safety.human_medical_review")
    check.release_approval(safety.get("human_english_review"), f"{path}.safety.human_english_review")

    qa = expect_dict(item.get("qa"), f"{path}.qa", check)
    for key in REQUIRED_QA_FIELDS:
        if key not in qa:
            check.error(f"{path}.qa.{key}", "missing QA field")
        else:
            check.release_approval(qa.get(key), f"{path}.qa.{key}")

    explanation_signature = json.dumps(
        {
            "goal": explanation.get("goal_ja"),
            "vocabulary": vocabulary,
            "grammar": grammar,
            "junior_high_bridge": explanation.get("junior_high_bridge_ja"),
            "applications": applications,
            "error": common_error,
            "safety_note": explanation.get("safety_note_ja"),
            "practice": mini,
        },
        ensure_ascii=False,
        sort_keys=True,
    )
    return {
        "lesson_no": number,
        "part": part,
        **texts,
        "dialogue_signature": "|".join(dialogue_signature),
        "explanation_signature": explanation_signature,
        "balloon_ids": list(balloon_map),
    }


def validate(data: Any, release: bool = False, template: bool = False) -> Validation:
    check = Validation(release=release, template=template)
    root = expect_dict(data, "root", check)
    expected_count, _ = validate_project(root, check)
    lessons = expect_list(root.get("lessons"), "lessons", check)
    if expected_count and len(lessons) != expected_count and not template:
        check.error("lessons", f"contains {len(lessons)} lessons; project.lesson_count is {expected_count}")
    records = [validate_lesson(value, index, check) for index, value in enumerate(lessons)]
    numbers = [record["lesson_no"] for record in records]
    if numbers != list(range(1, len(records) + 1)):
        check.error("lessons.lesson_no", "must be unique and continuous from 1 in array order")
    if expected_count == 50 and not template:
        part_counts = Counter(record.get("part") for record in records)
        for part in range(1, 6):
            if part_counts[part] != 10:
                check.error(f"lessons.part.{part}", f"must contain 10 lessons; found {part_counts[part]}")
    if not template:
        for key in (
            "title_ja", "title_en", "scene_key", "learning_goal", "patient_task",
            "character_signature", "expression_signature", "composition_signature",
            "visual_signature", "dialogue_signature", "explanation_signature",
        ):
            exact_duplicates([(record["lesson_no"], record[key]) for record in records], key, check)
    all_ids = [balloon_id for record in records for balloon_id in record["balloon_ids"] if balloon_id]
    for balloon_id, count in Counter(all_ids).items():
        if count > 1:
            check.error("balloon_id", f"{balloon_id!r} occurs {count} times")
    return check


def render(check: Validation, source: Path) -> str:
    lines = [
        f"Lesson-pack validation: {source}",
        f"Errors: {len(check.errors)}",
        f"Warnings: {len(check.warnings)}",
    ]
    if check.errors:
        lines.append("\nERRORS")
        lines.extend(f"- {item}" for item in check.errors)
    if check.warnings:
        lines.append("\nWARNINGS")
        lines.extend(f"- {item}" for item in check.warnings)
    if not check.errors and not check.warnings:
        lines.append("PASS")
    elif not check.errors:
        lines.append("PASS WITH WARNINGS")
    else:
        lines.append("FAIL")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("lesson_pack", type=Path)
    parser.add_argument("--release", action="store_true")
    parser.add_argument("--template", action="store_true", help="Allow blank content while checking structure")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    try:
        data = json.loads(args.lesson_pack.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    check = validate(data, release=args.release, template=args.template)
    output = render(check, args.lesson_pack)
    print(output, end="")
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(output, encoding="utf-8")
    return 1 if check.errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
