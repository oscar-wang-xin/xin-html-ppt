#!/usr/bin/env node
'use strict';

/*
 * xin-html-ppt installer
 *
 * Zero runtime dependencies. Copies the skill files into the skills directory
 * of WorkBuddy / GitHub Copilot / Claude Code, or into a custom
 * target directory.
 *
 * Runs identically from an installed npm package (npx xin-html-ppt), from a
 * GitHub git dependency (npx --yes github:owner/repo) and from a cloned repo
 * (node bin/cli.js).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_ROOT = path.resolve(__dirname, '..');
const SKILL_NAME = 'xin-html-ppt';
const SKILL_ENTRIES = ['SKILL.md', 'assets', 'references', 'scripts'];
const SKIP_NAMES = new Set(['__pycache__', '.DS_Store', 'Thumbs.db']);

const HOME = os.homedir();
const TOOLS = [
  {
    id: 'workbuddy',
    label: 'WorkBuddy',
    home: path.join(HOME, '.workbuddy'),
    skills: path.join(HOME, '.workbuddy', 'skills')
  },
  {
    id: 'copilot',
    label: 'GitHub Copilot',
    home: path.join(HOME, '.copilot'),
    skills: path.join(HOME, '.copilot', 'skills')
  },
  {
    id: 'claude',
    label: 'Claude Code',
    home: path.join(HOME, '.claude'),
    skills: path.join(HOME, '.claude', 'skills')
  }
];

let VERSION = '1.0.0';
try {
  VERSION = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')).version || VERSION;
} catch (e) {
  /* version is cosmetic; keep the fallback */
}

const HELP = [
  'xin-html-ppt ' + VERSION + ' - install an Agent Skill into your AI tool',
  '',
  'Usage:',
  '  npx --yes xin-html-ppt [options]',
  '  npx --yes github:oscar-wang-xin/xin-html-ppt [options]',
  '  node bin/cli.js [options]                  (from a cloned repo)',
  '',
  'Options:',
  '  --target <dir>   Install into <dir>/xin-html-ppt (custom skills root)',
    '--tool <id>      Only for: workbuddy, copilot, claude (comma-separated)',
  '  --all            Install for every supported tool, creating dirs if needed',
  '  --force          Replace an existing installation',
  '  --dry-run        Show what would happen without writing anything',
  '  --list           Show detected tools and installation status',
  '  --uninstall      Remove the installed skill',
  '  -h, --help       Show this help',
  '  -v, --version    Show version',
  '',
  'Skills roots:',
  '  WorkBuddy       ~/.workbuddy/skills',
  '  GitHub Copilot  ~/.copilot/skills',
  '  Claude Code     ~/.claude/skills',
  '',
  'With no options the installer targets every AI tool it detects, and falls',
  'back to WorkBuddy when none is found. Existing installs are never',
  'overwritten unless --force is given.',
  '',
  'Examples:',
  '  npx --yes github:oscar-wang-xin/xin-html-ppt',
  '  npx --yes github:oscar-wang-xin/xin-html-ppt --tool workbuddy',
  '  npx --yes xin-html-ppt --tool copilot',
  '  npx --yes xin-html-ppt --tool claude',
  '  node bin/cli.js --target ~/my-agent/skills --force',
  '',
  'After installing, restart your AI tool if it caches skills, then just say:',
  '  "Turn this outline into a PPT" / "把这份大纲做成 PPT"',
  ''
].join('\n');

function parseArgs(argv) {
  const opts = {
    target: null,
    tools: [],
    all: false,
    force: false,
    dryRun: false,
    uninstall: false,
    list: false,
    help: false,
    version: false,
    unknown: []
  };

  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--') && !raw.startsWith('-')) {
      opts.unknown.push(raw);
      continue;
    }
    let key = raw.replace(/^-+/, '');
    let val = null;
    const eq = key.indexOf('=');
    if (eq > -1) {
      val = key.slice(eq + 1);
      key = key.slice(0, eq);
    }
    const needValue = () => {
      if (val !== null) return val;
      const next = argv[++i];
      if (next === undefined || next.startsWith('-')) {
        throw new Error('Option --' + key + ' needs a value.');
      }
      return next;
    };

    switch (key) {
      case 'target': case 't':
        opts.target = needValue();
        break;
      case 'tool':
        opts.tools = String(needValue()).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        break;
      case 'all': opts.all = true; break;
      case 'force': case 'f': opts.force = true; break;
      case 'dry-run': opts.dryRun = true; break;
      case 'uninstall': opts.uninstall = true; break;
      case 'list': opts.list = true; break;
      case 'help': case 'h': opts.help = true; break;
      case 'version': case 'v': opts.version = true; break;
      default:
        opts.unknown.push(raw);
    }
  }
  return opts;
}

