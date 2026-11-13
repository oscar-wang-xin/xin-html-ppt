#!/usr/bin/env python3
"""xin-html-ppt / new_deck.py

从 assets/deck-template.html 生成一份新的 HTML 演示文稿。
负责：命名规则、占位符替换、防覆盖。

用法:
  python new_deck.py --out "<输出目录>" --title "<主标题>" [--subtitle "<副标题>"]
                     [--name "<指定文件名.html>"] [--force]
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

SKILL_DIR = Path(__file__).resolve().parent.parent
DEFAULT_TEMPLATE = SKILL_DIR / "assets" / "deck-template.html"


def slug(title):
    """从主标题提炼文件名里的 <主要内容>，2-12 字符。"""
    s = re.sub(r"\.(md|txt|docx?|pdf|xlsx?|pptx?|html?)$", "", title.strip(), flags=re.I)
    s = re.sub(r"[《》「」『』“”‘’\[\]（）()]", "", s)
    s = re.sub(r"[\\/:*?\"<>|\r\n\t,，。；;：:!！?？、]", "", s)
    s = re.sub(r"\s+", "-", s.strip()).strip("-")
    return s[:12] if s else "演示文稿"


def pick_path(out_dir, name, force):
    target = out_dir / name
    if force or not target.exists():
        return target
    stem, suffix = target.stem, target.suffix
    i = 2
    while (out_dir / ("%s-%d%s" % (stem, i, suffix))).exists():
        i += 1
    return out_dir / ("%s-%d%s" % (stem, i, suffix))


def main():
    ap = argparse.ArgumentParser(description="生成一份新的 HTML 演示文稿")
    ap.add_argument("--out", required=True, help="输出目录（不存在则创建）")
    ap.add_argument("--title", required=True, help="演示主标题，也用于默认命名")
    ap.add_argument("--subtitle", default="", help="封面副标题")
    ap.add_argument("--name", default=None, help="用户指定的文件名；省略则用 html-ppt-<主要内容>.html")
    ap.add_argument("--template", default=None, help="自定义模板路径")
    ap.add_argument("--force", action="store_true", help="允许覆盖同名文件（默认永不覆盖）")
    args = ap.parse_args()

    out_dir = Path(args.out).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    name = args.name or ("html-ppt-%s.html" % slug(args.title))
    if not name.lower().endswith((".html", ".htm")):
        name += ".html"

    template = Path(args.template).resolve() if args.template else DEFAULT_TEMPLATE
    if not template.is_file():
        print("ERROR: 模板不存在 -> %s" % template, file=sys.stderr)
        return 2

    target = pick_path(out_dir, name, args.force)
    html = template.read_text(encoding="utf-8")
    html = html.replace("{{DECK_TITLE}}", args.title).replace("{{DECK_SUBTITLE}}", args.subtitle)
    target.write_text(html, encoding="utf-8")

    result = {
        "ok": True,
        "path": str(target),
        "filename": target.name,
        "title": args.title,
        "named_by": "user" if args.name else "default",
        "template": str(template),
        "bytes": target.stat().st_size,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
