# xin-html-ppt

Turn a plain outline into a **single-file, offline HTML presentation** — and install the skill into your AI agent with one command.

**MIT** · **Node.js >= 16** · **zero runtime dependencies** · **generated decks have zero network references**

[简体中文文档](README.zh-CN.md) · [Issues](https://github.com/oscar-wang-xin/xin-html-ppt/issues)

---

## What this actually is

This is not a JavaScript library you `import`. It is an **Agent Skill**: a `SKILL.md` instruction file, an HTML template, three reference documents and helper scripts (Node + Python twins). An AI coding assistant reads those files and does the work when you ask for a PPT in natural language.

The `bin/cli.js` installer is the only executable part. It copies the skill into your tool's skills directory. It has no dependencies, no build step and does not phone home.

## Runtime requirements

| Situation | What you need |
| --- | --- |
| Install with `npx` | Node.js >= 16 (npx is a Node command). |
| Install by downloading a zip | Nothing. Just copy a folder. |
| Open / present a generated deck | Any modern browser. No Node, no Python, no network. |
| Run the helper scripts | **Python 3 (primary)**; Node.js >= 16 as an equivalent fallback when Python is missing. |
| Neither runtime present | The agent asks the user to install Python 3 or Node.js >= 16, then continues. It installs nothing by itself. |
| Rebuild `dist/*.zip` as a maintainer | Python 3 for `tools/build_dist.py`. End users never need it. |

**Python 3 is the primary path; the `.js` scripts are the no-Python fallback.** Both twins are kept in sync and produce identical results. Agent tools such as WorkBuddy or Copilot normally ship both runtimes; if neither is present, `SKILL.md` tells the agent to ask the user to install one instead of improvising.

The generated HTML is fully self-contained — no CDN, no web fonts, no remote scripts. Optional third-party visual skills ship their own Python scripts; if those are unavailable, the skill falls back to built-in themes and inline SVG.

## Get it

### Option 1 — npx (one line)

```bash
# Straight from GitHub. Works as soon as this repo is pushed; no npm publish needed.
# Requires git on your PATH.
npx --yes github:oscar-wang-xin/xin-html-ppt

# Short form, once the package is on npm:
npx --yes xin-html-ppt
```

`--yes` skips npx's "Ok to proceed?" prompt, which otherwise blocks non-interactive shells.

The installer auto-detects `~/.workbuddy/skills` and `~/.claude/skills` and installs into every one it finds. If it finds none, it creates the WorkBuddy path. It never overwrites an existing install unless you pass `--force`.

```bash
npx --yes xin-html-ppt --list                    # what is detected / installed
npx --yes xin-html-ppt --tool claude             # only Claude Code
npx --yes xin-html-ppt --target ~/my-agent/skills
npx --yes xin-html-ppt --force                   # replace an existing install
npx --yes xin-html-ppt --uninstall
```

| Flag | What it does |
| --- | --- |
| `--target <dir>` | Install into `<dir>/xin-html-ppt`. Overrides auto-detection. |
| `--tool <id>` | `workbuddy`, `claude`, or a comma-separated list. |
| `--all` | Install for every supported tool, creating directories if needed. |
| `--force` | Replace an existing installation. |
| `--dry-run` | Print planned actions without writing anything. |
| `--list` | Show detected tools and install status. |
| `--uninstall` | Remove the installed skill. |
| `-h`, `--help` / `-v`, `--version` | Help / version. |

### Option 2 — download a zip

Two zips, both usable immediately:

- **[`dist/xin-html-ppt-skill.zip`](dist/xin-html-ppt-skill.zip)** — the easy one. A clean, skill-only archive with `LICENSE` and both READMEs, no dev files. Extracting it produces a folder already named `xin-html-ppt`.
- **GitHub → Code → Download ZIP** — the repository root *is* the skill root (`SKILL.md` sits at the top level), so the source is usable too. GitHub names the extracted folder `xin-html-ppt-main`; **rename it to `xin-html-ppt`** before dropping it into a skills directory.

Drop the folder into `~/.workbuddy/skills/` (or `~/.claude/skills/`). The folder name must match the `name` field in `SKILL.md`.

### Option 3 — clone (for development)

```bash
git clone https://github.com/oscar-wang-xin/xin-html-ppt.git
cd xin-html-ppt
node bin/cli.js --target ~/.workbuddy/skills
```

## Use it

Restart your AI tool if it caches skills, then just talk to it:

> Turn this outline into a PPT. / 把这份大纲做成 PPT
> Make it 10 pages, blue-violet, with a bar chart on the data page.

Inputs can be pasted text, Markdown, txt, docx, pdf or xlsx. Output is one `.html` file: your chosen name, or `html-ppt-<topic>.html`. Existing files are never overwritten (`-2`, `-3` are appended).

The helper scripts also work standalone. Python 3 is primary; when it is missing, the Node twins take the same arguments and produce identical output.

```bash
python scripts/new_deck.py --out . --title "2026 Product Roadmap"
python scripts/check_deck.py html-ppt-2026产品路线图.html

# No Python? Equivalent Node fallback
node scripts/new_deck.js --out . --title "2026 Product Roadmap"
node scripts/check_deck.js html-ppt-2026产品路线图.html
```

## What the deck includes

- **Nine control-bar functions**: previous/next, clickable table of contents, speaker notes, live clock, countdown timer (5–45 min presets, start/pause/reset, end alert), fullscreen, export (single HTML / Markdown outline / PDF via print), print, hide-the-toolbar toggle.
- Six themes, default `aurora` (light blue-violet). Keyboard shortcuts, progress bar, URL hash deep links, `@media print` with one slide per page.
- Inline SVG bar / line / donut charts driven by a small JSON block inside the HTML.
- A 16:9 stage that scales to any window.
- **Offline by design.** CSS, JS, SVG and font fallbacks are all inline; images must be base64 or shipped next to the HTML. No CDN, no web fonts, no remote scripts. That is also why export via `outerHTML` keeps working.

## Repository layout

```
.
├── SKILL.md                      # skill entry point (frontmatter + workflow)
├── assets/deck-template.html     # zero-dependency 10-slide template
├── references/                   # layout snippets, themes, chart/visual spec
├── scripts/                      # new_deck.js/.py, check_deck.js/.py
├── bin/cli.js                    # zero-dependency npx installer
├── tools/build_dist.py           # regenerates the zip (maintainer, Python 3)
├── examples/outline.md           # sample outline (placeholder numbers)
├── dist/xin-html-ppt-skill.zip   # ready-to-download skill archive
├── package.json                  # npm metadata + bin
├── LICENSE / README.md / README.zh-CN.md / CONTRIBUTING.md / CHANGELOG.md
└── .gitignore / .gitattributes
```

Files copied into an AI tool: `SKILL.md`, `assets/`, `references/`, `scripts/` and `LICENSE`. Nothing else.

## Development

```bash
npm test                                  # CLI help smoke test
npm pack --dry-run                        # inspect exactly what npm would publish
node bin/cli.js --target /tmp/skills --dry-run
python scripts/check_deck.py <deck.html>  # 23-point pre-delivery check (primary)
node scripts/check_deck.js <deck.html>    # identical fallback when Python is absent
python tools/build_dist.py                # rebuild dist zip (maintainer only, Python 3)
```

`check_deck.py` verifies slide structure, all nine control-bar hooks, self-containment and chart data. `check_deck.js` is the equivalent fallback. No test framework, no build step, no lockfile needed.

## Publishing (maintainers)

```bash
git tag v1.0.0
git push origin main --tags
npm publish --access public       # optional: enables the short `npx xin-html-ppt` form
```

Attach `dist/xin-html-ppt-skill.zip` to the GitHub Release so people can download a versioned archive. The `npx --yes github:...` form works without publishing to npm at all.

## Optional visual skills

`ui-ux-pro-max`, `chart-infographic`, `archify` and `image-design-master` are third-party skills created by their own authors. `SKILL.md` treats them as **optional enhancements**: if any is unavailable, the deck falls back to built-in themes and inline SVG. This project does not bundle, copy or redistribute them — please read their original repositories and licences before use.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and PRs welcome; keep the `SKILL.md` frontmatter valid and both `check_deck` twins green.

## License

MIT © 2026 Oscar Wang (王鑫). See [LICENSE](LICENSE).
