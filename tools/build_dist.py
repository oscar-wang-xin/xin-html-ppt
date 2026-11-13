#!/usr/bin/env python3
"""Rebuild dist/xin-html-ppt-skill.zip from the repository root.

The archive contains only what a skills directory needs, plus the MIT
license and both READMEs. It is intentionally committed so people can
download a ready-to-use package straight from the repository.
"""

from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
PREFIX = "xin-html-ppt"
OUT = ROOT / "dist" / "xin-html-ppt-skill.zip"

INCLUDE = [
    "SKILL.md",
    "assets/deck-template.html",
    "references/deck-spec.md",
    "references/styles.md",
    "references/visuals.md",
    "scripts/new_deck.js",
    "scripts/check_deck.js",
    "scripts/new_deck.py",
    "scripts/check_deck.py",
    "LICENSE",
    "README.md",
    "README.zh-CN.md",
]


def main() -> None:
    missing = [rel for rel in INCLUDE if not (ROOT / rel).is_file()]
    if missing:
        raise SystemExit("Missing required files: " + ", ".join(missing))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as archive:
        for rel in INCLUDE:
            archive.write(ROOT / rel, f"{PREFIX}/{rel}")

    print(f"Wrote {OUT.relative_to(ROOT).as_posix()} "
          f"({OUT.stat().st_size} bytes, {len(INCLUDE)} files)")


if __name__ == "__main__":
    main()
