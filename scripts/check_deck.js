#!/usr/bin/env node
'use strict';

/*
 * xin-html-ppt / check_deck.js
 *
 * Node-only twin of check_deck.py. Zero dependencies, Node built-ins only.
 * Pre-delivery check: nine control-bar functions, slide structure,
 * self-containment, print styles and chart data. All PASS is required.
 *
 * Usage:
 *   node check_deck.js "<deck.html>" [--json]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CORE_HOOKS = [
  ['prev', '上一页'], ['next', '下一页'], ['toc', '目录'],
  ['notes', '演讲者备注'], ['clock', '时间'], ['timer', '倒计时'],
  ['fullscreen', '全屏'], ['export', '导出'], ['print', '打印'],
  ['hide', '隐藏控制栏']
];
const EXTRA_HOOKS = [
  ['pager', '页码'], ['progress', '进度条'],
  ['theme', '主题切换'], ['help', '快捷键说明']
];
const PANEL_HOOKS = ['toc-panel', 'notes-panel', 'timer-panel', 'export-menu', 'help-panel'];

const EXTERNAL_RE = /(?:src|href)\s*=\s*["']https?:\/\/|@import\s+url\(\s*["']?https?:\/\/|<script[^>]+\bsrc\s*=|<link(?![^>]*href\s*=\s*["']data:)[^>]*\bhref\s*=/gi;
const PLACEHOLDER_RE = /\{\{[A-Z_]+\}\}/g;
const CHART_JSON_RE = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;
const SLIDE_RE = /<section[^>]*class=["'][^"']*\bslide\b[^"']*["'][^>]*>/gi;

function expandHome(p) {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function hasHook(html, key) {
  return new RegExp('data-hook=["\']' + key + '["\']').test(html);
}

function check(filePath) {
  const results = [];
  const add = (item, ok, detail) => results.push({
    item: item, ok: !!ok, detail: detail || '', level: ok ? 'PASS' : 'FAIL'
  });
  const warn = (item, detail) => results.push({
    item: item, ok: true, detail: detail || '', level: 'WARN'
  });

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    add('文件存在', false, filePath);
    return results;
  }

  let html;
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    add('UTF-8 编码', false, '读取失败: ' + err.message);
    return results;
  }
  // Node replaces invalid UTF-8 bytes with U+FFFD instead of throwing.
  if (html.indexOf('\uFFFD') > -1) {
    add('UTF-8 编码', false, '文件不是 UTF-8，浏览器中文会乱码');
    return results;
  }

  const bytes = Buffer.byteLength(html, 'utf8');
  const lower = html.toLowerCase();

  add('文件大小', html.length > 8000, bytes + ' 字节');

  // Strip comments before structural counting; keep the raw HTML for SLIDES markers.
  const content = html.replace(/<!--[\s\S]*?-->/g, '');
  const marker = /<!--\s*SLIDES:START[^>]*-->([\s\S]*?)<!--\s*SLIDES:END/.exec(html);
  const region = marker ? marker[1] : content;

  add('DOCTYPE 与结构', html.trimStart().toLowerCase().startsWith('<!doctype html>'), '');
  add('UTF-8 声明',
      lower.indexOf('charset="utf-8"') > -1 || lower.indexOf('charset=utf-8') > -1, '');

  const leftovers = Array.from(new Set(content.match(PLACEHOLDER_RE) || [])).sort();
  add('占位符已替换', leftovers.length === 0,
      leftovers.length ? '残留: ' + leftovers.join(',') : '');

  const coreMissing = CORE_HOOKS.filter(pair => !hasHook(html, pair[0])).map(pair => pair[1]);
  add('九项操作栏功能', coreMissing.length === 0,
      coreMissing.length ? '缺失: ' + coreMissing.join('、')
                         : '前后页/目录/备注/时间/倒计时/全屏/导出/打印/隐藏 全部在位');

  const extraMissing = EXTRA_HOOKS.filter(pair => !hasHook(html, pair[0])).map(pair => pair[1]);
  add('辅助控制项', extraMissing.length === 0,
      extraMissing.length ? '缺失: ' + extraMissing.join('、') : '');

  const panelMissing = PANEL_HOOKS.filter(key => !hasHook(html, key));
  add('面板容器', panelMissing.length === 0,
      panelMissing.length ? '缺失: ' + panelMissing.join('、') : '');

  const slideTags = region.match(SLIDE_RE) || [];
  add('幻灯片数量', slideTags.length >= 1 && slideTags.length <= 40,
      '共 ' + slideTags.length + ' 页');
  add('页面标记', html.indexOf('SLIDES:START') > -1 && html.indexOf('SLIDES:END') > -1,
      '替换示例内容时不要删掉这两个注释');

  const titled = (region.match(/data-title=/g) || []).length;
  add('目录标题 data-title', titled >= slideTags.length,
      slideTags.length ? titled + '/' + slideTags.length + ' 页有标题' : '');
  const noted = (region.match(/data-notes=/g) || []).length;
  add('演讲备注 data-notes', noted >= slideTags.length,
      slideTags.length ? noted + '/' + slideTags.length + ' 页有备注' : '');
  add('首页激活', /class=["'][^"']*slide[^"']*active/.test(region), '');

  add('等比缩放', html.indexOf('function fit()') > -1 || html.indexOf('function fit (') > -1, '');
  add('内联图表引擎', html.indexOf('renderCharts') > -1, '');
  add('主题系统', html.indexOf('data-theme=') > -1 &&
      (html.match(/html\[data-theme=/g) || []).length >= 2, '');
  add('打印样式', html.indexOf('@media print') > -1 && html.indexOf('page-break-after') > -1, '');
  add('导出 HTML 逻辑', html.indexOf('function exportHTML()') > -1, '');
  add('导出大纲逻辑', html.indexOf('function exportMD()') > -1, '');
  add('键盘导航', html.indexOf('keydown') > -1 && html.indexOf('ArrowRight') > -1, '');
  add('URL 深链', html.indexOf('location.hash') > -1, '');

  const external = content.match(EXTERNAL_RE) || [];
  add('零外部依赖', external.length === 0,
      external.length ? '发现外链 ' + external.length + ' 处，导出 HTML 后会失效' : '');
  add('无 iframe', lower.indexOf('<iframe') === -1, '');

  const blocks = Array.from(content.matchAll(CHART_JSON_RE), m => m[1]);
  const badJson = [];
  blocks.forEach((raw, i) => {
    try {
      const data = JSON.parse(raw.trim());
      const has = key => Object.prototype.hasOwnProperty.call(data, key);
      if (has('values')) {
        if ((data.labels || []).length !== data.values.length) {
          throw new Error('labels/values 不等长');
        }
      } else if (has('series')) {
        const n = (data.labels || []).length;
        if (n <= 0) throw new Error('labels 为空');
        for (const s of data.series) {
          if ((s.values || []).length !== n) throw new Error('series values 与 labels 不等长');
        }
      }
    } catch (err) {
      badJson.push('第' + (i + 1) + '块: ' + err.message);
    }
  });
  add('图表 JSON 合法', badJson.length === 0,
      badJson.length ? badJson.join('；') : blocks.length + ' 个数据块');

  const demoMarks = ['XIN-HTML-PPT · DEMO', '示例演示', 'DEMO DECK'];
  const hit = demoMarks.filter(m => html.indexOf(m) > -1);
  if (hit.length) warn('模板示例残留', '疑似未替换示例内容: ' + hit.join('、'));
  if (/\bTODO\b|占位图片路径|__IMAGE_URI__/.test(html)) {
    warn('未完成标记', '存在 TODO 或图片占位符');
  }
  if (bytes > 4 * 1024 * 1024) warn('文件体积偏大', '超过 4MB，建议压缩 base64 配图');

  return results;
}

function main() {
  const argv = process.argv.slice(2);
  const jsonMode = argv.indexOf('--json') > -1;
  const files = argv.filter(a => !a.startsWith('--'));
  if (files.length !== 1) {
    console.error('用法: node check_deck.js "<成品.html>" [--json]');
    process.exit(1);
  }
  const target = path.resolve(expandHome(files[0]));
  const results = check(target);
  const failed = results.filter(r => r.level === 'FAIL');
  const warns = results.filter(r => r.level === 'WARN');

  if (jsonMode) {
    console.log(JSON.stringify({ file: target, pass: failed.length === 0, results: results }, null, 2));
  } else {
    console.log('验收文件: ' + target);
    console.log('-'.repeat(62));
    for (const r of results) {
      const tail = r.detail ? '  -> ' + r.detail : '';
      console.log('[' + r.level.padEnd(4) + '] ' + r.item.padEnd(22) + tail);
    }
    console.log('-'.repeat(62));
    console.log('结果: ' + (failed.length ? 'FAIL' : 'PASS') +
                '  (FAIL ' + failed.length + ' / WARN ' + warns.length +
                ' / 共 ' + results.length + ' 项)');
    if (failed.length) console.log('禁止交付，逐条修复后重跑。');
  }
  process.exit(failed.length ? 1 : 0);
}

try {
  main();
} catch (err) {
  console.error('[error] ' + err.message);
  process.exit(1);
}
