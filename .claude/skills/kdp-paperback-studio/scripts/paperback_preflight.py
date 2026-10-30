#!/usr/bin/env python3
"""Preflight KDP paperback interior and optional full wrap cover PDFs."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path

import fitz

from cover_geometry import PAPER_PRESETS, geometry_for


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--interior", type=Path, required=True)
    parser.add_argument("--cover", type=Path)
    parser.add_argument("--trim-width-in", type=float)
    parser.add_argument("--trim-height-in", type=float)
    parser.add_argument("--interior-bleed", choices=("none", "full"), default="none")
    parser.add_argument("--paper", choices=sorted(PAPER_PRESETS), default="premium-color")
    parser.add_argument("--bleed-in", type=float, default=0.125)
    parser.add_argument("--spine-per-page-in", type=float)
    parser.add_argument("--json", action="store_true")
    return parser.parse_args()


def inspect_fonts(path: Path) -> tuple[list[str], str | None]:
    if shutil.which("pdffonts") is None:
        return [], "pdffonts is unavailable; font embedding was not checked"
    result = subprocess.run(
        ["pdffonts", str(path)],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return [], f"pdffonts failed: {result.stderr.strip()}"
    lines = result.stdout.splitlines()
    if len(lines) < 2:
        return [], "pdffonts returned no font table"
    header = lines[0]
    type_start = header.index("type")
    emb_start = header.index("emb")
    sub_start = header.index("sub")
    unembedded = []
    for line in lines[2:]:
        if not line.strip():
            continue
        name = line[:type_start].strip()
        embedded = line[emb_start:sub_start].strip()
        if embedded != "yes":
            unembedded.append(name or "unknown font")
    return unembedded, None


def inspect_image_ppi(document: fitz.Document) -> float | None:
    minimum: float | None = None
    for page in document:
        for image in page.get_images(full=True):
            xref, pixel_width, pixel_height = image[0], image[2], image[3]
            try:
                rects = page.get_image_rects(xref)
            except Exception:
                continue
            for rect in rects:
                if rect.width <= 0 or rect.height <= 0:
                    continue
                x_ppi = pixel_width / (rect.width / 72.0)
                y_ppi = pixel_height / (rect.height / 72.0)
                placement_ppi = min(x_ppi, y_ppi)
                minimum = placement_ppi if minimum is None else min(minimum, placement_ppi)
    return minimum


def inspect_pdf(
    path: Path,
    *,
    role: str,
    expected_width_pt: float | None = None,
    expected_height_pt: float | None = None,
) -> tuple[fitz.Document | None, list[str], list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    info: list[str] = []
    if not path.is_file():
        return None, [f"{role}: file not found: {path}"], warnings, info
    try:
        document = fitz.open(path)
    except Exception as exc:
        return None, [f"{role}: cannot open PDF: {exc}"], warnings, info
    if document.needs_pass:
        errors.append(f"{role}: PDF is password protected")
        return document, errors, warnings, info
    if len(document) < 1:
        errors.append(f"{role}: PDF has no pages")
        return document, errors, warnings, info

    first = document[0].rect
    info.append(f"{role}: {len(document)} page(s), {first.width:.2f} x {first.height:.2f} pt")
    for index, page in enumerate(document):
        if abs(page.rect.width - first.width) > 0.5 or abs(page.rect.height - first.height) > 0.5:
            errors.append(f"{role}: page {index + 1} has a different page size")
            break
    if expected_width_pt is not None and expected_height_pt is not None:
        if abs(first.width - expected_width_pt) > 1.5 or abs(first.height - expected_height_pt) > 1.5:
            errors.append(
                f"{role}: expected {expected_width_pt:.2f} x {expected_height_pt:.2f} pt, "
                f"found {first.width:.2f} x {first.height:.2f} pt"
            )

    unembedded, font_warning = inspect_fonts(path)
    if font_warning:
        warnings.append(f"{role}: {font_warning}")
    if unembedded:
        errors.append(f"{role}: unembedded fonts: {', '.join(unembedded)}")
    return document, errors, warnings, info


def main() -> int:
    args = parse_args()
    errors: list[str] = []
    warnings: list[str] = []
    info: list[str] = []

    dimensions_given = args.trim_width_in is not None and args.trim_height_in is not None
    if (args.trim_width_in is None) != (args.trim_height_in is None):
        errors.append("Provide both trim dimensions or neither")

    expected_interior_width_pt = None
    expected_interior_height_pt = None
    if dimensions_given:
        width_in = args.trim_width_in
        height_in = args.trim_height_in
        if args.interior_bleed == "full":
            width_in += args.bleed_in
            height_in += 2 * args.bleed_in
        expected_interior_width_pt = width_in * 72.0
        expected_interior_height_pt = height_in * 72.0

    interior, e, w, i = inspect_pdf(
        args.interior,
        role="interior",
        expected_width_pt=expected_interior_width_pt,
        expected_height_pt=expected_interior_height_pt,
    )
    errors.extend(e)
    warnings.extend(w)
    info.extend(i)
    page_count = len(interior) if interior is not None else 0
    if interior is not None:
        if page_count < 24:
            errors.append("interior: fewer than the general KDP minimum of 24 pages")
        if page_count % 2:
            warnings.append(
                f"interior: odd page count {page_count}; KDP will use an effective count of {page_count + 1}"
            )
        minimum_ppi = inspect_image_ppi(interior)
        if minimum_ppi is not None:
            info.append(f"interior: minimum detected placed-image resolution {minimum_ppi:.1f} PPI")
            if minimum_ppi < 150:
                errors.append("interior: at least one placed image is below 150 PPI")
            elif minimum_ppi < 300:
                warnings.append("interior: at least one placed image is below 300 PPI")

    geometry = None
    if args.cover is not None:
        if not dimensions_given or page_count < 1:
            errors.append("cover: trim dimensions and a readable interior are required")
        else:
            geometry = geometry_for(
                trim_width_in=args.trim_width_in,
                trim_height_in=args.trim_height_in,
                pages=page_count,
                paper=args.paper,
                bleed_in=args.bleed_in,
                spine_per_page_in=args.spine_per_page_in,
            )
            cover, e, w, i = inspect_pdf(
                args.cover,
                role="cover",
                expected_width_pt=geometry.cover_width_in * 72.0,
                expected_height_pt=geometry.cover_height_in * 72.0,
            )
            errors.extend(e)
            warnings.extend(w)
            info.extend(i)
            if cover is not None and len(cover) != 1:
                errors.append("cover: must contain exactly one continuous PDF page")
            if cover is not None:
                cover.close()

    if interior is not None:
        interior.close()

    report = {
        "status": "pass" if not errors else "fail",
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "page_count": page_count,
        "effective_even_page_count": page_count if page_count % 2 == 0 else page_count + 1,
        "geometry": None if geometry is None else geometry.__dict__,
    }
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"PREFLIGHT: {report['status'].upper()}")
        prefixes = {"errors": "ERROR", "warnings": "WARNING", "info": "INFO"}
        for label in ("errors", "warnings", "info"):
            for item in report[label]:
                print(f"{prefixes[label]}: {item}")
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
