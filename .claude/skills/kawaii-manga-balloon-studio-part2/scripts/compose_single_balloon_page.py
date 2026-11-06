#!/usr/bin/env python3
"""Validate and compose the Part 2 rectangular-panel, round-balloon page."""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


LAYOUT = "bilingual-panel-page"
PANEL_IDS = {"main", "step-1", "step-2", "step-3"}
ROUND_KINDS = {"speech", "thought"}
FONT_CANDIDATES = (
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansJP-Bold.ttf",
    "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf",
    "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc",
    "C:/Windows/Fonts/YuGothB.ttc",
    "C:/Windows/Fonts/meiryob.ttc",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--background", type=Path, help="square unlettered panel-sheet PNG or JPEG")
    parser.add_argument("--spec", type=Path, required=True, help="Part 2 page-manifest JSON")
    parser.add_argument("--output", type=Path, help="composited PNG or JPEG")
    parser.add_argument("--font", type=Path, help="Japanese-capable TTF/TTC/OTF")
    parser.add_argument("--validate-only", action="store_true")
    return parser.parse_args()


def load_spec(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError("manifest root must be an object")
    return value


def contains_japanese(text: str) -> bool:
    return bool(re.search(r"[\u3040-\u30ff\u3400-\u9fff]", text))


def contains_latin(text: str) -> bool:
    return bool(re.search(r"[A-Za-z]", text))


def read_rect(value: object, label: str, errors: list[str]) -> tuple[float, float, float, float] | None:
    if not isinstance(value, dict):
        errors.append(f"{label} must be an object")
        return None
    numbers: list[float] = []
    for key in ("x", "y", "w", "h"):
        try:
            numbers.append(float(value[key]))
        except (KeyError, TypeError, ValueError):
            errors.append(f"{label}.{key} must be a number")
            return None
    x, y, w, h = numbers
    if w <= 0 or h <= 0 or x < 0 or y < 0 or x + w > 1 or y + h > 1:
        errors.append(f"{label} must stay inside normalized artwork bounds")
        return None
    return x, y, w, h


def rect_contains(outer: tuple[float, float, float, float], inner: tuple[float, float, float, float], inset=0.0) -> bool:
    ox, oy, ow, oh = outer
    ix, iy, iw, ih = inner
    return (
        ix >= ox + inset
        and iy >= oy + inset
        and ix + iw <= ox + ow - inset
        and iy + ih <= oy + oh - inset
    )


def rect_overlap(a: tuple[float, float, float, float], b: tuple[float, float, float, float]) -> float:
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    return max(0.0, min(ax + aw, bx + bw) - max(ax, bx)) * max(
        0.0, min(ay + ah, by + bh) - max(ay, by)
    )


def rect_intersection(
    a: tuple[float, float, float, float], b: tuple[float, float, float, float]
) -> tuple[float, float, float, float]:
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    left, top = max(ax, bx), max(ay, by)
    right, bottom = min(ax + aw, bx + bw), min(ay + ah, by + bh)
    return left, top, max(0.0, right - left), max(0.0, bottom - top)


def expand_rect(rect: tuple[float, float, float, float], margin: float) -> tuple[float, float, float, float]:
    x, y, w, h = rect
    left, top = max(0.0, x - margin), max(0.0, y - margin)
    right, bottom = min(1.0, x + w + margin), min(1.0, y + h + margin)
    return left, top, right - left, bottom - top


def point_in_rect(x: float, y: float, rect: tuple[float, float, float, float], inset=0.0) -> bool:
    rx, ry, rw, rh = rect
    return rx + inset <= x <= rx + rw - inset and ry + inset <= y <= ry + rh - inset


def segment_intersects_rect(
    x1: float, y1: float, x2: float, y2: float, rect: tuple[float, float, float, float]
) -> bool:
    left, top, width, height = rect
    right, bottom = left + width, top + height
    dx, dy = x2 - x1, y2 - y1
    low, high = 0.0, 1.0
    for p, q in ((-dx, x1 - left), (dx, right - x1), (-dy, y1 - top), (dy, bottom - y1)):
        if abs(p) < 1e-12:
            if q < 0:
                return False
            continue
        ratio = q / p
        if p < 0:
            low = max(low, ratio)
        else:
            high = min(high, ratio)
        if low > high:
            return False
    return True


def validate(spec: dict) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if spec.get("layout") != LAYOUT:
        errors.append(f"layout must be {LAYOUT!r}")
    if "allow_non_round_balloons" in spec:
        errors.append("allow_non_round_balloons is forbidden; all voice balloons must be round")
    for key in ("page_id", "scene", "alt_text", "review_status"):
        if not str(spec.get(key, "")).strip():
            errors.append(f"{key} is required")
    if len(str(spec.get("alt_text", ""))) > 140:
        warnings.append("keep alt_text at 140 characters or fewer")

    canvas = spec.get("canvas")
    if not isinstance(canvas, dict):
        errors.append("canvas must be an object")
    else:
        try:
            width, height = int(canvas["width"]), int(canvas["height"])
            if width <= 0 or height <= 0 or width * 1536 != height * 1009:
                errors.append("canvas must use the exact 1009:1536 ratio or an exact multiple")
        except (KeyError, TypeError, ValueError):
            errors.append("canvas.width and canvas.height must be positive integers")

    header = spec.get("header")
    if not isinstance(header, dict):
        errors.append("header must be an object")
    else:
        for key in ("category_ja", "series_label", "number", "title_ja", "title_en"):
            if not str(header.get(key, "")).strip():
                errors.append(f"header.{key} is required")
        if header.get("title_ja") and not contains_japanese(str(header["title_ja"])):
            errors.append("header.title_ja must contain Japanese")
        if header.get("title_en") and not contains_latin(str(header["title_en"])):
            errors.append("header.title_en must contain English")

    caption = spec.get("caption")
    if not isinstance(caption, dict):
        errors.append("caption must be an object")
    else:
        for key, checker in (("headline_ja", contains_japanese), ("footer", lambda x: bool(x.strip()))):
            value = str(caption.get(key, ""))
            if not value.strip() or not checker(value):
                errors.append(f"caption.{key} is required")
        for key, checker in (("body_ja", contains_japanese), ("body_en", contains_latin)):
            values = caption.get(key)
            if not isinstance(values, list) or len(values) != 2 or not all(checker(str(v)) for v in values):
                errors.append(f"caption.{key} must contain exactly two valid lines")
        points = caption.get("points")
        if not isinstance(points, list) or not 2 <= len(points) <= 3 or not all(str(v).strip() for v in points):
            errors.append("caption.points must contain two or three non-empty items")
        phrases = caption.get("phrases")
        if not isinstance(phrases, list) or len(phrases) != 3:
            errors.append("caption.phrases must contain exactly three Japanese-English pairs")
        else:
            for index, pair in enumerate(phrases, 1):
                if (
                    not isinstance(pair, list)
                    or len(pair) != 2
                    or not contains_japanese(str(pair[0]))
                    or not contains_latin(str(pair[1]))
                ):
                    errors.append(f"caption.phrases[{index}] must be [Japanese, English]")

    artwork = spec.get("artwork")
    panels: dict[str, tuple[float, float, float, float]] = {}
    zones: dict[str, tuple[float, float, float, float]] = {}
    zone_panels: dict[str, str] = {}
    if not isinstance(artwork, dict):
        errors.append("artwork must be an object")
    else:
        panel_values = artwork.get("panels")
        if not isinstance(panel_values, list) or len(panel_values) != 4:
            errors.append("artwork.panels must contain exactly four rectangular panels")
        else:
            for index, panel in enumerate(panel_values, 1):
                panel_id = str(panel.get("id", "")).strip() if isinstance(panel, dict) else ""
                if not panel_id or panel_id in panels:
                    errors.append(f"panel {index} needs a unique id")
                    continue
                rect = read_rect(panel, f"panel {panel_id}", errors)
                if rect:
                    panels[panel_id] = rect
            if set(panels) != PANEL_IDS:
                errors.append(f"panel ids must be {sorted(PANEL_IDS)}")
            panel_items = list(panels.items())
            for i, (aid, a) in enumerate(panel_items):
                for bid, b in panel_items[i + 1 :]:
                    if rect_overlap(a, b) > 1e-5:
                        errors.append(f"panels {aid!r} and {bid!r} overlap")
            if "main" in panels:
                main_x, main_y, main_w, main_h = panels["main"]
                if not (main_x <= 0.02 and main_y <= 0.02 and main_x + main_w >= 0.98):
                    errors.append("main panel must span the top width of the artwork sheet")
                if not 0.55 <= main_h <= 0.72:
                    errors.append("main panel must occupy the upper 55–72% of the sheet")
                lower_ids = ("step-1", "step-2", "step-3")
                if all(panel_id in panels for panel_id in lower_ids):
                    lower = [panels[panel_id] for panel_id in lower_ids]
                    main_bottom = main_y + main_h
                    if any(abs(rect[1] - main_bottom) > 0.02 for rect in lower):
                        errors.append("all three lower panels must begin directly below the main panel")
                    if any(rect[1] + rect[3] < 0.98 for rect in lower):
                        errors.append("all three lower panels must reach the bottom of the artwork sheet")
                    if lower[0][0] > 0.02 or lower[2][0] + lower[2][2] < 0.98:
                        errors.append("the three lower panels must span the artwork width")
                    if abs((lower[0][0] + lower[0][2]) - lower[1][0]) > 0.02 or abs(
                        (lower[1][0] + lower[1][2]) - lower[2][0]
                    ) > 0.02:
                        errors.append("the three lower panels must form one continuous row")
                    if max(rect[2] for rect in lower) - min(rect[2] for rect in lower) > 0.03:
                        errors.append("the three lower panels must have approximately equal widths")

        protected = artwork.get("protected_zones")
        if not isinstance(protected, list) or not protected:
            errors.append("artwork.protected_zones must contain every visible face/head")
        else:
            for index, zone in enumerate(protected, 1):
                zone_id = str(zone.get("id", "")).strip() if isinstance(zone, dict) else ""
                if not zone_id or zone_id in zones:
                    errors.append(f"protected zone {index} needs a unique id")
                    continue
                if zone.get("kind") not in {"face", "head"}:
                    errors.append(f"protected zone {zone_id!r} must use kind face or head")
                rect = read_rect(zone, f"protected zone {zone_id}", errors)
                if rect:
                    zones[zone_id] = rect
                    containing = [
                        panel_id for panel_id, panel in panels.items() if rect_contains(panel, rect, inset=0.01)
                    ]
                    if panels and not containing:
                        errors.append(f"protected zone {zone_id!r} crosses or touches a panel boundary")
                    elif containing:
                        zone_panels[zone_id] = containing[0]

    balloons = spec.get("balloons")
    balloon_boxes: list[tuple[str, tuple[float, float, float, float]]] = []
    panel_counts = {panel_id: 0 for panel_id in panels}
    if not isinstance(balloons, list) or not 1 <= len(balloons) <= 8:
        errors.append("balloons must contain one to eight round balloons")
        balloons = []
    seen: set[str] = set()
    for index, balloon in enumerate(balloons, 1):
        label = f"balloon {index}"
        if not isinstance(balloon, dict):
            errors.append(f"{label} must be an object")
            continue
        balloon_id = str(balloon.get("id", "")).strip()
        if not balloon_id or balloon_id in seen:
            errors.append(f"{label} needs a unique id")
        seen.add(balloon_id)
        panel_id = str(balloon.get("panel_id", "")).strip()
        if panel_id not in panels:
            errors.append(f"{label}.panel_id must name an artwork panel")
        else:
            panel_counts[panel_id] += 1
        if balloon.get("kind") not in ROUND_KINDS:
            errors.append(f"{label}: kind must be speech or thought; jagged and rectangular voice balloons are forbidden")
        shape = str(balloon.get("shape", "ellipse")).strip().lower()
        if shape not in {"circle", "ellipse", "oval", "round"}:
            errors.append(f"{label}: shape must be circle, ellipse, oval, or round; rectangular voice balloons are forbidden")
        if not str(balloon.get("speaker", "")).strip():
            errors.append(f"{label}.speaker is required")
        ja = str(balloon.get("text", "")).strip()
        en = str(balloon.get("translation", "")).strip()
        if not contains_japanese(ja):
            errors.append(f"{label}: Japanese text is required")
        if not contains_latin(en):
            errors.append(f"{label}: English translation is required")
        if len("".join(ja.split())) > 45:
            errors.append(f"{label}: Japanese text exceeds 45 characters")
        elif len("".join(ja.split())) > 32:
            warnings.append(f"{label}: shorten Japanese copy if possible")
        if len(en) > 90 or len(en.split()) > 14:
            errors.append(f"{label}: English translation is too long")
        if en.count("\n") > 1:
            errors.append(f"{label}: English translation must use at most two lines")

        rect = read_rect(balloon, label, errors)
        if rect:
            x, y, w, h = rect
            if not 0.75 <= w / h <= 3.2:
                errors.append(f"{label}: use a circle or soft oval, not a narrow rectangular shape")
            if panel_id in panels and not rect_contains(panels[panel_id], rect, inset=0.004):
                errors.append(f"{label}: round balloon must stay inside panel {panel_id!r}")
            balloon_boxes.append((balloon_id or label, rect))
            for zone_id, zone in zones.items():
                clearance = expand_rect(zone, 0.02)
                if zone_id in zone_panels:
                    clearance = rect_intersection(clearance, panels[zone_panels[zone_id]])
                if rect_overlap(rect, clearance) > 0:
                    errors.append(f"{label}: balloon body/text overlaps face zone {zone_id!r}")

        try:
            tail_x, tail_y = float(balloon["tail_x"]), float(balloon["tail_y"])
            if panel_id in panels and not point_in_rect(tail_x, tail_y, panels[panel_id], inset=0.004):
                errors.append(f"{label}: balloon tail must stay inside panel {panel_id!r}")
            if rect:
                cx, cy = rect[0] + rect[2] / 2, rect[1] + rect[3] / 2
                for zone_id, zone in zones.items():
                    clearance = expand_rect(zone, 0.02)
                    if zone_id in zone_panels:
                        clearance = rect_intersection(clearance, panels[zone_panels[zone_id]])
                    if segment_intersects_rect(cx, cy, tail_x, tail_y, clearance):
                        errors.append(f"{label}: balloon tail crosses face zone {zone_id!r}")
        except (KeyError, TypeError, ValueError):
            errors.append(f"{label}.tail_x and tail_y must be numbers")

    for panel_id, count in panel_counts.items():
        panel = next((p for p in artwork.get("panels", []) if p.get("id") == panel_id), {}) if isinstance(artwork, dict) else {}
        if count == 0 and not panel.get("silent", False):
            errors.append(f"panel {panel_id!r} needs a round balloon or silent: true")

    for i, (aid, a) in enumerate(balloon_boxes):
        for bid, b in balloon_boxes[i + 1 :]:
            if rect_overlap(a, b) > 0.08 * min(a[2] * a[3], b[2] * b[3]):
                errors.append(f"round balloons {aid!r} and {bid!r} overlap")
    return errors, warnings


def find_font(explicit: Path | None) -> Path:
    for candidate in ([str(explicit)] if explicit else []) + list(FONT_CANDIDATES):
        if candidate and os.path.isfile(candidate):
            return Path(candidate)
    raise FileNotFoundError("No Japanese font found; pass --font with a Japanese-capable font")


def color(value: object, default: tuple[int, int, int]) -> tuple[int, int, int]:
    if isinstance(value, list) and len(value) >= 3:
        return tuple(max(0, min(255, int(v))) for v in value[:3])
    return default


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text or " ", font=font)
    return box[2] - box[0]


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int, words=False) -> list[str]:
    result: list[str] = []
    for paragraph in text.splitlines() or [""]:
        tokens = paragraph.split() if words else list(paragraph)
        line = ""
        for token in tokens:
            trial = f"{line} {token}".strip() if words else line + token
            if line and text_width(draw, trial, font) > max_width:
                result.append(line)
                line = token
            else:
                line = trial
        result.append(line)
    return result


