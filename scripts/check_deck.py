#!/usr/bin/env python3
"""xin-html-ppt / check_deck.py

交付前验收：检查九项操作栏功能、页面结构、自包含性、打印样式、图表数据。
全部 PASS 才允许交付。

用法:
  python check_deck.py "<成品.html>" [--json]
"""
import argparse
import json
import re
import sys
from pathlib import Path

if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# 用户明确要求的九项功能（前后页合并为 prev/next）
CORE_HOOKS = [
    ("prev", "上一页"),
    ("next", "下一页"),
    ("toc", "目录"),
    ("notes", "演讲者备注"),
    ("clock", "时间"),
    ("timer", "倒计时"),
    ("fullscreen", "全屏"),
    ("export", "导出"),
    ("print", "打印"),
    ("hide", "隐藏控制栏"),
]
EXTRA_HOOKS = [("pager", "页码"), ("progress", "进度条"),
               ("theme", "主题切换"), ("help", "快捷键说明")]
PANEL_HOOKS = ["toc-panel", "notes-panel", "timer-panel", "export-menu", "help-panel"]

EXTERNAL_RE = re.compile(
    r"(?:src|href)\s*=\s*[\"']https?://"
    r"|@import\s+url\(\s*[\"']?https?://"
    r"|<script[^>]+\bsrc\s*="
    r"|<link(?![^>]*href\s*=\s*[\"']data:)[^>]*\bhref\s*=", re.I)
PLACEHOLDER_RE = re.compile(r"\{\{[A-Z_]+\}\}")
CHART_JSON_RE = re.compile(
    r"<script[^>]*type=[\"']application/json[\"'][^>]*>(.*?)</script>", re.S | re.I)
SLIDE_RE = re.compile(r"<section[^>]*class=[\"'][^\"']*\bslide\b[^\"']*[\"'][^>]*>", re.I)


