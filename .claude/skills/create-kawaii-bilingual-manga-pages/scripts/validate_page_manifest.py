#!/usr/bin/env python3
"""Validate flexible one- to four-panel bilingual manga page manifests."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


ALLOWED_SHAPES = {"soft-oval", "soft-round", "soft-cloud"}
ALLOWED_PAGE_MODES = {"reflective", "instructional"}
PRESET_COUNTS = {
    "single": 1,
    "hero-plus-one": 2,
    "hero-plus-two": 3,
    "hero-plus-three": 4,
}
STYLE_CONTRACT = {
    "panel_frame": "bordered-rectangle",
    "balloon_shape": "soft-oval",
    "balloon_language_order": "ja-then-en",
    "face_overlap_policy": "zero-intersection",
    "collision_action": "reject-and-recompose",
}


def load_pages(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return [data]
    raise ValueError("manifest root must be an object or array")


def checked_rect(region: object, label: str) -> tuple[float, float, float, float]:
    if not isinstance(region, dict):
        raise ValueError(f"{label}: rectangle must be an object")
    try:
        x = float(region["x"])
        y = float(region["y"])
        w = float(region["w"])
        h = float(region["h"])
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError(f"{label}: x, y, w, h must be numeric") from exc
    if x < 0 or y < 0 or w <= 0 or h <= 0 or x + w > 1 or y + h > 1:
        raise ValueError(f"{label}: rectangle must be positive and within normalized page bounds")
    return x, y, x + w, y + h


def contained(inner: tuple[float, float, float, float], outer: tuple[float, float, float, float]) -> bool:
    return inner[0] >= outer[0] and inner[1] >= outer[1] and inner[2] <= outer[2] and inner[3] <= outer[3]


def words(value: str) -> int:
    return len([part for part in value.replace("\n", " ").split(" ") if part])


def validate_page(page: object, source: Path) -> tuple[list[str], list[str]]:
    if not isinstance(page, dict):
        return [f"{source.name}: page must be an object"], []

    page_id = str(page.get("scene_id") or page.get("page_id") or "unknown-page")
    prefix = f"{source.name}:{page_id}"
    errors: list[str] = []
    warnings: list[str] = []

    page_mode = str(page.get("page_mode") or "")
    if page_mode not in ALLOWED_PAGE_MODES:
        errors.append(f"{prefix}: page_mode must be one of {sorted(ALLOWED_PAGE_MODES)}")

    contract = page.get("style_contract")
    if not isinstance(contract, dict):
        errors.append(f"{prefix}: style_contract is required")
    else:
        for key, expected in STYLE_CONTRACT.items():
            if contract.get(key) != expected:
                errors.append(f"{prefix}: style_contract.{key} must be {expected!r}")

    raw_panel_count = page.get("panel_count")
    try:
        numeric_panel_count = float(raw_panel_count)
        panel_count = int(numeric_panel_count) if numeric_panel_count.is_integer() else 0
    except (TypeError, ValueError):
        panel_count = 0
    if panel_count not in {1, 2, 3, 4}:
        errors.append(f"{prefix}: panel_count must be 1, 2, 3, or 4")

    preset = str(page.get("layout_preset") or "")
    if preset not in PRESET_COUNTS:
        errors.append(f"{prefix}: layout_preset must be one of {sorted(PRESET_COUNTS)}")
    elif panel_count and PRESET_COUNTS[preset] != panel_count:
        errors.append(f"{prefix}: layout_preset {preset!r} does not match panel_count {panel_count}")

    panels = page.get("panels")
    if not isinstance(panels, list):
        errors.append(f"{prefix}: panels must be an array")
        panels = []
    if panel_count and len(panels) != panel_count:
        errors.append(f"{prefix}: panels has {len(panels)} entries but panel_count is {panel_count}")

    seen_panels: set[str] = set()
    seen_balloons: set[str] = set()
    for panel_index, panel in enumerate(panels, start=1):
        label = f"{prefix}:panel-{panel_index}"
        if not isinstance(panel, dict):
            errors.append(f"{label}: panel must be an object")
            continue
        panel_id = str(panel.get("panel_id") or "").strip()
        if not panel_id:
            errors.append(f"{label}: panel_id is required")
        elif panel_id in seen_panels:
            errors.append(f"{label}: duplicate panel_id {panel_id!r}")
        seen_panels.add(panel_id)
        if not str(panel.get("action") or "").strip():
            errors.append(f"{label}: action is required")
        try:
            frame = checked_rect(panel.get("frame"), f"{label}:frame")
        except ValueError as exc:
            errors.append(str(exc))
            frame = None

        balloons = panel.get("balloons")
        if not isinstance(balloons, list) or not balloons:
            errors.append(f"{label}: every panel needs at least one bilingual balloon")
            balloons = []
        if len(balloons) > 2:
            errors.append(f"{label}: use no more than two balloons in one panel")

        for balloon_index, balloon in enumerate(balloons, start=1):
            balloon_label = f"{label}:balloon-{balloon_index}"
            if not isinstance(balloon, dict):
                errors.append(f"{balloon_label}: balloon must be an object")
                continue
            balloon_id = str(balloon.get("balloon_id") or "").strip()
            if not balloon_id:
                errors.append(f"{balloon_label}: balloon_id is required")
            elif balloon_id in seen_balloons:
                errors.append(f"{balloon_label}: duplicate balloon_id {balloon_id!r}")
            seen_balloons.add(balloon_id)

            shape = str(balloon.get("shape") or "")
            if shape not in ALLOWED_SHAPES:
                errors.append(f"{balloon_label}: shape must be one of {sorted(ALLOWED_SHAPES)}")
            ja = str(balloon.get("text_ja") or "").strip()
            en = str(balloon.get("text_en") or "").strip()
            if not ja:
                errors.append(f"{balloon_label}: text_ja is required")
            if not en:
                errors.append(f"{balloon_label}: text_en is required")
            if balloon.get("language_order") != "ja-then-en":
                errors.append(f"{balloon_label}: language_order must be 'ja-then-en'")
            if len("".join(ja.split())) > 55:
                warnings.append(f"{balloon_label}: Japanese exceeds the 55-character soft limit")
            if words(en) > 22:
                warnings.append(f"{balloon_label}: English exceeds the 22-word soft limit")

            try:
                balloon_rect = checked_rect(balloon, f"{balloon_label}:body")
                if frame and not contained(balloon_rect, frame):
                    errors.append(f"{balloon_label}: balloon body must stay inside its panel frame")
            except ValueError as exc:
                errors.append(str(exc))
            for key in ("tail_x", "tail_y"):
                try:
                    value = float(balloon[key])
                    if not 0 <= value <= 1:
                        raise ValueError
                except (KeyError, TypeError, ValueError):
                    errors.append(f"{balloon_label}: {key} must be a normalized number")
            if frame:
                try:
                    tail_x = float(balloon["tail_x"])
                    tail_y = float(balloon["tail_y"])
                    if not (frame[0] <= tail_x <= frame[2] and frame[1] <= tail_y <= frame[3]):
                        errors.append(f"{balloon_label}: tail endpoint must stay inside its panel frame")
                except (KeyError, TypeError, ValueError):
                    pass

    reflection_lines = page.get("reflection_ja_lines")
    if not isinstance(reflection_lines, list) or len(reflection_lines) not in {2, 3}:
        errors.append(f"{prefix}: reflection_ja_lines must contain exactly two or three lines")
    else:
        for index, line in enumerate(reflection_lines, start=1):
            value = str(line or "").strip()
            if not value:
                errors.append(f"{prefix}: reflection Japanese line {index} is empty")
            elif len(value) > 42:
                warnings.append(f"{prefix}: reflection Japanese line {index} exceeds 42 characters")

    reflection_en = str(page.get("reflection_en") or "").strip()
    if not reflection_en:
        errors.append(f"{prefix}: reflection_en is required")
    elif words(reflection_en) > 45:
        warnings.append(f"{prefix}: reflection_en exceeds the 45-word soft limit")

    point_card = page.get("point_card")
    if isinstance(point_card, dict) and point_card.get("enabled") is True:
        items_ja = point_card.get("items_ja")
        items_en = point_card.get("items_en")
        if not isinstance(items_ja, list) or not any(str(item or "").strip() for item in items_ja):
            errors.append(f"{prefix}: an enabled point_card needs Japanese items")
        if not isinstance(items_en, list) or not any(str(item or "").strip() for item in items_en):
            errors.append(f"{prefix}: an enabled point_card needs English items")

    phrases = page.get("useful_phrases_card")
    if isinstance(phrases, dict) and phrases.get("enabled") is True:
        items = phrases.get("items")
        if not isinstance(items, list) or not items:
            errors.append(f"{prefix}: an enabled useful_phrases_card needs items")
        else:
            for index, item in enumerate(items, start=1):
                if not isinstance(item, dict):
                    errors.append(f"{prefix}: useful phrase {index} must be an object")
                    continue
                if not str(item.get("text_ja") or "").strip() or not str(item.get("text_en") or "").strip():
                    errors.append(f"{prefix}: useful phrase {index} needs Japanese and English text")

    safety = page.get("face_safety")
    if not isinstance(safety, dict):
        errors.append(f"{prefix}: face_safety is required")
    else:
        if safety.get("contains_faces") is not True:
            errors.append(f"{prefix}: contains_faces must be true for character manga")
        if safety.get("contains_text") is not True:
            errors.append(f"{prefix}: contains_text must be true for bilingual manga")
        if not isinstance(safety.get("face_regions"), list) or not safety.get("face_regions"):
            errors.append(f"{prefix}: face_regions must contain every visible face")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifests", nargs="+", type=Path)
    args = parser.parse_args()

    errors: list[str] = []
    warnings: list[str] = []
    page_count = 0
    for path in args.manifests:
        try:
            pages = load_pages(path)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            errors.append(f"{path}: {exc}")
            continue
        page_count += len(pages)
        for page in pages:
            page_errors, page_warnings = validate_page(page, path)
            errors.extend(page_errors)
            warnings.extend(page_warnings)

    result = {"pages_checked": page_count, "errors": len(errors), "warnings": len(warnings), "passed": not errors}
    print(json.dumps(result, ensure_ascii=False))
    for warning in warnings:
        print(f"WARNING: {warning}", file=sys.stderr)
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
