#!/usr/bin/env python3
"""Validate a dialogue-page manifest and typeset manga balloons on an image."""

from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Pillow is required: python3 -m pip install Pillow") from exc


KINDS = {"speech", "thought", "shout"}
LAYOUTS = {"overlay", "bilingual-portrait"}
DEFAULT_LAYOUT = "bilingual-portrait"
ROUNDED_KINDS = {"speech", "thought"}
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
    parser.add_argument("--background", type=Path, help="PNG or JPEG artwork")
    parser.add_argument("--spec", type=Path, required=True, help="dialogue-page JSON")
    parser.add_argument("--output", type=Path, help="composited PNG")
    parser.add_argument("--font", type=Path, help="Japanese-capable TTF/TTC/OTF")
    parser.add_argument("--validate-only", action="store_true")
    return parser.parse_args()


def load_spec(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("manifest root must be an object")
    return data


def contains_japanese(text: str) -> bool:
    return any(
        "\u3040" <= char <= "\u30ff" or "\u3400" <= char <= "\u9fff"
        for char in text
    )


def contains_latin(text: str) -> bool:
    return any("a" <= char.lower() <= "z" for char in text)


def segment_intersects_rect(
    x1: float, y1: float, x2: float, y2: float,
    left: float, top: float, right: float, bottom: float,
) -> bool:
    """Return whether a line segment enters a closed axis-aligned rectangle."""
    dx, dy = x2 - x1, y2 - y1
    low, high = 0.0, 1.0
    for direction, distance in (
        (-dx, x1 - left),
        (dx, right - x1),
        (-dy, y1 - top),
        (dy, bottom - y1),
    ):
        if abs(direction) < 1e-12:
            if distance < 0:
                return False
            continue
        ratio = distance / direction
        if direction < 0:
            if ratio > high:
                return False
            low = max(low, ratio)
        else:
            if ratio < low:
                return False
            high = min(high, ratio)
    return low <= high


def validate(spec: dict) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    layout = str(spec.get("layout", DEFAULT_LAYOUT)).strip() or DEFAULT_LAYOUT
    if layout not in LAYOUTS:
        errors.append(f"layout must be one of {sorted(LAYOUTS)}")
    bilingual = layout == "bilingual-portrait"
    allow_non_round = spec.get("allow_non_round_balloons", False)
    if not isinstance(allow_non_round, bool):
        errors.append("allow_non_round_balloons must be true or false")
        allow_non_round = False
    if not str(spec.get("page_id", "")).strip():
        errors.append("page_id is required")
    if not str(spec.get("scene", "")).strip():
        warnings.append("scene is empty")
    if not str(spec.get("alt_text", "")).strip():
        warnings.append("alt_text is empty")
    balloons = spec.get("balloons")
    if not isinstance(balloons, list) or not balloons:
        errors.append("balloons must be a non-empty list")
        return errors, warnings
    if len(balloons) > (2 if bilingual else 3):
        errors.append("use at most two balloons in bilingual-portrait pages" if bilingual
                      else "use at most three balloons per page")

    seen: set[str] = set()
    boxes: list[tuple[str, float, float, float, float]] = []
    for index, balloon in enumerate(balloons, start=1):
        label = f"balloon {index}"
        if not isinstance(balloon, dict):
            errors.append(f"{label} must be an object")
            continue
        balloon_id = str(balloon.get("id", "")).strip()
        if not balloon_id:
            errors.append(f"{label}: id is required")
        elif balloon_id in seen:
            errors.append(f"{label}: duplicate id {balloon_id!r}")
        seen.add(balloon_id)
        if not str(balloon.get("speaker", "")).strip():
            warnings.append(f"{label}: speaker is empty")
        kind = balloon.get("kind", "speech")
        if kind not in KINDS:
            errors.append(f"{label}: kind must be one of {sorted(KINDS)}")
        elif bilingual and kind not in ROUNDED_KINDS and not allow_non_round:
            errors.append(
                f"{label}: use a rounded speech or thought balloon by default; "
                "set allow_non_round_balloons to true only for an explicitly requested shout"
            )
        text = str(balloon.get("text", "")).strip()
        if not text:
            errors.append(f"{label}: text is empty")
        elif bilingual and not contains_japanese(text):
            errors.append(f"{label}: Japanese text is required for bilingual-portrait")
        char_count = len("".join(text.split()))
        maximum = 45 if bilingual else 50
        if char_count > maximum:
            errors.append(f"{label}: {char_count} characters is too long (maximum {maximum})")
        elif char_count > 28:
            warnings.append(f"{label}: rewrite if possible; {char_count} characters exceeds the 28-character default")
        if bilingual and text.count("\n") >= 3:
            errors.append(f"{label}: use no more than three Japanese lines; two are preferred")
        elif text.count("\n") >= 4:
            warnings.append(f"{label}: more than four explicit lines may be unreadable")

        if bilingual:
            if balloon.get("language_order") != "ja-then-en":
                errors.append(f"{label}: language_order must be 'ja-then-en'")
            translation = str(balloon.get("translation", "")).strip()
            if not translation:
                errors.append(f"{label}: translation is required for bilingual-portrait")
            elif not contains_latin(translation):
                errors.append(f"{label}: an English translation is required for bilingual-portrait")
            elif len(translation) > 60:
                errors.append(f"{label}: English translation exceeds 60 characters")
            elif len(translation.split()) > 10:
                warnings.append(f"{label}: keep the English gloss to 10 words or fewer")
            if translation.count("\n") >= 2:
                errors.append(f"{label}: English translation must use at most two lines")
            if balloon.get("translation_position", "bottom-right") not in {"bottom-right", "bottom-left"}:
                errors.append(f"{label}: translation_position must be bottom-right or bottom-left")

        values: dict[str, float] = {}
        for key in ("x", "y", "w", "h"):
            try:
                values[key] = float(balloon[key])
            except (KeyError, TypeError, ValueError):
                errors.append(f"{label}: {key} must be a number")
        if len(values) == 4:
            x, y, w, h = (values[k] for k in ("x", "y", "w", "h"))
            if w <= 0 or h <= 0:
                errors.append(f"{label}: w and h must be positive")
            safe = 0.02 if bilingual else 0.05
            if min(x, y) < safe or x + w > 1 - safe or y + h > 1 - safe:
                warnings.append(f"{label}: keep the balloon inside the {round(safe * 100)}% safe zone")
            if bilingual and y + h > 0.38:
                warnings.append(f"{label}: balloon extends below the preferred upper 38% artwork band")
            boxes.append((balloon_id or label, x, y, w, h))
        if kind in {"speech", "thought"}:
            for key in ("tail_x", "tail_y"):
                try:
                    value = float(balloon[key])
                    if not 0 <= value <= 1:
                        errors.append(f"{label}: {key} must be between 0 and 1")
                except (KeyError, TypeError, ValueError):
                    errors.append(f"{label}: {key} must be a number")

    if bilingual:
        canvas = spec.get("canvas")
        if not isinstance(canvas, dict):
            errors.append("canvas must be an object for bilingual-portrait")
        else:
            try:
                canvas_w = int(canvas.get("width", 1024))
                canvas_h = int(canvas.get("height", 1536))
                if canvas_w <= 0 or canvas_h <= 0:
                    raise ValueError
                if abs((canvas_w / canvas_h) - (1024 / 1536)) > 0.015:
                    warnings.append("canvas aspect ratio differs from the 1024:1536 reference")
            except (TypeError, ValueError):
                errors.append("canvas width and height must be positive integers")

        header = spec.get("header")
        if not isinstance(header, dict):
            errors.append("header must be an object for bilingual-portrait")
        else:
            for key in ("category_ja", "series_label", "number"):
                if not str(header.get(key, "")).strip():
                    errors.append(f"header.{key} is required")

        caption = spec.get("caption")
        if not isinstance(caption, dict):
            errors.append("caption must be an object for bilingual-portrait")
        else:
            if not str(caption.get("headline_ja", "")).strip():
                errors.append("caption.headline_ja is required")
            elif not contains_japanese(str(caption.get("headline_ja", ""))):
                errors.append("caption.headline_ja must contain Japanese text")
            for key in ("body_ja", "body_en"):
                lines = caption.get(key)
                if not isinstance(lines, list) or len(lines) != 2 or not all(str(line).strip() for line in lines):
                    errors.append(f"caption.{key} must contain exactly two non-empty lines")
                elif key == "body_ja" and not all(contains_japanese(str(line)) for line in lines):
                    errors.append("caption.body_ja must contain Japanese text in both lines")
                elif key == "body_en" and not all(contains_latin(str(line)) for line in lines):
                    errors.append("caption.body_en must contain English text in both lines")
            if not str(caption.get("footer", "")).strip():
                errors.append("caption.footer is required")

        artwork = spec.get("artwork")
        zones: list[tuple[str, float, float, float, float]] = []
        if not isinstance(artwork, dict):
            errors.append("artwork must be an object for bilingual-portrait")
        else:
            protected = artwork.get("protected_zones")
            if not isinstance(protected, list) or not protected:
                errors.append("artwork.protected_zones must contain at least one face zone")
            else:
                face_count = 0
                for index, zone in enumerate(protected, start=1):
                    zlabel = f"protected zone {index}"
                    if not isinstance(zone, dict):
                        errors.append(f"{zlabel} must be an object")
                        continue
                    if zone.get("kind") in {"face", "head"}:
                        face_count += 1
                    values: dict[str, float] = {}
                    for key in ("x", "y", "w", "h"):
                        try:
                            values[key] = float(zone[key])
                        except (KeyError, TypeError, ValueError):
                            errors.append(f"{zlabel}: {key} must be a number")
                    if len(values) == 4:
                        x, y, w, h = (values[k] for k in ("x", "y", "w", "h"))
                        if w <= 0 or h <= 0 or min(x, y) < 0 or x + w > 1 or y + h > 1:
                            errors.append(f"{zlabel}: rectangle must stay within normalized artwork bounds")
                        zones.append((str(zone.get("id", zlabel)), x, y, w, h))
                if face_count == 0:
                    errors.append("artwork.protected_zones must include kind face or head")

        clearance = 0.02
        for balloon_id, bx, by, bw, bh in boxes:
            for zone_id, zx, zy, zw, zh in zones:
                left = max(0.0, zx - clearance)
                top = max(0.0, zy - clearance)
                right = min(1.0, zx + zw + clearance)
                bottom = min(1.0, zy + zh + clearance)
                overlaps = bx < right and bx + bw > left and by < bottom and by + bh > top
                if overlaps:
                    errors.append(f"balloon {balloon_id!r} overlaps protected zone {zone_id!r} with face clearance")

        for index, balloon in enumerate(balloons, start=1):
            if not isinstance(balloon, dict) or balloon.get("kind", "speech") == "shout":
                continue
            try:
                tx, ty = float(balloon["tail_x"]), float(balloon["tail_y"])
            except (KeyError, TypeError, ValueError):
                continue
            try:
                bx, by, bw, bh = (float(balloon[key]) for key in ("x", "y", "w", "h"))
            except (KeyError, TypeError, ValueError):
                continue
            center_x, center_y = bx + bw / 2, by + bh / 2
            for zone_id, zx, zy, zw, zh in zones:
                left = max(0.0, zx - clearance)
                top = max(0.0, zy - clearance)
                right = min(1.0, zx + zw + clearance)
                bottom = min(1.0, zy + zh + clearance)
                if segment_intersects_rect(center_x, center_y, tx, ty, left, top, right, bottom):
                    errors.append(f"balloon {index}: tail intersects protected zone {zone_id!r}")

    for i, first in enumerate(boxes):
        for second in boxes[i + 1 :]:
            _, ax, ay, aw, ah = first
            _, bx, by, bw, bh = second
            overlap_w = max(0.0, min(ax + aw, bx + bw) - max(ax, bx))
            overlap_h = max(0.0, min(ay + ah, by + bh) - max(ay, by))
            overlap = overlap_w * overlap_h
            if overlap > 0.15 * min(aw * ah, bw * bh):
                warnings.append(f"balloons {first[0]!r} and {second[0]!r} overlap substantially")
    return errors, warnings


def fontconfig_japanese_fonts() -> list[str]:
    if not shutil.which("fc-list"):
        return []
    try:
        result = subprocess.run(
            ["fc-list", ":lang=ja", "file"],
            check=False,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.SubprocessError):
        return []
    paths: list[str] = []
    for line in result.stdout.splitlines():
        candidate = line.split(":", 1)[0].strip()
        if candidate and candidate not in paths:
            paths.append(candidate)
    return paths


def find_font(explicit: Path | None) -> Path:
    configured = os.environ.get("KAWAII_MANGA_FONT", "").strip()
    candidates = (
        ([str(explicit)] if explicit else [])
        + ([configured] if configured else [])
        + list(FONT_CANDIDATES)
        + fontconfig_japanese_fonts()
    )
    for candidate in candidates:
        if candidate and os.path.isfile(candidate):
            return Path(candidate)
    raise FileNotFoundError(
        "No Japanese font found. Pass --font /path/to/a Japanese-capable font "
        "or set KAWAII_MANGA_FONT."
    )


def rgba(value: object, default: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    if isinstance(value, list) and len(value) in {3, 4}:
        channels = [max(0, min(255, int(v))) for v in value]
        if len(channels) == 3:
            channels.append(255)
        return tuple(channels)  # type: ignore[return-value]
    return default


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text or " ", font=font)
    return box[2] - box[0]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont,
              max_width: int, mode: str = "char") -> list[str]:
    lines: list[str] = []
    for paragraph in text.splitlines() or [""]:
        if mode == "word":
            words = paragraph.split()
            if not words:
                lines.append("")
                continue
            current = words[0]
            for word in words[1:]:
                trial = f"{current} {word}"
                if text_width(draw, trial, font) > max_width:
                    lines.append(current)
                    current = word
                else:
                    current = trial
            lines.append(current)
            continue
        current = ""
        for char in paragraph:
            trial = current + char
            if current and text_width(draw, trial, font) > max_width:
                lines.append(current)
                current = char
            else:
                current = trial
        lines.append(current)
    return lines


