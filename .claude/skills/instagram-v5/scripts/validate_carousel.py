#!/usr/bin/env python3
"""Validate deterministic delivery properties for a V5 image carousel."""

from __future__ import annotations

import argparse
import hashlib
import re
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
                item
                for item in sorted(path.iterdir())
                if item.is_file() and item.suffix.lower() in SUPPORTED
            )
        elif path.is_file() and path.suffix.lower() in SUPPORTED:
            images.append(path)
        else:
            print(f"ERROR unsupported or missing target: {path}", file=sys.stderr)
    return images


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def validate_sequence(images: list[Path]) -> list[str]:
    problems: list[str] = []
    for index, path in enumerate(images, start=1):
        match = re.match(r"^(\d{2})(?:[_-]|$)", path.name)
        if not match:
            problems.append(f"{path.name}: filename must start with {index:02d}_")
            continue
        actual = int(match.group(1))
        if actual != index:
            problems.append(
                f"{path.name}: sequence number {actual:02d}, expected {index:02d}"
            )
    return problems


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("targets", nargs="+", help="Image files or directories")
    parser.add_argument("--expect-count", type=int)
    parser.add_argument("--min-width", type=int, default=1080)
    parser.add_argument("--min-height", type=int, default=1920)
    parser.add_argument("--ratio-tolerance", type=float, default=0.012)
    parser.add_argument("--require-sequence", action="store_true")
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

    if args.require_sequence:
        for problem in validate_sequence(images):
            print(f"FAIL {problem}", file=sys.stderr)
            failed = True

    target_ratio = 9 / 16
    seen_hashes: dict[str, Path] = {}

    for path in images:
        try:
            with Image.open(path) as image:
                width, height = image.size
                image.verify()
        except Exception as exc:
            print(f"FAIL {path.name}: unreadable image ({exc})", file=sys.stderr)
            failed = True
            continue

        ratio = width / height
        problems: list[str] = []
        if width < args.min_width:
            problems.append(f"width {width}px < {args.min_width}px")
        if height < args.min_height:
            problems.append(f"height {height}px < {args.min_height}px")
        if abs(ratio - target_ratio) > args.ratio_tolerance:
            problems.append(f"ratio {ratio:.4f} is not 9:16")

        file_hash = digest(path)
        duplicate = seen_hashes.get(file_hash)
        if duplicate is not None:
            problems.append(f"duplicates {duplicate.name}")
        else:
            seen_hashes[file_hash] = path

        if problems:
            print(f"FAIL {path.name}: " + "; ".join(problems), file=sys.stderr)
            failed = True
        else:
            print(f"PASS {path.name}: {width}x{height}, ratio {ratio:.4f}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
