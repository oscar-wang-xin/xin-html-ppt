# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

## [1.0.2] - 2026-11-13

### Added

- `bin/cli.js` now supports GitHub Copilot as an install target (`~/.copilot/skills`). `--tool copilot`, `--list` and `--all` all recognise it; auto-detection covers WorkBuddy, GitHub Copilot and Claude Code.
- Both READMEs were rewritten for people who make presentations regularly: a plain-language three-step guide, a Copilot install section (personal `~/.copilot/skills/` and project `.github/skills/`, per the VS Code Agent Skills docs), and real screenshots. All technical detail moved into a collapsible "Advanced" section.
- `docs/images/`: 10 figures captured from the real sample deck — cover, charts, timeline, architecture, contents panel, speaker notes, countdown, dark theme, a 2x2 overview and an outline-to-deck case figure.
- `tools/build_dist.py` now ships the screenshots and supporting docs in `dist/*.zip`, so README images and links stay valid after extraction.

### Changed

- `examples/outline.md` now lists the same 10 slides as the sample deck shown in the screenshots.
- `.gitignore` explicitly allows `docs/images/*.png`.
- Version bumped to 1.0.2 in `package.json`.

## [1.0.1] - 2026-11-13

### Fixed

- Kept Python 3 as the primary runtime and added zero-dependency Node twins `scripts/new_deck.js` / `scripts/check_deck.js` as the no-Python fallback. Both were verified item-by-item equivalent on a real deck (23/23 PASS, identical details).
- `SKILL.md` now probes Python first, falls back to Node, and — when neither runtime is present — tells the agent to ask the user to install Python 3 or Node.js >= 16 instead of improvising.
- `references/visuals.md` base64 embedding now shows the Python path first with a Node fallback; third-party Python scripts are marked as optional enhancements.
- `check_deck.py` now reports the real on-disk file size instead of a newline-normalised byte count.

### Added

- `Runtime requirements` sections in both READMEs documenting the primary / fallback / install-needed rules.

## [1.0.0] - 2026-11-13

### Added

- Initial open-source release under the MIT License.
- Agent Skill (`SKILL.md`) that turns an outline or a content file into a single-file HTML presentation.
- `assets/deck-template.html`: zero-dependency 16:9 template with six themes, inline SVG charts and print styles.
- Nine control-bar functions: previous/next, table of contents, speaker notes, live clock, countdown timer, fullscreen, export, print, hide-the-toolbar.
- `scripts/new_deck.py` (naming + no-overwrite) and `scripts/check_deck.py` (23-point pre-delivery check).
- `references/`: layout snippets, theme variables, chart and visual-enhancement specs.
- `bin/cli.js`: zero-dependency npx installer for WorkBuddy / Claude Code, with `--target`, `--tool`, `--all`, `--force`, `--dry-run`, `--list`, `--uninstall`.
- `tools/build_dist.py` and `dist/xin-html-ppt-skill.zip` for direct archive downloads.
- English and Simplified Chinese READMEs, `.gitignore`, `.gitattributes`, `CONTRIBUTING.md`.

[1.0.0]: https://github.com/oscar-wang-xin/xin-html-ppt/releases/tag/v1.0.0
