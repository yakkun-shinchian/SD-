#!/usr/bin/env python3
"""Validate basic delivery properties for YAKUBON 4:5 carousel images."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image


SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}


def collect_images(targets: list[str]) -> list[Path]:
    images: list[Path] = []
    for raw in targets:
        path = Path(raw)
        if path.is_dir():
            images.extend(
                item for item in sorted(path.iterdir())
                if item.is_file() and item.suffix.lower() in SUPPORTED
            )
        elif path.is_file() and path.suffix.lower() in SUPPORTED:
            images.append(path)
        else:
            print(f"ERROR unsupported or missing target: {path}", file=sys.stderr)
    return images


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("targets", nargs="+", help="Image files or directories")
    parser.add_argument("--expect-count", type=int)
    parser.add_argument("--min-width", type=int, default=1080)
    parser.add_argument("--ratio-tolerance", type=float, default=0.01)
    args = parser.parse_args()

    images = collect_images(args.targets)
    failed = False

    if not images:
        print("ERROR no supported images found", file=sys.stderr)
        return 2

    if args.expect_count is not None and len(images) != args.expect_count:
        print(
            f"FAIL count: found {len(images)}, expected {args.expect_count}",
            file=sys.stderr,
        )
        failed = True

    target_ratio = 4 / 5
    for path in images:
        try:
            with Image.open(path) as image:
                width, height = image.size
                image.verify()
        except Exception as exc:  # pragma: no cover
            print(f"FAIL {path.name}: unreadable image ({exc})", file=sys.stderr)
            failed = True
            continue

        ratio = width / height
        problems: list[str] = []
        if width < args.min_width:
            problems.append(f"width {width}px < {args.min_width}px")
        if abs(ratio - target_ratio) > args.ratio_tolerance:
            problems.append(f"ratio {ratio:.4f} is not 4:5")

        if problems:
            print(f"FAIL {path.name}: " + "; ".join(problems), file=sys.stderr)
            failed = True
        else:
            print(f"PASS {path.name}: {width}x{height}, ratio {ratio:.4f}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
