#!/usr/bin/env python3
"""Calculate provisional KDP paperback cover geometry.

The official KDP cover template remains the final authority. Coefficients below
reflect official guidance checked in August 2026 and can be overridden.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass


PAPER_PRESETS = {
    "bw-white": 0.002252,
    "bw-cream": 0.0025,
    "bw-groundwood": 0.00235,
    "standard-color": 0.002252,
    "premium-color": 0.002347,
}


@dataclass(frozen=True)
class CoverGeometry:
    input_pages: int
    effective_pages: int
    trim_width_in: float
    trim_height_in: float
    bleed_in: float
    paper: str
    spine_per_page_in: float
    spine_width_in: float
    cover_width_in: float
    cover_height_in: float
    back_trim_left_in: float
    back_trim_right_in: float
    spine_left_in: float
    spine_right_in: float
    front_trim_left_in: float
    front_trim_right_in: float
    spine_text_allowed_by_page_count: bool
    usable_spine_text_width_in: float
    pixel_width: int
    pixel_height: int


def geometry_for(
    *,
    trim_width_in: float,
    trim_height_in: float,
    pages: int,
    paper: str,
    bleed_in: float = 0.125,
    ppi: int = 300,
    spine_per_page_in: float | None = None,
) -> CoverGeometry:
    if trim_width_in <= 0 or trim_height_in <= 0:
        raise ValueError("Trim dimensions must be positive")
    if pages < 1:
        raise ValueError("Page count must be positive")
    if bleed_in < 0:
        raise ValueError("Bleed cannot be negative")
    if ppi < 1:
        raise ValueError("PPI must be positive")
    if paper not in PAPER_PRESETS and spine_per_page_in is None:
        raise ValueError(f"Unknown paper preset: {paper}")

    coefficient = (
        spine_per_page_in
        if spine_per_page_in is not None
        else PAPER_PRESETS[paper]
    )
    if coefficient <= 0:
        raise ValueError("Spine coefficient must be positive")

    effective_pages = pages if pages % 2 == 0 else pages + 1
    spine = effective_pages * coefficient
    cover_width = (2 * bleed_in) + (2 * trim_width_in) + spine
    cover_height = (2 * bleed_in) + trim_height_in
    back_left = bleed_in
    back_right = back_left + trim_width_in
    spine_left = back_right
    spine_right = spine_left + spine
    front_left = spine_right
    front_right = front_left + trim_width_in
    fold_clearance = 0.0625 * 2

    return CoverGeometry(
        input_pages=pages,
        effective_pages=effective_pages,
        trim_width_in=trim_width_in,
        trim_height_in=trim_height_in,
        bleed_in=bleed_in,
        paper=paper,
        spine_per_page_in=coefficient,
        spine_width_in=spine,
        cover_width_in=cover_width,
        cover_height_in=cover_height,
        back_trim_left_in=back_left,
        back_trim_right_in=back_right,
        spine_left_in=spine_left,
        spine_right_in=spine_right,
        front_trim_left_in=front_left,
        front_trim_right_in=front_right,
        spine_text_allowed_by_page_count=effective_pages > 79,
        usable_spine_text_width_in=max(0.0, spine - fold_clearance),
        pixel_width=round(cover_width * ppi),
        pixel_height=round(cover_height * ppi),
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--trim-width-in", type=float, required=True)
    parser.add_argument("--trim-height-in", type=float, required=True)
    parser.add_argument("--pages", type=int, required=True)
    parser.add_argument("--paper", choices=sorted(PAPER_PRESETS), required=True)
    parser.add_argument("--bleed-in", type=float, default=0.125)
    parser.add_argument("--ppi", type=int, default=300)
    parser.add_argument(
        "--spine-per-page-in",
        type=float,
        help="Override the preset after checking the current KDP template",
    )
    parser.add_argument("--json", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    geometry = geometry_for(
        trim_width_in=args.trim_width_in,
        trim_height_in=args.trim_height_in,
        pages=args.pages,
        paper=args.paper,
        bleed_in=args.bleed_in,
        ppi=args.ppi,
        spine_per_page_in=args.spine_per_page_in,
    )
    data = asdict(geometry)
    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return 0

    print("KDP PAPERBACK COVER GEOMETRY (PROVISIONAL)")
    print(f"Pages: {geometry.input_pages} (effective: {geometry.effective_pages})")
    if geometry.input_pages != geometry.effective_pages:
        print("Warning: odd page count was rounded up to the effective even count.")
    print(f"Paper preset: {geometry.paper}")
    print(f"Spine coefficient: {geometry.spine_per_page_in:.6f} in/page")
    print(f"Spine width: {geometry.spine_width_in:.6f} in")
    print(f"Cover size: {geometry.cover_width_in:.6f} x {geometry.cover_height_in:.6f} in")
    print(f"At {args.ppi} PPI: {geometry.pixel_width} x {geometry.pixel_height} px")
    print(
        "Spine text by page count: "
        + ("allowed" if geometry.spine_text_allowed_by_page_count else "omit")
    )
    print(f"Usable spine text width: {geometry.usable_spine_text_width_in:.6f} in")
    print("Verify against the current official KDP cover template before export.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
