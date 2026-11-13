# Contributing

Thanks for taking the time. A few house rules keep this repo small and the skill reliable.

## Before you open a PR

1. Keep the YAML frontmatter in `SKILL.md` valid (`name`, `description`). Agents use it to decide when to load the skill.
2. Run the pre-delivery check on a generated deck: `python scripts/check_deck.py <deck.html>`. All checks must pass.
3. Run `npm pack --dry-run` and `node bin/cli.js --help` if you touched `package.json` or `bin/cli.js`.
4. If you changed what goes into the downloadable archive, run `python tools/build_dist.py` and commit the regenerated zip.

## Hard constraints

- **Generated decks must stay self-contained.** No CDN, no remote fonts/scripts/images. Images must be base64 or shipped next to the HTML.
- **Do not remove or rename any of the nine control-bar hooks.** The checker looks for them.
- **The CLI stays dependency-free.** Node built-ins only, Node >= 16, Windows / macOS / Linux.
- **Third-party skills are optional.** Never bundle or copy someone else's skill into this repo. Credit the original authors and link to their repositories.
- **No personal data, local paths or private notes** in committed files. `.gitignore` blocks the usual suspects; check before you `git add`.

## Commit style

Conventional commits, lowercase: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`. Keep the subject under 72 characters.

## License

By contributing you agree that your contributions are licensed under the MIT License in [LICENSE](LICENSE).