def fit_text(draw: ImageDraw.ImageDraw, text: str, font_path: Path, start_size: int, min_size: int,
             max_width: int, max_height: int, wrap_mode: str = "char") -> tuple[ImageFont.FreeTypeFont, list[str], int]:
    for size in range(start_size, min_size - 1, -2):
        font = ImageFont.truetype(str(font_path), size=size)
        lines = wrap_text(draw, text, font, max_width, mode=wrap_mode)
        spacing = max(2, int(size * 0.20))
        bounds = draw.multiline_textbbox((0, 0), "\n".join(lines), font=font, spacing=spacing, align="center")
        if bounds[2] - bounds[0] <= max_width and bounds[3] - bounds[1] <= max_height:
            return font, lines, spacing
    raise ValueError("text does not fit the balloon; shorten the dialogue or enlarge the balloon")


def fit_explicit_lines(draw: ImageDraw.ImageDraw, lines: list[str], font_path: Path,
                       start_size: int, min_size: int, max_width: int,
                       max_height: int) -> tuple[ImageFont.FreeTypeFont, int]:
    rendered = "\n".join(lines)
    for size in range(start_size, min_size - 1, -1):
        font = ImageFont.truetype(str(font_path), size=size)
        spacing = max(2, int(size * 0.28))
        bounds = draw.multiline_textbbox((0, 0), rendered, font=font, spacing=spacing)
        widest = max(text_width(draw, line, font) for line in lines)
        if widest <= max_width and bounds[3] - bounds[1] <= max_height:
            return font, spacing
    raise ValueError("caption lines do not fit; shorten the copy")


