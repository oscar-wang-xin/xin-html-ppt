#!/usr/bin/env python3
"""Rebuild dist/xin-html-ppt-skill.zip from the repository root.

The archive contains only what a skills directory needs, plus the MIT
license, both READMEs and the screenshots those READMEs reference. It is
intentionally committed so people can download a ready-to-use package
straight from the repository.
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
    "README.en.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "examples/outline.md",
]


def main() -> None:
    include = list(INCLUDE)
    shots = ROOT / "docs" / "images"
    if shots.is_dir():
        include += [p.relative_to(ROOT).as_posix()
                    for p in sorted(shots.glob("*.png"))]

    missing = [rel for rel in include if not (ROOT / rel).is_file()]
    if missing:
        raise SystemExit("Missing required files: " + ", ".join(missing))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as archive:
        for rel in include:
            archive.write(ROOT / rel, f"{PREFIX}/{rel}")

    print(f"Wrote {OUT.relative_to(ROOT).as_posix()} "
          f"({OUT.stat().st_size} bytes, {len(include)} files)")


if __name__ == "__main__":
    main()
