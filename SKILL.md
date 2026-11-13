---
name: xin-html-ppt
description: 把 PPT 大纲或内容文件做成一份带完整操作栏的单文件 HTML 演示文稿。当用户要求「做 PPT」「生成幻灯片」「大纲转 PPT」「HTML 格式 PPT」「演示文稿」，或给出大纲文本、Markdown、txt、docx、pdf、xlsx 内容文件要求转成演示稿时使用；也用于给已有 HTML PPT 换风格、加页、补图表。产出按指定名命名的 .html，未指定时用 html-ppt-主要内容.html 形式命名。内置前后页、目录、演讲者备注、实时时钟、倒计时、全屏、导出、打印、隐藏控制栏九项功能，六套主题与内联 SVG 图表，零外部依赖。可按需接入 ui-ux-pro-max（视觉规范）、chart-infographic（信息图）、archify（架构图）、image-design-master（AI 配图）。触发词：做PPT、生成PPT、HTML PPT、幻灯片、大纲转PPT、演示文稿、xin-html-ppt。
agent_created: true
---

# xin-html-ppt · HTML 演示文稿生成器

把大纲或内容文件变成一份**单文件、离线可用、带完整操作栏的 HTML 演示文稿**。拷贝一个文件就能放，断网也能放。

## 三条铁律

1. **一个文件交付。** CSS、JS、SVG 图表、字体回退全部内联。配图必须 base64 内嵌或随 HTML 同目录一起交付。禁止 CDN、外链字体、外链脚本、外链图片。
2. **九项功能一个不少。** 前后页、目录、备注、时间、倒计时、全屏、导出、打印、隐藏控制栏。直接从模板复制，不重写控制栏逻辑。
3. **美化技能是可选增强，不是依赖。** ui-ux-pro-max / chart-infographic / archify / image-design-master 任何一个调不通，立即降级到内置主题与内联 SVG，不留外链死图、不中断交付、不向用户报「做不了」。

## 何时使用

用户说「做 PPT」「生成幻灯片」「把这份大纲做成 PPT」「HTML 格式的 PPT」「演示文稿」，或给出大纲文本、Markdown、txt、docx、pdf、xlsx 内容文件要求转成演示稿时触发。也用于给已有 HTML PPT 换风格、加页、补图表、修操作栏。

## 交付物与命名

- 输出**一个 `.html` 文件**，默认落在当前工作区；用户指定输出目录时跟随。
- 文件名优先级：**用户明确指定的名字 > `html-ppt-<主要内容>.html`**。
- `<主要内容>` 从大纲主标题提炼 2–12 个字，去掉标点、空格、书名号与扩展名。例：《2026 产品路线图》→ `html-ppt-2026产品路线图.html`。
- 目标文件已存在时**不覆盖**，追加 `-2`、`-3`。由 `scripts/new_deck.py` 自动处理（无 Python 时用 `new_deck.js`）。
- 交付时调用 `present_files` 打开成品，回复里给出绝对路径、页数、主题、用了哪些增强。

## 工作流

### 第 1 步 · 读大纲，定结构

读取输入：口述直接用；文件按类型走对应读取方式（docx → Word 读取链路，pdf → PDF 读取链路，xlsx → 表格读取链路，md/txt → 直接读）。提炼主标题、副标题、核心结论、章节层级、真实数据点。

生成一份内部页面清单（不必输出给用户）：每页的 `data-title`、版式类型、要点、`data-notes`、图表数据。页数规则：用户没指定时按大纲层级推算，一般 8–16 页；**每页只放一个结论**。

### 第 2 步 · 定风格

- 默认 `aurora`（浅色蓝紫科技风，符合用户一贯偏好）。
- 用户给了品牌色、行业、风格词时，按 `references/styles.md` 选六套预设之一，或调 ui-ux-pro-max 的 `--design-system` 检索后把结果映射到 CSS 变量。
- 不确定的小歧义沿用默认主题，不打断流程。

### 第 3 步 · 初始化文件

先探测运行时：`python --version`，没有再试 `node --version`。**有 Python 用 `.py`，没有 Python 用 `.js`**，两个都没有按下方「运行时缺失怎么办」提示用户安装。第 6 步沿用同一次探测结果。

```bash
python "<skill-dir>/scripts/new_deck.py" --out "<输出目录>" --title "<主标题>" --subtitle "<副标题>" [--name "<指定文件名.html>"]
```

**没有 Python 时**改用 `node "<skill-dir>/scripts/new_deck.js"`，参数与输出完全一致。两个运行时都没有 → 按下方「运行时缺失怎么办」提示用户安装，不手工硬扛。

脚本复制 `assets/deck-template.html`、替换 `{{DECK_TITLE}}` / `{{DECK_SUBTITLE}}`、按规则命名、防覆盖，并输出成品绝对路径。

### 第 4 步 · 填内容

替换 `<!-- SLIDES:START -->` 到 `<!-- SLIDES:END -->` 之间的**整段示例内容**。每页必须是：