def fit_artwork(image: Image.Image, size: tuple[int, int], mode: str) -> Image.Image:
    target_w, target_h = size
    source = image.convert("RGB")
    if mode not in {"cover", "contain"}:
        raise ValueError("artwork.fit must be cover or contain")
    scale = (max if mode == "cover" else min)(target_w / source.width, target_h / source.height)
    resized = source.resize(
        (max(1, round(source.width * scale)), max(1, round(source.height * scale))),
        Image.Resampling.LANCZOS,
    )
    if mode == "cover":
        left = max(0, (resized.width - target_w) // 2)
        top = max(0, (resized.height - target_h) // 2)
        return resized.crop((left, top, left + target_w, top + target_h)).convert("RGBA")
    result = Image.new("RGBA", size, (255, 255, 255, 255))
    result.alpha_composite(resized.convert("RGBA"), ((target_w - resized.width) // 2,
                                                       (target_h - resized.height) // 2))
    return result


def ellipse_tail(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], tail: tuple[int, int],
                 fill: tuple[int, int, int, int], outline: tuple[int, int, int, int], width: int) -> None:
    left, top, right, bottom = box
    cx, cy = (left + right) / 2, (top + bottom) / 2
    tx, ty = tail
    angle = math.atan2(ty - cy, tx - cx)
    rx, ry = (right - left) / 2, (bottom - top) / 2
    base_x = cx + math.cos(angle) * rx * 0.82
    base_y = cy + math.sin(angle) * ry * 0.82
    spread = max(10, int(min(rx, ry) * 0.22))
    perpendicular = (-math.sin(angle), math.cos(angle))
    points = [
        (base_x + perpendicular[0] * spread, base_y + perpendicular[1] * spread),
        (tx, ty),
        (base_x - perpendicular[0] * spread, base_y - perpendicular[1] * spread),
    ]
    draw.polygon(points, fill=fill)
    draw.line(points + [points[0]], fill=outline, width=width, joint="curve")
    draw.ellipse(box, fill=fill, outline=outline, width=width)


def thought_tail(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], tail: tuple[int, int],
                 fill: tuple[int, int, int, int], outline: tuple[int, int, int, int], width: int) -> None:
    draw.ellipse(box, fill=fill, outline=outline, width=width)
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    angle = math.atan2(tail[1] - cy, tail[0] - cx)
    start = (cx + math.cos(angle) * (box[2] - box[0]) * 0.42,
             cy + math.sin(angle) * (box[3] - box[1]) * 0.42)
    for ratio, radius in ((0.25, 10), (0.55, 7), (0.82, 4)):
        px = start[0] + (tail[0] - start[0]) * ratio
        py = start[1] + (tail[1] - start[1]) * ratio
        draw.ellipse((px - radius, py - radius, px + radius, py + radius), fill=fill, outline=outline, width=width)


def shout_balloon(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int],
                  fill: tuple[int, int, int, int], outline: tuple[int, int, int, int], width: int) -> None:
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    rx, ry = (box[2] - box[0]) / 2, (box[3] - box[1]) / 2
    points = []
    for i in range(32):
        angle = (2 * math.pi * i / 32) - math.pi / 2
        scale = 1.0 if i % 2 == 0 else 0.78
        points.append((cx + math.cos(angle) * rx * scale, cy + math.sin(angle) * ry * scale))
    draw.polygon(points, fill=fill, outline=outline)
    draw.line(points + [points[0]], fill=outline, width=width, joint="curve")


def draw_balloons(image: Image.Image, spec: dict, font_path: Path,
                  bilingual: bool = False) -> Image.Image:
    image = image.convert("RGBA")
    draw = ImageDraw.Draw(image)
    page_w, page_h = image.size
    outline_width = max(3, round(page_h * 0.0025))
    for balloon in spec["balloons"]:
        x = round(float(balloon["x"]) * page_w)
        y = round(float(balloon["y"]) * page_h)
        w = round(float(balloon["w"]) * page_w)
        h = round(float(balloon["h"]) * page_h)
        box = (x, y, x + w, y + h)
        fill = rgba(balloon.get("fill"), (255, 255, 255, 245))
        outline = rgba(balloon.get("outline"), (30, 30, 34, 255))
        text_color = rgba(balloon.get("text_color"), (20, 20, 24, 255))
        kind = balloon.get("kind", "speech")
        tail = (round(float(balloon.get("tail_x", 0.5)) * page_w),
                round(float(balloon.get("tail_y", 0.5)) * page_h))
        if kind == "speech":
            ellipse_tail(draw, box, tail, fill, outline, outline_width)
        elif kind == "thought":
            thought_tail(draw, box, tail, fill, outline, outline_width)
        else:
            shout_balloon(draw, box, fill, outline, outline_width)

        padding_x = round(w * 0.13)
        padding_y = round(h * 0.13)
        translation = str(balloon.get("translation", "")).strip() if bilingual else ""
        translation_band = round(h * 0.27) if translation else 0
        font_fraction = float(balloon.get("font_size", 0.034))
        start_size = max(18, round(page_h * font_fraction))
        min_fraction = 0.038 if bilingual else 0.021
        min_size = max(16, round(page_h * min_fraction))
        font, lines, spacing = fit_text(
            draw, str(balloon["text"]), font_path, start_size, min_size,
            w - 2 * padding_x, h - 2 * padding_y - translation_band,
        )
        rendered = "\n".join(lines)
        bounds = draw.multiline_textbbox((0, 0), rendered, font=font, spacing=spacing, align="center")
        tw, th = bounds[2] - bounds[0], bounds[3] - bounds[1]
        japanese_h = h - translation_band
        origin = (x + (w - tw) / 2 - bounds[0],
                  y + (japanese_h - th) / 2 - bounds[1] + round(h * 0.015))
        draw.multiline_text(origin, rendered, font=font, fill=text_color, spacing=spacing, align="center")

        if translation:
            translation_fraction = float(balloon.get("translation_font_size", 0.026))
            translation_start = max(14, round(page_h * translation_fraction))
            translation_min = max(12, round(page_h * 0.018))
            en_font, en_lines, en_spacing = fit_text(
                draw, translation, font_path, translation_start, translation_min,
                w - 2 * padding_x, max(12, translation_band - round(h * 0.05)),
                wrap_mode="word",
            )
            en_rendered = "\n".join(en_lines)
            en_bounds = draw.multiline_textbbox(
                (0, 0), en_rendered, font=en_font, spacing=en_spacing, align="right"
            )
            en_w, en_h = en_bounds[2] - en_bounds[0], en_bounds[3] - en_bounds[1]
            position = balloon.get("translation_position", "bottom-right")
            en_x = x + padding_x if position == "bottom-left" else x + w - padding_x - en_w
            en_y = y + h - padding_y - en_h
            translation_color = rgba(balloon.get("translation_color"), (82, 86, 94, 255))
            draw.multiline_text(
                (en_x - en_bounds[0], en_y - en_bounds[1]), en_rendered,
                font=en_font, fill=translation_color, spacing=en_spacing,
                align="left" if position == "bottom-left" else "right",
            )
    return image


def draw_centered_text(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str,
                       font: ImageFont.FreeTypeFont, fill: tuple[int, int, int, int]) -> None:
    bounds = draw.textbbox((0, 0), text, font=font)
    width, height = bounds[2] - bounds[0], bounds[3] - bounds[1]
    x = box[0] + (box[2] - box[0] - width) / 2 - bounds[0]
    y = box[1] + (box[3] - box[1] - height) / 2 - bounds[1]
    draw.text((x, y), text, font=font, fill=fill)


def compose_bilingual_portrait(background: Image.Image, spec: dict, font_path: Path) -> Image.Image:
    canvas = spec["canvas"]
    page_w = int(canvas.get("width", 1024))
    page_h = int(canvas.get("height", 1536))
    background_color = rgba(canvas.get("background"), (248, 245, 238, 255))
    frame_color = rgba(canvas.get("frame"), (20, 28, 38, 255))
    page = Image.new("RGBA", (page_w, page_h), background_color)
    draw = ImageDraw.Draw(page)

    header = spec["header"]
    category_color = rgba(header.get("category_color"), (231, 88, 88, 255))
    header_font = ImageFont.truetype(str(font_path), size=max(14, round(page_h * 0.0135)))
    header_top = round(page_h * 0.033)
    header_height = round(page_h * 0.026)
    header_left = round(page_w * 0.064)
    category = str(header["category_ja"])
    category_width = max(round(page_w * 0.25), text_width(draw, category, header_font) + round(page_w * 0.035))
    pill = (header_left, header_top, header_left + category_width, header_top + header_height)
    draw.rounded_rectangle(pill, radius=header_height // 2, fill=category_color)
    draw_centered_text(draw, pill, category, header_font, (255, 255, 255, 255))

    sequence = f"{str(header['series_label']).strip()} {str(header['number']).strip()}"
    sequence_font = ImageFont.truetype(str(font_path), size=max(13, round(page_h * 0.0115)))
    sequence_bounds = draw.textbbox((0, 0), sequence, font=sequence_font)
    sequence_w = sequence_bounds[2] - sequence_bounds[0]
    sequence_y = header_top + (header_height - (sequence_bounds[3] - sequence_bounds[1])) / 2 - sequence_bounds[1]
    draw.text((round(page_w * 0.936) - sequence_w - sequence_bounds[0], sequence_y), sequence,
              font=sequence_font, fill=(68, 68, 68, 255))

    art_x = round(page_w * 0.063)
    art_y = round(page_h * 0.068)
    art_w = round(page_w * 0.874)
    art_h = round(page_h * 0.574)
    frame_width = max(3, round(page_h * 0.003))
    inner_size = (art_w - 2 * frame_width, art_h - 2 * frame_width)
    artwork = fit_artwork(background, inner_size, str(spec.get("artwork", {}).get("fit", "cover")))
    artwork = draw_balloons(artwork, spec, font_path, bilingual=True)
    page.alpha_composite(artwork, (art_x + frame_width, art_y + frame_width))
    draw.rectangle((art_x, art_y, art_x + art_w, art_y + art_h), outline=frame_color, width=frame_width)

    caption = spec["caption"]
    text_left = round(page_w * 0.082)
    text_width_max = round(page_w * 0.84)
    text_color = (25, 37, 54, 255)
    secondary = (76, 82, 91, 255)

    headline = str(caption["headline_ja"])
    headline_font, _ = fit_explicit_lines(
        draw, [headline], font_path, round(page_h * 0.031), round(page_h * 0.022),
        text_width_max, round(page_h * 0.05),
    )
    headline_y = round(page_h * 0.682)
    headline_bounds = draw.textbbox((0, 0), headline, font=headline_font)
    draw.text((text_left - headline_bounds[0], headline_y - headline_bounds[1]), headline,
              font=headline_font, fill=text_color)
    accent = str(caption.get("accent_span_ja", "")).strip()
    if accent:
        underline_y = headline_y + (headline_bounds[3] - headline_bounds[1]) + round(page_h * 0.006)
        underline_w = min(text_width_max, text_width(draw, accent, headline_font))
        underline_h = max(4, round(page_h * 0.0045))
        draw.rounded_rectangle(
            (text_left, underline_y, text_left + underline_w, underline_y + underline_h),
            radius=underline_h // 2, fill=category_color,
        )

    ja_lines = [str(line) for line in caption["body_ja"]]
    ja_font, ja_spacing = fit_explicit_lines(
        draw, ja_lines, font_path, round(page_h * 0.0165), round(page_h * 0.012),
        text_width_max, round(page_h * 0.065),
    )
    ja_text = "\n".join(ja_lines)
    ja_y = round(page_h * 0.755)
    ja_bounds = draw.multiline_textbbox((0, 0), ja_text, font=ja_font, spacing=ja_spacing)
    draw.multiline_text((text_left - ja_bounds[0], ja_y - ja_bounds[1]), ja_text,
                        font=ja_font, fill=secondary, spacing=ja_spacing)

    en_lines = [str(line) for line in caption["body_en"]]
    en_font, en_spacing = fit_explicit_lines(
        draw, en_lines, font_path, round(page_h * 0.0128), round(page_h * 0.0095),
        text_width_max, round(page_h * 0.055),
    )
    en_text = "\n".join(en_lines)
    en_y = round(page_h * 0.835)
    en_bounds = draw.multiline_textbbox((0, 0), en_text, font=en_font, spacing=en_spacing)
    draw.multiline_text((text_left - en_bounds[0], en_y - en_bounds[1]), en_text,
                        font=en_font, fill=(92, 96, 104, 255), spacing=en_spacing)

    footer = str(caption["footer"])
    footer_font = ImageFont.truetype(str(font_path), size=max(11, round(page_h * 0.0095)))
    footer_y = round(page_h * 0.948)
    footer_bounds = draw.textbbox((0, 0), footer, font=footer_font)
    draw.text((round(page_w * 0.065) - footer_bounds[0], footer_y - footer_bounds[1]), footer,
              font=footer_font, fill=(132, 132, 128, 255))
    return page


def compose(background: Path, output: Path, spec: dict, font_path: Path) -> None:
    source = Image.open(background).convert("RGBA")
    if spec.get("layout", DEFAULT_LAYOUT) == "bilingual-portrait":
        image = compose_bilingual_portrait(source, spec, font_path)
    else:
        image = draw_balloons(source, spec, font_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.suffix.lower() in {".jpg", ".jpeg"}:
        image.convert("RGB").save(output, quality=95, subsampling=0)
    else:
        image.convert("RGB").save(output, optimize=True)


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
    print(f"OK: {spec['page_id']} ({len(spec['balloons'])} balloon(s))")
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
