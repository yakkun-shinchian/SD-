#!/usr/bin/env python3
"""Render the fixed V3 handwritten text and pencil-style manga balloons."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


# Pillow already antialiases TrueType text. Rendering at native 1080x1350 keeps
# the irregular balloon morphology fast enough for a ten-slide batch.
SCALE = 1
DEFAULT_FONT_CANDIDATES = (
    "/root/.local/share/fonts/ZenKurenaido-Regular.ttf",
    "/usr/share/fonts/truetype/zen-kurenaido/ZenKurenaido-Regular.ttf",
    "/root/.local/share/fonts/YujiSyuku-Regular.ttf",
)
SPEAKER_COLORS = {
    "rookie": "#5146B9",
    "junior": "#5146B9",
    "senior": "#FF5370",
    "blue": "#5146B9",
    "pink": "#FF5370",
}


def scaled(value: float) -> int:
    return int(round(value * SCALE))


def find_font(spec: dict) -> str:
    candidates = []
    if spec.get("font_path"):
        candidates.append(spec["font_path"])
    candidates.extend(DEFAULT_FONT_CANDIDATES)
    for candidate in candidates:
        if Path(candidate).is_file():
            return candidate
    raise FileNotFoundError(
        "Zen Kurenaido or Yuji Syuku was not found. Do not silently replace it "
        "with a standard Gothic font."
    )


def irregular_ellipse_points(box: list[float], phase: float) -> list[tuple[int, int]]:
    x, y, w, h = box
    cx = scaled(x + w / 2)
    cy = scaled(y + h / 2)
    rx = scaled(w / 2)
    ry = scaled(h / 2)
    points = []
    for index in range(128):
        angle = 2 * math.pi * index / 128
        wobble = (
            1
            + 0.012 * math.sin(3 * angle + phase)
            + 0.008 * math.sin(7 * angle + 1.7 * phase)
            + 0.005 * math.sin(11 * angle + 0.4 * phase)
        )
        points.append(
            (
                int(round(cx + rx * wobble * math.cos(angle))),
                int(round(cy + ry * wobble * math.sin(angle))),
            )
        )
    return points


def tail_polygon(box: list[float], target: list[float]) -> list[tuple[int, int]]:
    x, y, w, h = box
    cx, cy = x + w / 2, y + h / 2
    tx, ty = target
    angle = math.atan2((ty - cy) / max(h, 1), (tx - cx) / max(w, 1))
    anchor_x = cx + (w / 2) * math.cos(angle)
    anchor_y = cy + (h / 2) * math.sin(angle)
    tangent_x = -math.sin(angle)
    tangent_y = math.cos(angle)
    half_base = min(w, h) * 0.075
    return [
        (scaled(anchor_x + tangent_x * half_base), scaled(anchor_y + tangent_y * half_base)),
        (scaled(tx), scaled(ty)),
        (scaled(anchor_x - tangent_x * half_base), scaled(anchor_y - tangent_y * half_base)),
    ]


def multiline_bbox(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, spacing: int, stroke: int):
    return draw.multiline_textbbox(
        (0, 0), text, font=font, spacing=spacing, align="center", stroke_width=stroke
    )


def draw_text_in_box(
    layer: Image.Image,
    text: str,
    box: list[float],
    font_path: str,
    font_size: float,
    fill: str,
    stroke_fill: str | None,
    stroke_width: float,
    bold_width: float | None,
    padding: float,
    glow_radius: float = 0,
) -> None:
    draw = ImageDraw.Draw(layer)
    font = ImageFont.truetype(font_path, scaled(font_size))
    spacing = scaled(font_size * 0.14)
    stroke = scaled(stroke_width)
    bold = scaled(bold_width if bold_width is not None else font_size * 0.03)
    bbox = multiline_bbox(draw, text, font, spacing, stroke + bold)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x, y, w, h = [scaled(v) for v in box]
    available_w = w - 2 * scaled(padding)
    available_h = h - 2 * scaled(padding)
    if text_w > available_w or text_h > available_h:
        raise ValueError(
            f"Text does not fit its box: {text!r}. Shorten the text, add an explicit "
            "line break, enlarge the box, or move content to another slide."
        )
    origin = (x + (w - text_w) / 2 - bbox[0], y + (h - text_h) / 2 - bbox[1])

    if glow_radius > 0:
        glow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        glow_draw.multiline_text(
            origin,
            text,
            font=font,
            fill="#FFFFFF",
            spacing=spacing,
            align="center",
            stroke_width=scaled(max(stroke_width, 1)),
            stroke_fill="#FFFFFF",
        )
        glow = glow.filter(ImageFilter.GaussianBlur(scaled(glow_radius)))
        layer.alpha_composite(glow)

    draw = ImageDraw.Draw(layer)
    if stroke_fill and stroke_fill.lower() != fill.lower():
        draw.multiline_text(
            origin,
            text,
            font=font,
            fill=fill,
            spacing=spacing,
            align="center",
            stroke_width=stroke + bold,
            stroke_fill=stroke_fill,
        )
    draw.multiline_text(
        origin,
        text,
        font=font,
        fill=fill,
        spacing=spacing,
        align="center",
        stroke_width=bold + (0 if stroke_fill and stroke_fill.lower() != fill.lower() else stroke),
        stroke_fill=fill,
    )


def draw_balloon(layer: Image.Image, item: dict, font_path: str, index: int) -> None:
    box = item["box"]
    outline = item.get("outline") or SPEAKER_COLORS.get(item.get("speaker", "rookie"), "#5146B9")
    fill = item.get("fill", "#FFFDF8")
    width = float(item.get("outline_width", 5))
    phase = float(item.get("phase", 0.71 + index * 1.37))

    mask = Image.new("L", layer.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.polygon(irregular_ellipse_points(box, phase), fill=255)
    if item.get("tail"):
        mask_draw.polygon(tail_polygon(box, item["tail"]), fill=255)

    outer_size = max(3, scaled(width * 1.55) * 2 + 1)
    inner_size = max(3, scaled(width) * 2 + 1)
    if outer_size % 2 == 0:
        outer_size += 1
    if inner_size % 2 == 0:
        inner_size += 1
    outer = mask.filter(ImageFilter.MaxFilter(outer_size))
    inner = mask.filter(ImageFilter.MaxFilter(inner_size))
    outer_ring = ImageChops.subtract(outer, inner)
    inner_ring = ImageChops.subtract(inner, mask)

    soft_color = Image.new("RGBA", layer.size, outline)
    soft_color.putalpha(outer_ring.point(lambda value: int(value * 0.48)))
    layer.alpha_composite(soft_color)
    line_color = Image.new("RGBA", layer.size, outline)
    line_color.putalpha(inner_ring.point(lambda value: int(value * 0.92)))
    layer.alpha_composite(line_color)
    fill_layer = Image.new("RGBA", layer.size, fill)
    fill_layer.putalpha(mask)
    layer.alpha_composite(fill_layer)

    draw_text_in_box(
        layer,
        item["text"],
        box,
        font_path,
        float(item.get("font_size", 66)),
        item.get("text_color", "#101A55"),
        item.get("text_stroke_fill", item.get("text_color", "#101A55")),
        float(item.get("text_stroke_width", 0.5)),
        float(item["bold_width"]) if "bold_width" in item else None,
        float(item.get("padding", 42)),
    )


def render(base_path: Path, spec_path: Path, output_path: Path) -> None:
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    font_path = find_font(spec)
    base = Image.open(base_path).convert("RGBA")
    if base.width * 5 != base.height * 4:
        raise ValueError(f"Expected a 4:5 image, got {base.width}x{base.height}.")
    large = base.resize((base.width * SCALE, base.height * SCALE), Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", large.size, (0, 0, 0, 0))

    for index, item in enumerate(spec.get("balloons", [])):
        draw_balloon(layer, item, font_path, index)

    for item in spec.get("direct_text", []):
        draw_text_in_box(
            layer,
            item["text"],
            item["box"],
            font_path,
            float(item.get("font_size", 92)),
            item.get("fill", "#28107A"),
            item.get("stroke_fill", "#FFFFFF"),
            float(item.get("stroke_width", 2.0)),
            float(item["bold_width"]) if "bold_width" in item else None,
            float(item.get("padding", 8)),
            float(item.get("glow_radius", 5)),
        )

    draw = ImageDraw.Draw(layer)
    for line in spec.get("accent_lines", []):
        draw.line(
            [tuple(scaled(v) for v in line["from"]), tuple(scaled(v) for v in line["to"])],
            fill=line.get("color", "#FF9A19"),
            width=scaled(float(line.get("width", 6))),
        )

    composed = Image.alpha_composite(large, layer)
    composed = composed.resize(base.size, Image.Resampling.LANCZOS).convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.suffix.lower() in {".jpg", ".jpeg"}:
        composed.save(output_path, quality=95, subsampling=0)
    else:
        composed.save(output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("base", type=Path, help="4:5 background image without final text")
    parser.add_argument("spec", type=Path, help="JSON overlay specification")
    parser.add_argument("output", type=Path, help="PNG or JPEG output")
    args = parser.parse_args()
    render(args.base, args.spec, args.output)


if __name__ == "__main__":
    main()
