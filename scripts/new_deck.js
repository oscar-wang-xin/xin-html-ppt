#!/usr/bin/env node
'use strict';

/*
 * xin-html-ppt / new_deck.js
 *
 * Node-only twin of new_deck.py. Zero dependencies, Node built-ins only.
 * Creates a new deck from assets/deck-template.html: naming, placeholder
 * replacement, no-overwrite.
 *
 * Usage:
 *   node new_deck.js --out "<dir>" --title "<title>" [--subtitle "..."]
 *                    [--name "file.html"] [--template "..."] [--force]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_DIR = path.resolve(__dirname, '..');
const DEFAULT_TEMPLATE = path.join(SKILL_DIR, 'assets', 'deck-template.html');

function expandHome(p) {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(os.homedir(), p.slice(2));
  return p;
}

// Kept byte-for-byte equivalent to slug() in new_deck.py.
function slug(title) {
  const s = String(title).trim()
    .replace(/\.(md|txt|docx?|pdf|xlsx?|pptx?|html?)$/i, '')
    .replace(/[《》「」『』“”‘’\[\]（）()]/g, '')
    .replace(/[\\/:*?"<>|\r\n\t,，。；;：:!！?？、]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s ? Array.from(s).slice(0, 12).join('') : '演示文稿';
}

function pickPath(outDir, name, force) {
  const first = path.join(outDir, name);
  if (force || !fs.existsSync(first)) return first;
  const ext = path.extname(name);
  const stem = name.slice(0, name.length - ext.length);
  let i = 2;
  while (fs.existsSync(path.join(outDir, `${stem}-${i}${ext}`))) i++;
  return path.join(outDir, `${stem}-${i}${ext}`);
}

function parseArgs(argv) {
  const opts = {
    out: null, title: null, subtitle: '', name: null,
    template: null, force: false, unknown: []
  };
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--')) { opts.unknown.push(raw); continue; }
    let key = raw.slice(2);
    let val = null;
    const eq = key.indexOf('=');
    if (eq > -1) { val = key.slice(eq + 1); key = key.slice(0, eq); }
    const needValue = () => {
      if (val !== null) return val;
      const next = argv[++i];
      if (next === undefined || next.startsWith('--')) {
        throw new Error('Option --' + key + ' needs a value.');
      }
      return next;
    };
    switch (key) {
      case 'out': opts.out = needValue(); break;
      case 'title': opts.title = needValue(); break;
      case 'subtitle': opts.subtitle = needValue(); break;
      case 'name': opts.name = needValue(); break;
      case 'template': opts.template = needValue(); break;
      case 'force': opts.force = true; break;
      default: opts.unknown.push(raw);
    }
  }
  if (opts.unknown.length) {
    throw new Error('Unknown argument(s): ' + opts.unknown.join(' '));
  }
  if (!opts.out || !opts.title) {
    throw new Error('Both --out and --title are required.');
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(expandHome(opts.out));
  fs.mkdirSync(outDir, { recursive: true });

  let name = opts.name || ('html-ppt-' + slug(opts.title) + '.html');
  if (!/\.(html|htm)$/i.test(name)) name += '.html';

  const template = path.resolve(expandHome(opts.template || DEFAULT_TEMPLATE));
  if (!fs.existsSync(template) || !fs.statSync(template).isFile()) {
    console.error('ERROR: 模板不存在 -> ' + template);
    process.exit(2);
  }

  const target = pickPath(outDir, name, opts.force);
  // Function replacements prevent "$&" in a user title being treated as a pattern.
  const html = fs.readFileSync(template, 'utf8')
    .replace(/\{\{DECK_TITLE\}\}/g, () => opts.title)
    .replace(/\{\{DECK_SUBTITLE\}\}/g, () => opts.subtitle);
  fs.writeFileSync(target, html, 'utf8');

  console.log(JSON.stringify({
    ok: true,
    path: target,
    filename: path.basename(target),
    title: opts.title,
    named_by: opts.name ? 'user' : 'default',
    template: template,
    bytes: fs.statSync(target).size
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error('[error] ' + err.message);
  process.exit(1);
}
