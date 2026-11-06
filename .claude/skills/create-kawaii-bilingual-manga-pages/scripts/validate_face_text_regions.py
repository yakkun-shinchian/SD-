#!/usr/bin/env python3
"""Reject manga manifests whose lettering or balloons cover a visible face."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


Rect = tuple[float, float, float, float]


def load_pages(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return [data]
    raise ValueError("manifest root must be an object or array")


def checked_rect(region: object, label: str) -> Rect:
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


def expand(rect: Rect, padding: float) -> Rect:
    x1, y1, x2, y2 = rect
    return max(0.0, x1 - padding), max(0.0, y1 - padding), min(1.0, x2 + padding), min(1.0, y2 + padding)


def intersects(a: Rect, b: Rect) -> bool:
    return max(a[0], b[0]) < min(a[2], b[2]) and max(a[1], b[1]) < min(a[3], b[3])


def balloon_tail_rect(balloon: dict, label: str) -> Rect:
    x = float(balloon["x"])
    y = float(balloon["y"])
    w = float(balloon["w"])
    h = float(balloon["h"])
    tx = float(balloon["tail_x"])
    ty = float(balloon["tail_y"])
    cx, cy = x + w / 2, y + h / 2
    dx, dy = tx - cx, ty - cy
    if dx == 0 and dy == 0:
        raise ValueError(f"{label}: tail endpoint cannot equal the balloon center")

    edge_scale = 0.5 / max(abs(dx) / w if w else 0, abs(dy) / h if h else 0)
    edge_scale = min(1.0, max(0.0, edge_scale))
    sx, sy = cx + dx * edge_scale, cy + dy * edge_scale
    margin = 0.004
    left, top = max(0.0, min(sx, tx) - margin), max(0.0, min(sy, ty) - margin)
    right, bottom = min(1.0, max(sx, tx) + margin), min(1.0, max(sy, ty) + margin)
    if right <= left or bottom <= top:
        raise ValueError(f"{label}: tail corridor is empty")
    return left, top, right, bottom


def collect_text_regions(page: dict, prefix: str, errors: list[str]) -> list[tuple[str, Rect]]:
    safety = page.get("face_safety") if isinstance(page.get("face_safety"), dict) else {}
    regions: list[tuple[str, Rect]] = []

    for index, region in enumerate(safety.get("text_regions") or []):
        region_id = str(region.get("id") or f"text-{index + 1}") if isinstance(region, dict) else f"text-{index + 1}"
        try:
            regions.append((region_id, checked_rect(region, f"{prefix}:{region_id}")))
        except ValueError as exc:
            errors.append(str(exc))

    panels = page.get("panels") if isinstance(page.get("panels"), list) else []
    for panel_index, panel in enumerate(panels, start=1):
        if not isinstance(panel, dict):
            continue
        balloons = panel.get("balloons") if isinstance(panel.get("balloons"), list) else []
        for balloon_index, balloon in enumerate(balloons, start=1):
            if not isinstance(balloon, dict):
                continue
            balloon_id = str(balloon.get("balloon_id") or f"p{panel_index}-b{balloon_index}")
            try:
                regions.append((f"{balloon_id}-body", checked_rect(balloon, f"{prefix}:{balloon_id}-body")))
            except ValueError as exc:
                errors.append(str(exc))
            try:
                regions.append((f"{balloon_id}-tail", balloon_tail_rect(balloon, f"{prefix}:{balloon_id}-tail")))
            except (KeyError, TypeError, ValueError) as exc:
                errors.append(str(exc))
    return regions


def validate_page(page: dict, source: Path, require_review: bool) -> list[str]:
    page_id = str(page.get("scene_id") or page.get("page_id") or "unknown-page")
    prefix = f"{source.name}:{page_id}"
    errors: list[str] = []
    safety = page.get("face_safety")
    if not isinstance(safety, dict):
        return [f"{prefix}: missing face_safety object"]

    contains_faces = safety.get("contains_faces", True)
    contains_text = safety.get("contains_text", True)
    face_regions = safety.get("face_regions")
    if face_regions is None:
        face_regions = safety.get("protected_regions") or []
    if not isinstance(face_regions, list):
        face_regions = []

    try:
        padding = float(safety.get("protected_padding", 0.012))
    except (TypeError, ValueError):
        padding = -1
    if padding < 0.008 or padding > 0.12:
        errors.append(f"{prefix}: protected_padding must be between 0.008 and 0.12")

    if contains_faces and not face_regions:
        errors.append(f"{prefix}: contains_faces is true but face_regions is empty")

    faces: list[tuple[str, Rect]] = []
    for index, region in enumerate(face_regions):
        face_id = str(region.get("id") or f"face-{index + 1}") if isinstance(region, dict) else f"face-{index + 1}"
        try:
            faces.append((face_id, expand(checked_rect(region, f"{prefix}:{face_id}"), max(padding, 0.008))))
        except ValueError as exc:
            errors.append(str(exc))

    text_regions = collect_text_regions(page, prefix, errors)
    if contains_text and not text_regions:
        errors.append(f"{prefix}: contains_text is true but no text or balloon regions were found")

    for face_id, face_rect in faces:
        for text_id, text_rect in text_regions:
            if intersects(face_rect, text_rect):
                errors.append(f"{prefix}: collision {text_id} -> {face_id}")

    if require_review:
        if safety.get("manual_100_percent_check_passed") is not True:
            errors.append(f"{prefix}: 100% visual review is not passed")
        if safety.get("pdf_epub_render_check_passed") is not True:
            errors.append(f"{prefix}: PDF/EPUB render review is not passed")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifests", nargs="+", type=Path)
    parser.add_argument("--require-review", action="store_true")
    args = parser.parse_args()

    errors: list[str] = []
    page_count = 0
    for path in args.manifests:
        try:
            pages = load_pages(path)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            errors.append(f"{path}: {exc}")
            continue
        page_count += len(pages)
        for page in pages:
            errors.extend(validate_page(page, path, args.require_review))

    result = {"pages_checked": page_count, "errors": len(errors), "passed": not errors}
    print(json.dumps(result, ensure_ascii=False))
    for error in errors:
        print(error, file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