def check(path):
    results = []

    def add(item, ok, detail=""):
        results.append({"item": item, "ok": bool(ok), "detail": detail,
                        "level": "FAIL" if not ok else "PASS"})

    def warn(item, detail=""):
        results.append({"item": item, "ok": True, "detail": detail, "level": "WARN"})

    if not path.is_file():
        add("文件存在", False, str(path))
        return results

    try:
        html = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        add("UTF-8 编码", False, "文件不是 UTF-8，浏览器中文会乱码")
        return results

    add("文件大小", len(html) > 8000, "%d 字节" % len(html.encode("utf-8")))
    # 剥离 HTML 注释后再统计结构，避免文档注释里的示例代码被算成页面
    content = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    # 只统计 SLIDES 区间内的页面，避免文档说明文字干扰
    m = re.search(r"<!--\s*SLIDES:START[^>]*-->(.*?)<!--\s*SLIDES:END", html, re.S)
    region = m.group(1) if m else content
    add("DOCTYPE 与结构", html.lstrip().lower().startswith("<!doctype html>"), "")
    add("UTF-8 声明", "charset=\"utf-8\"" in html.lower() or "charset=utf-8" in html.lower(), "")

    # 占位符
    leftovers = PLACEHOLDER_RE.findall(content)
    add("占位符已替换", not leftovers, "残留: %s" % ",".join(sorted(set(leftovers))) if leftovers else "")

    # 九项功能 + 附加
    missing = [lab for key, lab in CORE_HOOKS
               if not re.search(r"data-hook=[\"']%s[\"']" % key, html)]
    add("九项操作栏功能", not missing, "缺失: %s" % "、".join(missing) if missing else
        "前后页/目录/备注/时间/倒计时/全屏/导出/打印/隐藏 全部在位")

    extra_missing = [lab for key, lab in EXTRA_HOOKS
                     if not re.search(r"data-hook=[\"']%s[\"']" % key, html)]
    add("辅助控制项", not extra_missing, "缺失: %s" % "、".join(extra_missing) if extra_missing else "")

    panel_missing = [k for k in PANEL_HOOKS
                     if not re.search(r"data-hook=[\"']%s[\"']" % k, html)]
    add("面板容器", not panel_missing, "缺失: %s" % "、".join(panel_missing) if panel_missing else "")

    # 页面结构
    slide_tags = SLIDE_RE.findall(region)
    add("幻灯片数量", 1 <= len(slide_tags) <= 40, "共 %d 页" % len(slide_tags))
    add("页面标记", "SLIDES:START" in html and "SLIDES:END" in html,
        "替换示例内容时不要删掉这两个注释")

    titled = len(re.findall(r"data-title=", region))
    add("目录标题 data-title", titled >= len(slide_tags),
        "%d/%d 页有标题" % (titled, len(slide_tags)) if slide_tags else "")
    noted = len(re.findall(r"data-notes=", region))
    add("演讲备注 data-notes", noted >= len(slide_tags),
        "%d/%d 页有备注" % (noted, len(slide_tags)) if slide_tags else "")
    add("首页激活", bool(re.search(r"class=[\"'][^\"']*slide[^\"']*active", region)), "")

    # 交互逻辑与打印
    add("等比缩放", "function fit()" in html or "function fit (" in html, "")
    add("内联图表引擎", "renderCharts" in html, "")
    add("主题系统", "data-theme=" in html and len(re.findall(r"html\[data-theme=", html)) >= 2, "")
    add("打印样式", "@media print" in html and "page-break-after" in html, "")
    add("导出 HTML 逻辑", "function exportHTML()" in html, "")
    add("导出大纲逻辑", "function exportMD()" in html, "")
    add("键盘导航", "keydown" in html and "ArrowRight" in html, "")
    add("URL 深链", "location.hash" in html, "")

    # 自包含性
    ext = EXTERNAL_RE.findall(content)
    add("零外部依赖", not ext, "发现外链 %d 处，导出 HTML 后会失效" % len(ext) if ext else "")
    add("无 iframe", "<iframe" not in html.lower(), "")

    # 图表数据
    blocks = CHART_JSON_RE.findall(content)
    bad_json = []
    for i, raw in enumerate(blocks, 1):
        try:
            d = json.loads(raw.strip())
            if "values" in d:
                assert len(d.get("labels", [])) == len(d["values"]), "labels/values 不等长"
            elif "series" in d:
                n = len(d.get("labels", []))
                assert n > 0, "labels 为空"
                for s in d["series"]:
                    assert len(s.get("values", [])) == n, "series values 与 labels 不等长"
        except Exception as e:
            bad_json.append("第%d块: %s" % (i, e))
    add("图表 JSON 合法", not bad_json, "；".join(bad_json) if bad_json else
        "%d 个数据块" % len(blocks))

    # 提醒项
    demo_marks = ["XIN-HTML-PPT · DEMO", "示例演示", "DEMO DECK"]
    hit = [m for m in demo_marks if m in html]
    if hit:
        warn("模板示例残留", "疑似未替换示例内容: %s" % "、".join(hit))
    if re.search(r"\bTODO\b|占位图片路径|__IMAGE_URI__", html):
        warn("未完成标记", "存在 TODO 或图片占位符")
    if len(html.encode("utf-8")) > 4 * 1024 * 1024:
        warn("文件体积偏大", "超过 4MB，建议压缩 base64 配图")

    return results


def main():
    ap = argparse.ArgumentParser(description="HTML 演示文稿交付前验收")
    ap.add_argument("file", help="成品 HTML 路径")
    ap.add_argument("--json", action="store_true", help="输出 JSON")
    args = ap.parse_args()

    path = Path(args.file).expanduser().resolve()
    results = check(path)
    failed = [r for r in results if r["level"] == "FAIL"]
    warns = [r for r in results if r["level"] == "WARN"]

    if args.json:
        print(json.dumps({"file": str(path), "pass": not failed,
                          "results": results}, ensure_ascii=False, indent=2))
    else:
        print("验收文件: %s" % path)
        print("-" * 62)
        for r in results:
            tail = ("  -> " + r["detail"]) if r["detail"] else ""
            print("[%-4s] %-22s%s" % (r["level"], r["item"], tail))
        print("-" * 62)
        print("结果: %s  (FAIL %d / WARN %d / 共 %d 项)" %
              ("PASS" if not failed else "FAIL", len(failed), len(warns), len(results)))
        if failed:
            print("禁止交付，逐条修复后重跑。")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
