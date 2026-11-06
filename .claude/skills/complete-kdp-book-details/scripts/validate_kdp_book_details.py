#!/usr/bin/env python3
"""Validate the required structure of a completed KDP_BOOK_DETAILS.md."""

from __future__ import annotations

import re
import sys
from pathlib import Path


REQUIRED_LABELS = [
    "- 表示：",
    "- フリガナ：",
    "- ローマ字：",
    "- 著者表示：",
    "- 著者フリガナ：",
    "- 著者ローマ字：",
    "- レーベル表示：",
    "- レーベルフリガナ：",
    "- レーベルローマ字：",
    "- AI生成テキスト：",
    "- AI生成画像：",
    "- AI生成翻訳：",
    "- 本文EPUB：",
    "- 表紙JPEG：",
    "- 希望小売価格：",
    "- KDP Select：",
]

PLACEHOLDERS = ("TODO", "TBD", "○○", "{{", "}}", "未入力", "要確認")


def value_after(line: str) -> str:
    return line.split("：", 1)[1].strip() if "：" in line else ""


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: validate_kdp_book_details.py KDP_BOOK_DETAILS.md")
        return 2

    path = Path(sys.argv[1])
    if not path.is_file():
        print(f"ERROR: file not found: {path}")
        return 2

    text = path.read_text(encoding="utf-8")
    errors: list[str] = []

    for label in REQUIRED_LABELS:
        matches = [line for line in text.splitlines() if line.startswith(label)]
        if not matches:
            errors.append(f"missing field: {label}")
        elif any(not value_after(line) for line in matches):
            errors.append(f"empty field: {label}")

    title_block = re.search(r"## 2\. タイトル\s+(.*?)(?=\n## )", text, re.S)
    subtitle_block = re.search(r"## 3\. サブタイトル\s+(.*?)(?=\n## )", text, re.S)
    for name, block in (("title", title_block), ("subtitle", subtitle_block)):
        if not block:
            errors.append(f"missing section: {name}")
            continue
        for label in ("表示", "フリガナ", "ローマ字"):
            match = re.search(rf"^- {label}：(.*)$", block.group(1), re.M)
            if not match or not match.group(1).strip():
                errors.append(f"{name} missing {label}")

    description = re.search(
        r"## 6\. 内容紹介（日本語・貼り付け用）\s+(.*?)(?=\n## )", text, re.S
    )
    if not description or len(description.group(1).strip()) < 120:
        errors.append("Japanese description must contain at least 120 characters")

    keyword_block = re.search(r"## 8\. 検索キーワード（7枠）\s+(.*?)(?=\n## )", text, re.S)
    if keyword_block:
        entries = re.findall(r"^([1-7])\.\s+(.+?)\s*$", keyword_block.group(1), re.M)
        numbers = [int(number) for number, _ in entries]
        keywords = [value.strip() for _, value in entries]
        if numbers != list(range(1, 8)):
            errors.append("keywords must be numbered exactly 1 through 7")
        if len(set(word.casefold() for word in keywords)) != 7:
            errors.append("keyword boxes must be distinct")
    else:
        errors.append("missing seven-keyword section")

    if any(token in text for token in PLACEHOLDERS):
        errors.append("placeholder text remains")

    unchecked = re.findall(r"^- \[ \]", text, re.M)
    if unchecked:
        errors.append(f"{len(unchecked)} final checklist item(s) remain unchecked")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(f"OK: {path.name} contains complete metadata and seven keyword boxes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
