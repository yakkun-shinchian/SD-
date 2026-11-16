#!/usr/bin/env python3
"""Flow-layout LANGUAGE NOTES pages and verify every text bounding box.

The renderer deliberately has no fixed section Y coordinates.  It measures and
wraps every line, paginates whole sections, and emits machine-readable QA.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

import fitz


PAGE_W = 1009
PAGE_H = 1536
MARGIN_X = 58
HEADER_H = 170
CONTENT_TOP = 196
BOTTOM_SAFE = 72
BODY_SIZE = 28.0
BODY_LINE = 36.0
HEADING_SIZE = 36.0
HEADING_BAR_H = 50.0
HEADING_BODY_GAP = 12.0
SECTION_GAP = 18.0
CONTENT_W = PAGE_W - 2 * MARGIN_X
BODY_W = CONTENT_W - 16

BG = (0.984, 0.976, 0.945)
NAVY = (0.075, 0.231, 0.345)
TEAL = (0.17, 0.52, 0.55)
BAR = (0.86, 0.94, 0.94)
TEXT = (0.09, 0.13, 0.16)
MUTED = (0.34, 0.40, 0.43)
WHITE = (1, 1, 1)

KINSOKU_START = set("、。，．！？!?：；:;）〕］｝〉》」』】〙〗〟’”ァィゥェォッャュョヮ々ー〜")
KINSOKU_END = set("（〔［｛〈《「『【〘〖〝‘“")


@dataclass
class TextBox:
    lesson: int
    page_part: int
    kind: str
    section: int
    text: str
    x: float
    y: float
    width: float
    height: float

    @property
    def rect(self) -> fitz.Rect:
        return fitz.Rect(self.x, self.y, self.x + self.width, self.y + self.height)


@dataclass
class Section:
    number: int
    title: str
    paragraphs: list[str]
    lines: list[tuple[str, str]] | None = None


def pure_ascii(text: str) -> bool:
    return all(ord(c) < 128 for c in text)


def font_for(text: str) -> str:
    if pure_ascii(text):
        return "helv"
    if not any(ord(c) < 128 and (c.isalnum() or c in "'/-+:.?") for c in text):
        return "japan"
    return "mixed"


def text_width(text: str, font_name: str, size: float) -> float:
    if font_name == "mixed":
        return sum(text_width(run, fn, size) for run, fn in mixed_runs(text))
    return fitz.get_text_length(text, fontname=font_name, fontsize=size)


def mixed_runs(text: str) -> list[tuple[str, str]]:
    runs: list[tuple[str, str]] = []
    current = ""
    current_font = ""
    for ch in text:
        fn = "helv" if ord(ch) < 128 else "japan"
        if current and fn != current_font:
            runs.append((current, current_font))
            current = ch
        else:
            current += ch
        current_font = fn
    if current:
        runs.append((current, current_font))
    return runs


def split_long_ascii_token(token: str, width: float, size: float) -> list[str]:
    pieces: list[str] = []
    current = ""
    for ch in token:
        trial = current + ch
        if current and text_width(trial, "helv", size) > width:
            pieces.append(current)
            current = ch
        else:
            current = trial
    if current:
        pieces.append(current)
    return pieces


def wrap_ascii(text: str, width: float, size: float) -> list[str]:
    words: list[str] = []
    for token in text.split():
        if text_width(token, "helv", size) <= width:
            words.append(token)
        else:
            words.extend(split_long_ascii_token(token, width, size))
    if not words:
        return [""]
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        trial = current + " " + word
        if text_width(trial, "helv", size) <= width:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def wrap_cjk(text: str, width: float, size: float) -> list[str]:
    text = re.sub(r"[ \t]+", " ", text.strip())
    if not text:
        return [""]
    lines: list[str] = []
    current = ""
    i = 0
    # Treat an English word as one token, while Japanese remains character-aware.
    tokens = re.findall(r"[A-Za-z0-9][A-Za-z0-9'./:+?_-]*| +|.", text)
    while i < len(tokens):
        ch = tokens[i]
        trial = current + ch
        if current and text_width(trial, "mixed", size) > width:
            # Keep closing punctuation off a new line when it fits by moving the
            # preceding glyph with it.  Also avoid ending on opening punctuation.
            if ch in KINSOKU_START and len(current) > 1:
                moved = current[-1]
                lines.append(current[:-1])
                current = moved + ch
                i += 1
                continue
            if current[-1] in KINSOKU_END and len(current) > 1:
                moved = current[-1]
                lines.append(current[:-1])
                current = moved
                continue
            lines.append(current.rstrip())
            current = ch.lstrip()
        else:
            current = trial
        i += 1
    if current:
        lines.append(current.rstrip())
    # Avoid a dangling one- or two-character Japanese line when a natural short
    # phrase can be moved from the preceding line without exceeding the width.
    if len(lines) >= 2 and len(lines[-1].strip()) <= 2 and len(lines[-2].strip()) >= 6:
        previous = lines[-2].rstrip()
        moved = previous[-3:] + lines[-1].lstrip()
        shortened = previous[:-3].rstrip()
        if shortened and text_width(moved, "mixed", size) <= width:
            lines[-2], lines[-1] = shortened, moved
    return lines


def wrap_paragraph(text: str, width: float = BODY_W, size: float = BODY_SIZE) -> list[tuple[str, str]]:
    if not text:
        return [("", "japan")]
    wrapped: list[tuple[str, str]] = []
    for source_line in str(text).splitlines() or [""]:
        fn = font_for(source_line)
        lines = wrap_ascii(source_line, width, size) if fn == "helv" else wrap_cjk(source_line, width, size)
        wrapped.extend((line, font_for(line)) for line in lines)
    return wrapped


def lookup_dialogue(lesson: dict) -> dict[str, dict]:
    return {
        balloon["balloon_id"]: balloon
        for panel in lesson["comic"]["panels"]
        for balloon in panel["dialogue"]
    }


def lesson_sections(lesson: dict) -> list[Section]:
    ex = lesson["explanation"]
    dialogue = lookup_dialogue(lesson)
    phrases: list[str] = []
    for ref in ex["required_phrase_refs"]:
        d = dialogue[ref]
        phrases.append(f'{d["english"]}\n{d["japanese"]}')
    vocab: list[str] = []
    for v in ex["vocabulary"]:
        vocab.append(
            f'{v["term"]}：{v["medical_meaning_ja"]}\n'
            f'例：{v["example_en"]} / {v["example_ja"]}'
        )
    gram = ex["grammar"]
    gd = dialogue[gram["example_ref"]]
    grammar = [gram["pattern"], gram["explanation_ja"], f'例：{gd["english"]} / {gd["japanese"]}']
    apps = [f'{a["english"]}\n{a["japanese"]}' for a in ex["applications"]]
    ce = ex["common_error"]
    error = [f'Avoid: {ce["avoid"]}', f'Prefer: {ce["prefer"]}', f'理由：{ce["why_ja"]}']
    mp = ex["mini_practice"]
    practice = [f'Q. {mp["question_ja"]}', f'A. {mp["answer_en"]}', mp["answer_ja"]]
    return [
        Section(1, "学習目標", [ex["goal_ja"]]),
        Section(2, "必須フレーズ", phrases),
        Section(3, "語彙", vocab),
        Section(4, "文法", grammar),
        Section(5, "中学英語ブリッジ", [ex["junior_high_bridge_ja"]]),
        Section(6, "応用", apps),
        Section(7, "よくある誤り", error),
        Section(8, "安全メモ", [ex["safety_note_ja"]]),
        Section(9, "ミニ練習", practice),
    ]


def measure_section(section: Section) -> float:
    lines: list[tuple[str, str]] = []
    for idx, paragraph in enumerate(section.paragraphs):
        if idx:
            lines.append(("", "japan"))
        lines.extend(wrap_paragraph(paragraph))
    section.lines = lines
    return HEADING_BAR_H + HEADING_BODY_GAP + max(1, len(lines)) * BODY_LINE + SECTION_GAP


def paginate(sections: list[Section]) -> list[list[Section]]:
    pages: list[list[Section]] = []
    current: list[Section] = []
    used = CONTENT_TOP
    limit = PAGE_H - BOTTOM_SAFE
    for section in sections:
        needed = measure_section(section)
        if needed > limit - CONTENT_TOP:
            raise ValueError(f"Section {section.number} is too tall at minimum readable type size")
        if current and used + needed > limit:
            pages.append(current)
            current = []
            used = CONTENT_TOP
        current.append(section)
        used += needed
    if current:
        pages.append(current)
    return pages


def add_box(boxes: list[TextBox], lesson: int, part: int, kind: str, section: int,
            text: str, x: float, y: float, width: float, height: float) -> None:
    boxes.append(TextBox(lesson, part, kind, section, text, x, y, width, height))


def render_page(lesson: dict, sections: list[Section], part: int, total: int, output: Path) -> list[TextBox]:
    doc = fitz.open()
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    page.draw_rect(page.rect, fill=BG, color=BG)
    page.draw_rect(fitz.Rect(0, 0, PAGE_W, HEADER_H), fill=NAVY, color=NAVY)
    page.draw_rect(fitz.Rect(0, HEADER_H - 9, PAGE_W, HEADER_H), fill=TEAL, color=TEAL)
    lesson_no = int(lesson["lesson_no"])
    boxes: list[TextBox] = []

    kicker = f"LESSON {lesson_no:02d}  •  LANGUAGE NOTES {part}/{total}"
    page.insert_text((MARGIN_X, 52), kicker, fontname="helv", fontsize=24, color=WHITE)
    add_box(boxes, lesson_no, part, "page_header", 0, kicker, MARGIN_X, 27,
            text_width(kicker, "helv", 24), 31)
    title_ja = lesson["title_ja"]
    page.insert_text((MARGIN_X, 105), title_ja, fontname="japan", fontsize=39, color=WHITE)
    add_box(boxes, lesson_no, part, "page_title", 0, title_ja, MARGIN_X, 66,
            text_width(title_ja, "japan", 39), 49)
    title_en = lesson["title_en"]
    page.insert_text((MARGIN_X, 143), title_en, fontname="helv", fontsize=23, color=(0.83, 0.92, 0.95))
    add_box(boxes, lesson_no, part, "page_subtitle", 0, title_en, MARGIN_X, 119,
            text_width(title_en, "helv", 23), 30)

    y = CONTENT_TOP
    for section in sections:
        bar = fitz.Rect(MARGIN_X, y, PAGE_W - MARGIN_X, y + HEADING_BAR_H)
        page.draw_rect(bar, fill=BAR, color=BAR)
        heading = f"{section.number}  {section.title}"
        page.insert_text((MARGIN_X + 18, y + 40), heading, fontname="japan", fontsize=HEADING_SIZE, color=NAVY)
        add_box(boxes, lesson_no, part, "section_heading", section.number, heading,
                MARGIN_X + 18, y + 4, text_width(heading, "japan", HEADING_SIZE), HEADING_BAR_H - 6)
        y += HEADING_BAR_H + HEADING_BODY_GAP
        assert section.lines is not None
        for line, fn in section.lines:
            if line:
                if fn == "mixed":
                    run_x = MARGIN_X + 8
                    for run, run_font in mixed_runs(line):
                        page.insert_text((run_x, y + BODY_SIZE), run, fontname=run_font,
                                         fontsize=BODY_SIZE, color=TEXT)
                        run_x += text_width(run, run_font, BODY_SIZE)
                else:
                    page.insert_text((MARGIN_X + 8, y + BODY_SIZE), line, fontname=fn,
                                     fontsize=BODY_SIZE, color=TEXT)
                add_box(boxes, lesson_no, part, "body", section.number, line,
                        MARGIN_X + 8, y, text_width(line, fn, BODY_SIZE), BODY_LINE)
            y += BODY_LINE
        y += SECTION_GAP

    footer = f"YAKUBON STUDIO  •  {lesson_no:02d}"
    page.insert_text((PAGE_W - MARGIN_X - text_width(footer, "helv", 18), PAGE_H - 29),
                     footer, fontname="helv", fontsize=18, color=MUTED)
    output.parent.mkdir(parents=True, exist_ok=True)
    pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
    # Encode fully in memory before the atomic-sized write; direct Pixmap.save
    # can leave a partial PNG if an interrupted filesystem flush occurs.
    output.write_bytes(pix.tobytes("png"))
    doc.close()
    return boxes


def intersection_area(a: fitz.Rect, b: fitz.Rect) -> float:
    inter = a & b
    return max(0.0, inter.width) * max(0.0, inter.height)


def qa_page(boxes: list[TextBox]) -> dict:
    content_bounds = fitz.Rect(0, 0, PAGE_W, PAGE_H)
    overlap = 0
    heading_body = 0
    body_body = 0
    section_overlap = 0
    pairs: list[dict] = []
    for i, left in enumerate(boxes):
        for right in boxes[i + 1:]:
            area = intersection_area(left.rect, right.rect)
            if area <= 0:
                continue
            overlap += 1
            if {left.kind, right.kind} == {"section_heading", "body"}:
                heading_body += 1
            if left.kind == right.kind == "body":
                body_body += 1
            if left.section and right.section and left.section != right.section:
                section_overlap += 1
            pairs.append({"a": asdict(left), "b": asdict(right), "intersection_area": area})
    out = [b for b in boxes if not content_bounds.contains(b.rect)]
    bottom = [b for b in boxes if b.kind in {"body", "section_heading"} and b.rect.y1 > PAGE_H - BOTTOM_SAFE]
    too_wide = [b for b in boxes if b.x + b.width > PAGE_W - MARGIN_X + 0.5]
    return {
        "text_overlap_count": overlap,
        "text_out_of_bounds_count": len(out),
        "clipped_text_count": len(too_wide),
        "section_overlap_count": section_overlap,
        "heading_body_overlap_count": heading_body,
        "body_body_overlap_count": body_body,
        "bottom_overflow_count": len(bottom),
        "overlap_pairs": pairs,
    }


def build(pack_path: Path, output_dir: Path, qa_json: Path, qa_csv: Path, manifest_path: Path) -> dict:
    pack = json.loads(pack_path.read_text(encoding="utf-8"))
    output_dir.mkdir(parents=True, exist_ok=True)
    for stale in output_dir.glob("lesson_*_language_notes_*.png"):
        stale.unlink()
    report = {
        "engine": "flow-layout-bbox-v1",
        "page_size": [PAGE_W, PAGE_H],
        "body_font_size_px": BODY_SIZE,
        "body_font_size_pt_at_144dpi": BODY_SIZE / 2,
        "heading_font_size_px": HEADING_SIZE,
        "heading_font_size_pt_at_144dpi": HEADING_SIZE / 2,
        "line_height_ratio": BODY_LINE / BODY_SIZE,
        "bottom_safe_margin_px": BOTTOM_SAFE,
        "lessons": [],
    }
    manifest: list[dict] = []
    for lesson in pack["lessons"]:
        lesson_no = int(lesson["lesson_no"])
        sections = lesson_sections(lesson)
        pages = paginate(sections)
        lesson_counts = {
            "lesson_no": lesson_no,
            "language_notes_pages": len(pages),
            "expected_sections": 9,
            "rendered_sections": 0,
            "missing_text_count": 0,
            "text_integrity_sections": [],
            "pages": [],
        }
        rendered: set[int] = set()
        for part, page_sections in enumerate(pages, 1):
            name = f"lesson_{lesson_no:02d}_language_notes_{part:02d}.png"
            boxes = render_page(lesson, page_sections, part, len(pages), output_dir / name)
            rendered.update(s.number for s in page_sections)
            checks = qa_page(boxes)
            checks.update({"page_part": part, "file": name, "text_box_count": len(boxes),
                           "text_boxes": [asdict(box) for box in boxes]})
            lesson_counts["pages"].append(checks)
            manifest.append({
                "lesson_no": lesson_no,
                "part": part,
                "parts": len(pages),
                "file": name,
                "sections": [s.number for s in page_sections],
            })
        lesson_counts["rendered_sections"] = len(rendered)
        missing_sections = set(range(1, 10)) - rendered
        integrity_failures = 0
        for section in sections:
            expected = re.sub(r"\s+", "", "".join(section.paragraphs))
            actual = re.sub(r"\s+", "", "".join(line for line, _ in (section.lines or [])))
            ok = expected == actual
            lesson_counts["text_integrity_sections"].append({"section": section.number, "pass": ok})
            integrity_failures += 0 if ok else 1
        lesson_counts["missing_text_count"] = len(missing_sections) + integrity_failures
        for key in (
            "text_overlap_count", "text_out_of_bounds_count", "clipped_text_count",
            "section_overlap_count", "heading_body_overlap_count", "body_body_overlap_count",
            "bottom_overflow_count",
        ):
            lesson_counts[key] = sum(p[key] for p in lesson_counts["pages"])
        report["lessons"].append(lesson_counts)

    total_keys = (
        "text_overlap_count", "text_out_of_bounds_count", "clipped_text_count", "missing_text_count",
        "section_overlap_count", "heading_body_overlap_count", "body_body_overlap_count",
        "bottom_overflow_count",
    )
    report["totals"] = {key: sum(l[key] for l in report["lessons"]) for key in total_keys}
    report["totals"]["language_notes_page_count"] = len(manifest)
    report["pass"] = all(report["totals"][key] == 0 for key in total_keys)
    qa_json.parent.mkdir(parents=True, exist_ok=True)
    qa_json.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    with qa_csv.open("w", encoding="utf-8-sig", newline="") as fh:
        fieldnames = ["lesson_no", "language_notes_pages", *total_keys, "status"]
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for lesson in report["lessons"]:
            row = {k: lesson[k] for k in fieldnames if k != "status"}
            row["status"] = "PASS" if all(lesson[k] == 0 for k in total_keys) else "FAIL"
            writer.writerow(row)
    if not report["pass"]:
        raise SystemExit("LANGUAGE NOTES QA failed; see report")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("lesson_pack", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--qa-json", type=Path, required=True)
    parser.add_argument("--qa-csv", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    report = build(args.lesson_pack, args.output_dir, args.qa_json, args.qa_csv, args.manifest)
    print(json.dumps(report["totals"], ensure_ascii=False))


if __name__ == "__main__":
    main()
