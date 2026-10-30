#!/usr/bin/env python3
"""Build a review-only spread PDF from a single-page paperback interior."""

from __future__ import annotations

import argparse
from pathlib import Path

import fitz


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_pdf", type=Path)
    parser.add_argument("output_pdf", type=Path)
    parser.add_argument("--direction", choices=("ltr", "rtl"), default="ltr")
    parser.add_argument("--gap-pt", type=float, default=12.0)
    parser.add_argument("--margin-pt", type=float, default=18.0)
    parser.add_argument("--no-labels", action="store_true")
    return parser.parse_args()


def add_spread(
    output: fitz.Document,
    source: fitz.Document,
    *,
    left_index: int | None,
    right_index: int | None,
    page_width: float,
    page_height: float,
    gap: float,
    margin: float,
    labels: bool,
) -> None:
    label_height = 18.0 if labels else 0.0
    spread_width = (2 * margin) + (2 * page_width) + gap
    spread_height = (2 * margin) + page_height + label_height
    page = output.new_page(width=spread_width, height=spread_height)
    page.draw_rect(page.rect, color=None, fill=(0.70, 0.70, 0.70))

    left_rect = fitz.Rect(margin, margin, margin + page_width, margin + page_height)
    right_x = margin + page_width + gap
    right_rect = fitz.Rect(right_x, margin, right_x + page_width, margin + page_height)
    page.draw_rect(left_rect, color=None, fill=(1, 1, 1))
    page.draw_rect(right_rect, color=None, fill=(1, 1, 1))

    if left_index is not None:
        page.show_pdf_page(left_rect, source, left_index)
    if right_index is not None:
        page.show_pdf_page(right_rect, source, right_index)

    if labels:
        left_label = "blank" if left_index is None else str(left_index + 1)
        right_label = "blank" if right_index is None else str(right_index + 1)
        label_rect = fitz.Rect(
            margin,
            margin + page_height + 2,
            spread_width - margin,
            spread_height - 2,
        )
        page.insert_textbox(
            label_rect,
            f"{left_label} | {right_label}",
            fontname="helv",
            fontsize=8,
            align=fitz.TEXT_ALIGN_CENTER,
            color=(0.15, 0.15, 0.15),
        )


def main() -> int:
    args = parse_args()
    if args.gap_pt < 0 or args.margin_pt < 0:
        raise SystemExit("Gap and margin must be non-negative")
    source = fitz.open(args.input_pdf)
    if source.needs_pass:
        raise SystemExit("Input PDF is password protected")
    if len(source) < 1:
        raise SystemExit("Input PDF has no pages")

    first_rect = source[0].rect
    for index, page in enumerate(source):
        if abs(page.rect.width - first_rect.width) > 0.5 or abs(
            page.rect.height - first_rect.height
        ) > 0.5:
            raise SystemExit(f"Page {index + 1} has a different size")

    args.output_pdf.parent.mkdir(parents=True, exist_ok=True)
    output = fitz.open()
    if args.direction == "ltr":
        add_spread(
            output,
            source,
            left_index=None,
            right_index=0,
            page_width=first_rect.width,
            page_height=first_rect.height,
            gap=args.gap_pt,
            margin=args.margin_pt,
            labels=not args.no_labels,
        )
        for left_index in range(1, len(source), 2):
            right_index = left_index + 1 if left_index + 1 < len(source) else None
            add_spread(
                output,
                source,
                left_index=left_index,
                right_index=right_index,
                page_width=first_rect.width,
                page_height=first_rect.height,
                gap=args.gap_pt,
                margin=args.margin_pt,
                labels=not args.no_labels,
            )
    else:
        add_spread(
            output,
            source,
            left_index=0,
            right_index=None,
            page_width=first_rect.width,
            page_height=first_rect.height,
            gap=args.gap_pt,
            margin=args.margin_pt,
            labels=not args.no_labels,
        )
        for right_index in range(1, len(source), 2):
            left_index = right_index + 1 if right_index + 1 < len(source) else None
            add_spread(
                output,
                source,
                left_index=left_index,
                right_index=right_index,
                page_width=first_rect.width,
                page_height=first_rect.height,
                gap=args.gap_pt,
                margin=args.margin_pt,
                labels=not args.no_labels,
            )

    output.set_metadata(
        {
            "title": f"Spread preview - {args.input_pdf.name}",
            "subject": "Review only; do not upload as the KDP manuscript",
            "producer": "kdp-paperback-studio",
        }
    )
    output.save(args.output_pdf, garbage=4, deflate=True, clean=True)
    spread_count = len(output)
    output.close()
    source.close()
    print(f"Created {args.output_pdf} ({spread_count} review spreads)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