def fit_text(draw, text, font_path, start, minimum, width, height, *, words=False):
    for size in range(start, minimum - 1, -1):
        f = ImageFont.truetype(str(font_path), size)
        lines = wrap(draw, text, f, width, words=words)
        spacing = max(2, int(size * 0.16))
        bounds = draw.multiline_textbbox((0, 0), "\n".join(lines), font=f, spacing=spacing, align="center")
        if bounds[2] - bounds[0] <= width and bounds[3] - bounds[1] <= height:
            return f, lines, spacing
    raise ValueError("text does not fit a round balloon; shorten the copy or enlarge the balloon")


def draw_centered(draw, box, text, font, fill):
    bounds = draw.textbbox((0, 0), text, font=font)
    x = box[0] + (box[2] - box[0] - (bounds[2] - bounds[0])) / 2 - bounds[0]
    y = box[1] + (box[3] - box[1] - (bounds[3] - bounds[1])) / 2 - bounds[1]
    draw.text((x, y), text, font=font, fill=fill)


def draw_round_balloon(draw, balloon, art_size, font_path):
    art_w, art_h = art_size
    x, y = round(float(balloon["x"]) * art_w), round(float(balloon["y"]) * art_h)
    w, h = round(float(balloon["w"]) * art_w), round(float(balloon["h"]) * art_h)
    box = (x, y, x + w, y + h)
    tail = (round(float(balloon["tail_x"]) * art_w), round(float(balloon["tail_y"]) * art_h))
    outline = color(balloon.get("outline"), (24, 30, 38))
    fill = color(balloon.get("fill"), (255, 255, 252))
    line_w = max(2, round(art_h * 0.0025))
    cx, cy = x + w / 2, y + h / 2
    angle = math.atan2(tail[1] - cy, tail[0] - cx)
    spread = max(7, round(min(w, h) * 0.07))
    base = (cx + math.cos(angle) * w * 0.43, cy + math.sin(angle) * h * 0.43)
    perp = (-math.sin(angle), math.cos(angle))
    if balloon["kind"] == "speech":
        triangle = [
            (base[0] + perp[0] * spread, base[1] + perp[1] * spread),
            tail,
            (base[0] - perp[0] * spread, base[1] - perp[1] * spread),
        ]
        draw.polygon(triangle, fill=fill)
        draw.line(triangle + [triangle[0]], fill=outline, width=line_w, joint="curve")
    draw.ellipse(box, fill=fill, outline=outline, width=line_w)
    if balloon["kind"] == "thought":
        for ratio, radius in ((0.45, 7), (0.72, 5), (0.92, 3)):
            px, py = base[0] + (tail[0] - base[0]) * ratio, base[1] + (tail[1] - base[1]) * ratio
            draw.ellipse((px - radius, py - radius, px + radius, py + radius), fill=fill, outline=outline, width=line_w)

    pad_x, pad_y = round(w * 0.13), round(h * 0.10)
    separator_y = y + round(h * 0.63)
    ja_box_h = separator_y - y - 2 * pad_y
    en_box_h = y + h - separator_y - pad_y
    ja_start = max(12, round(art_h * float(balloon.get("font_size", 0.034))))
    en_start = max(10, round(art_h * float(balloon.get("translation_font_size", 0.020))))
    ja_font, ja_lines, ja_spacing = fit_text(
        draw, str(balloon["text"]), font_path, ja_start, max(10, round(ja_start * 0.62)),
        w - 2 * pad_x, ja_box_h,
    )
    en_font, en_lines, en_spacing = fit_text(
        draw, str(balloon["translation"]), font_path, en_start, max(8, round(en_start * 0.65)),
        w - 2 * pad_x, en_box_h, words=True,
    )
    ja_rendered, en_rendered = "\n".join(ja_lines), "\n".join(en_lines)
    ja_bounds = draw.multiline_textbbox((0, 0), ja_rendered, font=ja_font, spacing=ja_spacing, align="center")
    en_bounds = draw.multiline_textbbox((0, 0), en_rendered, font=en_font, spacing=en_spacing, align="center")
    ja_origin = (
        x + (w - (ja_bounds[2] - ja_bounds[0])) / 2 - ja_bounds[0],
        y + pad_y + (ja_box_h - (ja_bounds[3] - ja_bounds[1])) / 2 - ja_bounds[1],
    )
    en_origin = (
        x + (w - (en_bounds[2] - en_bounds[0])) / 2 - en_bounds[0],
        separator_y + (en_box_h - (en_bounds[3] - en_bounds[1])) / 2 - en_bounds[1],
    )
    draw.multiline_text(ja_origin, ja_rendered, font=ja_font, fill=(22, 25, 30), spacing=ja_spacing, align="center")
    draw.line((x + pad_x, separator_y, x + w - pad_x, separator_y), fill=(198, 204, 210), width=max(1, line_w // 2))
    draw.multiline_text(en_origin, en_rendered, font=en_font, fill=(65, 70, 78), spacing=en_spacing, align="center")


def fit_art(source: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(source.convert("RGB"), size, method=Image.Resampling.LANCZOS).convert("RGBA")


def compose(background: Path, output: Path, spec: dict, font_path: Path) -> None:
    canvas = spec["canvas"]
    page_w, page_h = int(canvas["width"]), int(canvas["height"])
    sx, sy = page_w / 1009, page_h / 1536
    def px(v): return round(v * sx)
    def py(v): return round(v * sy)

    page = Image.new("RGB", (page_w, page_h), color(canvas.get("background"), (248, 245, 238)))
    draw = ImageDraw.Draw(page)
    header = spec["header"]
    navy, ink, muted, white = (8, 47, 89), (23, 33, 43), (83, 94, 104), (255, 255, 255)
    bold_28 = ImageFont.truetype(str(font_path), max(14, py(28)))
    bold_18 = ImageFont.truetype(str(font_path), max(11, py(18)))
    regular_15 = ImageFont.truetype(str(font_path), max(9, py(15)))
    draw.rectangle((px(20), py(20), px(112), py(68)), outline=navy, width=max(1, px(1)))
    draw_centered(draw, (px(20), py(20), px(112), py(68)), str(header["number"]), bold_18, navy)
    draw.text((px(137), py(18)), str(header["series_label"]), font=bold_28, fill=ink)
    draw.text((px(470), py(35)), str(header["category_ja"]), font=regular_15, fill=ink)
    draw.rounded_rectangle((px(852), py(20), px(989), py(68)), radius=px(8), fill=navy)
    draw_centered(draw, (px(852), py(20), px(989), py(68)), f"SCENE {header['number']}", regular_15, white)
    draw.line((px(20), py(79), px(989), py(79)), fill=navy, width=max(1, py(1)))
    title_font = ImageFont.truetype(str(font_path), max(14, py(26)))
    en_title_font = ImageFont.truetype(str(font_path), max(10, py(15)))
    draw.text((px(40), py(93)), str(header["title_ja"]), font=title_font, fill=ink)
    draw.text((px(40), py(137)), str(header["title_en"]), font=en_title_font, fill=ink)

    art_x, art_y, art_size = px(20), py(176), min(px(969), py(969))
    with Image.open(background) as source:
        art = fit_art(source, (art_size, art_size))
    art_draw = ImageDraw.Draw(art)
    line_w = max(2, round(art_size * 0.003))
    for panel in spec["artwork"]["panels"]:
        box = (
            round(float(panel["x"]) * art_size), round(float(panel["y"]) * art_size),
            round((float(panel["x"]) + float(panel["w"])) * art_size),
            round((float(panel["y"]) + float(panel["h"])) * art_size),
        )
        art_draw.rectangle(box, outline=(22, 27, 33), width=line_w)
    for balloon in spec["balloons"]:
        draw_round_balloon(art_draw, balloon, (art_size, art_size), font_path)
    page.paste(art.convert("RGB"), (art_x, art_y))
    draw.rectangle((art_x, art_y, art_x + art_size, art_y + art_size), outline=ink, width=max(2, px(2)))

    caption = spec["caption"]
    info_y = art_y + art_size + py(26)
    left_x, right_x = px(22), px(720)
    label_font = ImageFont.truetype(str(font_path), max(10, py(14)))
    body_font = ImageFont.truetype(str(font_path), max(9, py(12)))
    small_font = ImageFont.truetype(str(font_path), max(8, py(9)))
    draw.rectangle((left_x, info_y, px(114), info_y + py(32)), fill=navy)
    draw_centered(draw, (left_x, info_y, px(114), info_y + py(32)), "日本語", label_font, white)
    draw.text((px(132), info_y), " ".join(str(v) for v in caption["body_ja"]), font=body_font, fill=ink)
    ey = info_y + py(64)
    draw.rectangle((left_x, ey, px(114), ey + py(32)), fill=navy)
    draw_centered(draw, (left_x, ey, px(114), ey + py(32)), "English", small_font, white)
    en_text = " ".join(str(v) for v in caption["body_en"])
    en_lines = wrap(draw, en_text, small_font, px(555), words=True)
    draw.multiline_text((px(132), ey), "\n".join(en_lines[:3]), font=small_font, fill=muted, spacing=py(2))
    point_y = ey + py(80)
    draw.line((left_x, point_y, px(690), point_y), fill=(164, 173, 181), width=max(1, py(1)))
    draw.text((px(26), point_y + py(12)), "POINT", font=small_font, fill=navy)
    points = "\n".join(f"• {v}" for v in caption["points"])
    draw.multiline_text((px(100), point_y + py(10)), points, font=small_font, fill=ink, spacing=py(3))

    box_bottom = min(page_h - py(56), info_y + py(240))
    draw.rounded_rectangle((right_x, info_y - py(4), px(987), box_bottom), radius=px(12), fill=(234, 243, 250))
    draw_centered(draw, (right_x, info_y + py(4), px(987), info_y + py(38)), "使えるフレーズ", label_font, navy)
    phrase_y = info_y + py(48)
    for ja, en in caption["phrases"]:
        draw.text((right_x + px(12), phrase_y), "✓", font=small_font, fill=navy)
        draw.text((right_x + px(35), phrase_y), str(ja), font=small_font, fill=ink)
        en_lines = wrap(draw, str(en), small_font, px(220), words=True)
        draw.multiline_text((right_x + px(35), phrase_y + py(19)), "\n".join(en_lines[:2]), font=small_font, fill=muted, spacing=py(1))
        phrase_y += py(58)

    footer_y = page_h - py(29)
    draw.text((px(24), footer_y), str(caption["footer"]), font=small_font, fill=muted)
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.suffix.lower() in {".jpg", ".jpeg"}:
        page.save(output, "JPEG", quality=95, subsampling=0, optimize=True)
    else:
        page.save(output, "PNG", optimize=True)


def main() -> int:
    args = parse_args()
    try:
        spec = load_spec(args.spec)
        errors, warnings = validate(spec)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    for warning in warnings:
        print(f"WARNING: {warning}", file=sys.stderr)
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    if errors:
        return 2
    print(f"OK: {spec['page_id']} ({len(spec['balloons'])} round balloon(s), 4 panels)")
    if args.validate_only:
        return 0
    if not args.background or not args.output:
        print("ERROR: --background and --output are required unless --validate-only is used", file=sys.stderr)
        return 2
    try:
        compose(args.background, args.output, spec, find_font(args.font))
    except (OSError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    print(f"WROTE: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