```html
<section class="slide" data-title="目录里显示的标题" data-notes="演讲者备注">
  ...
</section>
```

- `data-title` 进目录抽屉，`data-notes` 进备注抽屉。**备注必填**，没有补充就写「本页按稿讲，不展开」。
- 版式片段从 `references/deck-spec.md` 复制，改文字即可。
- 页码脚注 `<div class="slide__foot">` 按总页数更新，或统一省略。

**内容清晰度硬规则：**

- 标题写结论，不写名词。「检索耗时占每人每天 2.4 小时」优于「现状分析」。
- 每页 ≤5 个要点，每点 ≤24 字；超了就拆页。
- 数字必带单位；模板里的示例数字**必须替换或明确标注为示例**，禁止把样板数据当真实结论讲。
- 一页最多一个图表，图表旁必配一句「所以呢」的解读。
- 长稿每 4–6 页插一张章节页换气。

### 第 5 步 · 图表与配图

- 默认用模板内置的**内联 SVG 图表**（bar / line / donut），数据写在 `<script type="application/json">` 里，格式见 `references/deck-spec.md`。零依赖、随主题换色、打印不丢。
- 需要复杂信息图、架构图、AI 氛围配图时，按 `references/visuals.md` 接入四个技能，产物一律转成 base64 内嵌。
- 任何增强失败 → 用 `.flow` 节点、`.card` 卡片、CSS 几何装饰或内联 SVG 占位，继续交付。

### 第 6 步 · 校验与交付

```bash
python "<skill-dir>/scripts/check_deck.py" "<成品绝对路径>"
```

**没有 Python 时**改用 `node "<skill-dir>/scripts/check_deck.js"`，23 项验收结果逐项一致。

必须全部 PASS 才交付，FAIL 逐条修。然后浏览器实测：翻页、目录跳转、备注、时钟、倒计时开始/暂停/重置、全屏、导出 HTML、打印预览、隐藏控制栏、主题切换。最后 `present_files` 打开成品。

## 资源

| 文件 | 用途 | 何时使用 |
|---|---|---|
| `assets/deck-template.html` | 完整可运行模板，含全部交互与打印样式 | 第 3 步由脚本复制；只在要改控制栏逻辑时通读 |
| `references/deck-spec.md` | 版式片段库、图表 JSON、命名细则、内容密度、data-hook 清单 | 第 4、5 步 |
| `references/styles.md` | 六套主题变量、自定义主题、ui-ux-pro-max 接入 | 第 2 步 |
| `references/visuals.md` | 四个美化/配图技能接入、内嵌方式、降级策略 | 第 5 步 |
| `scripts/new_deck.py` | 初始化、命名、防覆盖（主实现） | 第 3 步 |
| `scripts/check_deck.py` | 交付前 23 项验收（主实现） | 第 6 步 |
| `scripts/new_deck.js` / `check_deck.js` | 与上等价的 Node 兜底，零依赖 | 没有 Python 时 |

## 运行时缺失怎么办

- **优先 Python 3。** `scripts/new_deck.py` / `check_deck.py` 是主实现。
- **没有 Python 就用 Node.js >= 16。** `scripts/new_deck.js` / `check_deck.js` 是等价兜底：参数、输出 JSON、23 项验收结果逐项一致。先用 `python --version` / `node --version` 探测，哪个在就调哪个。
- **两个都没有 → 直接提示用户安装 Python 3 或 Node.js >= 16，装好再继续。** 不要手工硬扛命名与自检，也不要擅自往用户机器装运行时。WorkBuddy、Copilot 这类 agent 工具一般自带 Python 和 Node，真缺了让用户补上最省事。
- 生成的 HTML 本身零运行时依赖，浏览器直接打开就能放；放映这件事不依赖 Python 或 Node。
- `references/` 里第三方技能自带的 `search.py`、`search_prompts.py` 同理：没有 Python 就跳过该增强，按三条铁律降级到内置主题与内联 SVG。
- 维护者重建 `dist/xin-html-ppt-skill.zip` 用 `tools/build_dist.py`（Python 3），用户碰不到。

## 常见坑

- **不要重写控制栏。** 模板 JS 已实现全部交互、等比缩放与 `@media print`。从头写最容易漏打印样式和全屏缩放。
- **不要留外链。** 导出走 `documentElement.outerHTML`，外链图片和字体会失效。
- **不要用 emoji 当图标。** 用内联 SVG，`stroke="currentColor"` 让颜色跟主题变量走。
- **不要把模板示例当交付。** 那 10 页是样板，必须整段替换。
- **打印前关面板。** 打印按钮已自动关；`@media print` 会把所有页展开成一页一张、隐藏全部 UI。
- **中文字体**：只用系统字体回退链，不加载 Web Font。
- **Windows 路径**：调 python/node 一律用 `C:/...`、`D:/...` 形式的绝对路径，不要把 Git Bash 的 `/c/...`、`/d/...` 喂给原生程序。
