#!/usr/bin/env python3
"""Parse official Unicode emoji-test.txt; preserve complete sequences."""
import argparse, json, re
from pathlib import Path

def build(source):
    group = subgroup = version = ""
    entries = []
    for line in source.splitlines():
        if line.startswith("# Version:"): version = line.split(":", 1)[1].strip()
        elif line.startswith("# group:"): group = line.split(":", 1)[1].strip()
        elif line.startswith("# subgroup:"): subgroup = line.split(":", 1)[1].strip()
        elif "; fully-qualified" in line:
            codes, rest = line.split(";", 1)
            comment = rest.split("#", 1)[1].strip()
            match = re.match(r"\S+\s+E([\d.]+)\s+(.+)", comment)
            if not match: raise ValueError("Malformed qualified entry")
            points = codes.split()
            entries.append(dict(sequence="".join(chr(int(p,16)) for p in points), codepoints=points, name=match[2], emoji_version=match[1], group=group, subgroup=subgroup))
    if not version or not entries: raise ValueError("Missing Unicode version or emoji entries")
    return dict(version=version, source="https://www.unicode.org/Public/emoji/latest/emoji-test.txt", copyright=next((line[2:] for line in source.splitlines() if line.startswith("# ©")), "Unicode, Inc."), license="https://www.unicode.org/terms_of_use.html", fully_qualified_count=len(entries), entries=entries)

if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("input",type=Path); parser.add_argument("output",type=Path)
    args=parser.parse_args()
    result=build(args.input.read_text(encoding="utf-8"))
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Unicode {result['version']}: {result['fully_qualified_count']} complete sequences")
