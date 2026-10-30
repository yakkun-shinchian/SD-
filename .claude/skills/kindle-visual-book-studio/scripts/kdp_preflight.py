#!/usr/bin/env python3
"""Inspect an EPUB and eBook cover before Amazon KDP submission."""

from __future__ import annotations

import argparse
import html
import json
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image


DC = "http://purl.org/dc/elements/1.1/"
CONTAINER = "urn:oasis:names:tc:opendocument:xmlns:container"
OPF = "http://www.idpf.org/2007/opf"
XHTML = "http://www.w3.org/1999/xhtml"
XML = "http://www.w3.org/XML/1998/namespace"


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--epub", type=Path, required=True)
    p.add_argument("--cover", type=Path)
    p.add_argument("--expected-title")
    p.add_argument("--expected-author")
    p.add_argument("--expected-language")
    p.add_argument("--json", action="store_true", dest="as_json")
    return p


def text_of(root: ET.Element, tag: str) -> str:
    node = root.find(tag)
    return "" if node is None or node.text is None else node.text.strip()


def inspect_epub(path: Path) -> dict:
    result: dict = {"path": str(path), "errors": [], "warnings": []}
    if not path.is_file():
        result["errors"].append("EPUB file does not exist")
        return result

    try:
        with zipfile.ZipFile(path) as zf:
            infos = zf.infolist()
            if not infos or infos[0].filename != "mimetype":
                result["errors"].append("mimetype is not the first ZIP entry")
            elif infos[0].compress_type != zipfile.ZIP_STORED:
                result["errors"].append("mimetype is compressed")
            try:
                mimetype = zf.read("mimetype").decode("ascii").strip()
            except KeyError:
                mimetype = ""
                result["errors"].append("mimetype entry is missing")
            result["mimetype"] = mimetype
            if mimetype != "application/epub+zip":
                result["errors"].append(f"unexpected mimetype: {mimetype or '(empty)'}")

            try:
                container = ET.fromstring(zf.read("META-INF/container.xml"))
                rootfile = container.find(f".//{{{CONTAINER}}}rootfile")
                opf_path = "" if rootfile is None else rootfile.get("full-path", "")
            except (KeyError, ET.ParseError) as exc:
                result["errors"].append(f"invalid container.xml: {exc}")
                return result
            if not opf_path:
                result["errors"].append("OPF rootfile path is missing")
                return result

            try:
                package = ET.fromstring(zf.read(opf_path))
            except (KeyError, ET.ParseError) as exc:
                result["errors"].append(f"invalid OPF package: {exc}")
                return result

            title = text_of(package, f".//{{{DC}}}title")
            author = text_of(package, f".//{{{DC}}}creator")
            language = text_of(package, f".//{{{DC}}}language")
            result.update({"opf": opf_path, "title": title, "author": author, "language": language})

            layout = ""
            for meta in package.findall(f".//{{{OPF}}}meta"):
                if meta.get("property") == "rendition:layout":
                    layout = (meta.text or "").strip()
                elif meta.get("name") == "fixed-layout":
                    layout = meta.get("content", "")
            result["layout"] = layout or "not declared"

            spine = package.find(f".//{{{OPF}}}spine")
            result["page_progression_direction"] = "" if spine is None else spine.get(
                "page-progression-direction", "not declared"
            )

            opf_dir = Path(opf_path).parent
            manifest: dict[str, tuple[str, str]] = {}
            for item in package.findall(f".//{{{OPF}}}manifest/{{{OPF}}}item"):
                manifest[item.get("id", "")] = (item.get("href", ""), item.get("media-type", ""))
            result["manifest_images"] = sum(1 for _, media in manifest.values() if media.startswith("image/"))
            result["spine_items"] = 0 if spine is None else len(spine.findall(f"{{{OPF}}}itemref"))

            alt_values: list[str | None] = []
            root_languages: set[str] = set()
            xhtml_files = 0
            for href, media in manifest.values():
                if media != "application/xhtml+xml":
                    continue
                xhtml_files += 1
                member = str((opf_dir / href).as_posix())
                try:
                    doc = ET.fromstring(zf.read(member))
                except (KeyError, ET.ParseError) as exc:
                    result["errors"].append(f"invalid XHTML {member}: {exc}")
                    continue
                root_lang = doc.get("lang") or doc.get(f"{{{XML}}}lang")
                if root_lang:
                    root_languages.add(root_lang)
                for image in doc.findall(f".//{{{XHTML}}}img"):
                    alt_values.append(image.get("alt"))

            cleaned = [html.unescape(value).strip() for value in alt_values if value is not None]
            result["xhtml_files"] = xhtml_files
            result["root_languages"] = sorted(root_languages)
            result["html_images"] = len(alt_values)
            result["alt_missing"] = sum(value is None for value in alt_values)
            result["alt_empty"] = sum(value == "" for value in cleaned)
            result["alt_over_140"] = sum(len(value) > 140 for value in cleaned)
            result["alt_max_length"] = max((len(value) for value in cleaned), default=0)
            if result["alt_missing"]:
                result["errors"].append(f"{result['alt_missing']} images have no alt attribute")
            if result["alt_empty"]:
                result["warnings"].append(
                    f"{result['alt_empty']} images have empty alt text; confirm they are decorative"
                )
            if result["alt_over_140"]:
                result["warnings"].append(
                    f"{result['alt_over_140']} alt descriptions exceed 140 characters"
                )
    except zipfile.BadZipFile as exc:
        result["errors"].append(f"invalid EPUB ZIP: {exc}")
    return result