function resolveTargets(opts) {
  if (opts.target) {
    return [{ id: 'custom', label: 'custom target', skills: path.resolve(opts.target) }];
  }
  if (opts.all) return TOOLS.slice();
  if (opts.tools.length) {
    return opts.tools.map(id => {
      const found = TOOLS.find(t => t.id === id);
      if (!found) {
        throw new Error('Unknown tool "' + id + '". Available: ' + TOOLS.map(t => t.id).join(', '));
      }
      return found;
    });
  }
  const detected = TOOLS.filter(t => fs.existsSync(t.home));
  return detected.length ? detected : [TOOLS[0]];
}

function copyEntry(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      if (SKIP_NAMES.has(name) || name.endsWith('.pyc')) continue;
      copyEntry(path.join(src, name), path.join(dst, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

function assertSafeDest(dest) {
  if (path.basename(dest) !== SKILL_NAME) {
    throw new Error('Refusing to touch an unexpected path: ' + dest);
  }
}

function printList() {
  console.log('Supported AI tools (home: ' + HOME + '):');
  for (const t of TOOLS) {
    const detected = fs.existsSync(t.home);
    const installed = fs.existsSync(path.join(t.skills, SKILL_NAME));
    const state = installed ? 'installed' : (detected ? 'detected, not installed' : 'not detected');
    console.log('  ' + t.id.padEnd(10) + ' ' + state.padEnd(24) + t.skills);
  }
}

function installTo(tool, opts) {
  const dest = path.join(tool.skills, SKILL_NAME);
  assertSafeDest(dest);
  const exists = fs.existsSync(dest);

  if (exists && !opts.force) {
    console.log('[skip] ' + tool.label + ': already installed -> ' + dest);
    console.log('       Use --force to replace it.');
    return 'skipped';
  }
  if (opts.dryRun) {
    console.log('[dry]  ' + tool.label + ': would install -> ' + dest + (exists ? ' (replace)' : ''));
    return 'dry';
  }

  // 逐文件覆盖，不整目录删除：技能目录里可能有用户自己的笔记或旧版文件
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of SKILL_ENTRIES) {
    const src = path.join(PKG_ROOT, entry);
    if (!fs.existsSync(src)) {
      throw new Error('Package is missing a required skill entry: ' + entry);
    }
    copyEntry(src, path.join(dest, entry));
  }

  // MIT requires the copyright + permission notice to travel with copies.
  const license = path.join(PKG_ROOT, 'LICENSE');
  if (fs.existsSync(license)) fs.copyFileSync(license, path.join(dest, 'LICENSE'));

  console.log('[ok]   ' + tool.label + ' -> ' + dest +
              (exists ? ' (覆盖文件，目录内其他文件保留)' : ''));
  return 'installed';
}

function uninstallFrom(tool, opts) {
  const dest = path.join(tool.skills, SKILL_NAME);
  assertSafeDest(dest);
  if (!fs.existsSync(dest)) {
    console.log('[skip] ' + tool.label + ': not installed -> ' + dest);
    return;
  }
  if (opts.dryRun) {
    console.log('[dry]  ' + tool.label + ': would remove -> ' + dest);
    return;
  }
  fs.rmSync(dest, { recursive: true, force: true });
  console.log('[ok]   removed ' + dest);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.version) {
    console.log(SKILL_NAME + ' ' + VERSION);
    return;
  }
  if (opts.help) {
    console.log(HELP);
    return;
  }
  if (opts.unknown.length) {
    throw new Error('Unknown argument(s): ' + opts.unknown.join(' ') + '\nRun with --help for usage.');
  }
  if (!fs.existsSync(path.join(PKG_ROOT, 'SKILL.md'))) {
    throw new Error('SKILL.md was not found next to package.json. Run this installer from the npm package or the repository root.');
  }

  if (opts.list) {
    printList();
    return;
  }

  const targets = resolveTargets(opts);
  const results = [];

  if (opts.uninstall) {
    for (const t of targets) uninstallFrom(t, opts);
    return;
  }

  for (const t of targets) results.push(installTo(t, opts));

  if (!opts.dryRun && results.indexOf('installed') > -1) {
    console.log('');
    console.log('Done. Only skill files were copied (SKILL.md, assets/, references/, scripts/, LICENSE).');
    console.log('Restart your AI tool if it caches skills, then give it an outline and ask for a PPT.');
  }
}

try {
  main();
} catch (err) {
  console.error('[error] ' + err.message);
  process.exit(1);
}
