#!/usr/bin/env python3
"""Rebuild dist/xin-html-ppt-skill.zip from the repository root.

The archive contains exactly the files an AI tool needs in its skills
directory: the skill itself plus the MIT license. It mirrors what
bin/cli.js installs, so downloading the zip and running the installer
produce the same result. Screenshots and project docs live on GitHub
only; they are not part of the downloadable skill package.
"""

from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
PREFIX = "xin-html-ppt"
OUT = ROOT / "dist" / "xin-html-ppt-skill.zip"

# Keep in sync with the skill files copied by bin/cli.js.
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