def inspect_cover(path: Path | None) -> dict | None:
    if path is None:
        return None
    result: dict = {"path": str(path), "errors": [], "warnings": []}
    if not path.is_file():
        result["errors"].append("cover file does not exist")
        return result
    try:
        with Image.open(path) as image:
            result.update(
                {
                    "format": image.format,
                    "width": image.width,
                    "height": image.height,
                    "mode": image.mode,
                    "size_bytes": path.stat().st_size,
                    "aspect_height_width": round(image.height / image.width, 4),
                }
            )
            if image.format not in {"JPEG", "TIFF"}:
                result["errors"].append(f"unsupported eBook cover format: {image.format}")
            if image.width < 625 or image.height < 1000:
                result["errors"].append("cover is below 625 x 1000 pixels")
            if image.mode not in {"RGB", "L"}:
                result["warnings"].append(f"cover color mode is {image.mode}; verify RGB output")
            if not 1.55 <= image.height / image.width <= 1.65:
                result["warnings"].append("cover aspect ratio differs from the usual 1.6:1 target")
            if path.stat().st_size >= 50 * 1024 * 1024:
                result["errors"].append("cover is 50 MB or larger")
    except Exception as exc:  # Pillow reports several file-specific exception types.
        result["errors"].append(f"cover could not be inspected: {exc}")
    return result


def apply_expectations(data: dict, args: argparse.Namespace) -> None:
    epub = data["epub"]
    checks = [
        ("title", args.expected_title, "title"),
        ("author", args.expected_author, "author"),
        ("language", args.expected_language, "language"),
    ]
    for key, expected, label in checks:
        if expected is not None and epub.get(key) != expected:
            epub["errors"].append(
                f"{label} mismatch: EPUB={epub.get(key, '')!r}, expected={expected!r}"
            )


def markdown(data: dict) -> str:
    epub = data["epub"]
    lines = [
        "# KDP preflight report",
        "",
        "## EPUB",
        "",
        f"- File: `{epub['path']}`",
        f"- Title: `{epub.get('title', '')}`",
        f"- Author: `{epub.get('author', '')}`",
        f"- Language: `{epub.get('language', '')}`",
        f"- Layout: `{epub.get('layout', '')}`",
        f"- Reading direction: `{epub.get('page_progression_direction', '')}`",
        f"- Spine pages: {epub.get('spine_items', 0)}",
        f"- HTML images: {epub.get('html_images', 0)}",
        f"- Missing alt: {epub.get('alt_missing', 0)}",
        f"- Empty alt: {epub.get('alt_empty', 0)}",
        f"- Alt over 140 characters: {epub.get('alt_over_140', 0)}",
    ]
    cover = data.get("cover")
    if cover:
        lines.extend(
            [
                "",
                "## Cover",
                "",
                f"- File: `{cover['path']}`",
                f"- Format: `{cover.get('format', '')}`",
                f"- Dimensions: {cover.get('width', 0)} x {cover.get('height', 0)}",
                f"- Color mode: `{cover.get('mode', '')}`",
                f"- Size: {cover.get('size_bytes', 0)} bytes",
            ]
        )
    errors = epub.get("errors", []) + ([] if not cover else cover.get("errors", []))
    warnings = epub.get("warnings", []) + ([] if not cover else cover.get("warnings", []))
    lines.extend(["", "## Result", "", f"- Errors: {len(errors)}", f"- Warnings: {len(warnings)}"])
    lines.extend(f"- ERROR: {value}" for value in errors)
    lines.extend(f"- WARNING: {value}" for value in warnings)
    return "\n".join(lines) + "\n"


def main() -> int:
    args = parser().parse_args()
    data = {"epub": inspect_epub(args.epub), "cover": inspect_cover(args.cover)}
    apply_expectations(data, args)
    if args.as_json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print(markdown(data), end="")
    errors = data["epub"].get("errors", [])
    if data.get("cover"):
        errors += data["cover"].get("errors", [])
    return 2 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
