# 图表与配图：技能接入与降级

**默认路径永远是内联 SVG / CSS。** 下面四个技能只在用户明确提出对应需求时接入。任何一个失败，立刻降级，不中断交付。

## 决策表

| 需求 | 默认做法 | 可选增强 | 失败降级 |
|---|---|---|---|
| 柱状 / 折线 / 环形数据图 | 模板内联 SVG（`deck-spec.md` 第 4 节） | 不需要 | 始终可用 |
| 复杂信息图、数据汇报配图 | 内联 SVG + `.card` 卡片组 | `chart-infographic` | 卡片 + SVG 几何 |
| 系统架构 / 流程 / 时序 / 数据流 | `.flow` CSS 节点 | `archify` | `.flow` 节点或简化表格 |
| 封面氛围图、插画、角色或场景视觉 | CSS 渐变 + `.deco` 几何装饰 | `image-design-master` → 图像生成 | 渐变 + 内联 SVG 插画 |
| 配色、字体、版式、无障碍审视 | 六套内置主题 | `ui-ux-pro-max` | 内置主题 |

## 1. ui-ux-pro-max — 视觉规范

见 `styles.md` 第 3 节。只取建议，不引入它的任何运行时依赖。

## 2. chart-infographic — 信息图（谨慎使用）

该技能走 `designkit` CLI，需要连接器登录、创建房间、等待产物，且**数据必须真实**。仅在以下条件同时满足时调用：

- 用户明确要「信息图 / 数据配图 / 汇报图」；
- 用户提供了真实数值或数据文件，且不要求即时离线交付。

门禁：不编造数值、不从摘要反填参数、不把「受理成功」当成品、不重复创建房间。产物是图片文件，拿到后按第 5 节转 base64 内嵌。

**默认不调。** 大多数 PPT 用内联 SVG 图表更快、更稳、可打印、可换色。CLI 解析失败、未登录、超时 → 直接走降级，不重试、不阻塞。

## 3. archify — 架构 / 流程 / 时序图

适用：节点多、有分支、需要正规架构图或时序图，`.flow` 撑不住时。

定位技能目录（不同机器目录名可能是 `archify` 或 `archify4workbuddy__skillhub`；`~` 代表当前用户主目录）：

```
Glob: ~/.workbuddy/skills/**/bin/archify.mjs
```

路径写法：调用原生 `node` 时必须传本机可识别的绝对路径。Windows 写 `C:/Users/<用户名>/...`，不能喂 Git Bash 的 `/c/...`；macOS / Linux 写 `/Users/<用户名>/...` 或 `/home/<用户名>/...`。下面把真实位置存进 `ARCHIFY`，别把示例路径直接抄进命令。

```bash
# 改成你机器上 archify.mjs 的真实位置，例如：
#   Windows (Git Bash): ARCHIFY="C:/Users/<用户名>/.workbuddy/skills/archify4workbuddy__skillhub/bin/archify.mjs"
#   macOS / Linux:      ARCHIFY="$HOME/.workbuddy/skills/archify4workbuddy__skillhub/bin/archify.mjs"
ARCHIFY="<填写 archify.mjs 的绝对路径>"
export ARCHIFY_UPDATE_CHECK_DISABLED=1
node "$ARCHIFY" doctor
node "$ARCHIFY" validate architecture candidate.json --quality showcase --json
node "$ARCHIFY" deliver architecture candidate.json diagram.html --quality showcase --json
```

接入 PPT 的做法：让它导出 SVG / PNG，再按第 5 节内嵌到 `.art` 或 `.chart-box`。**不要把整份 diagram.html 用 iframe 嵌进 PPT**——打印会空白，导出 HTML 会断链。

若 node 不可用、校验不通过、导出失败 → 用 `.flow` 节点或 `.grid` 卡片重画，最多 6 个节点，保留主干路径。

## 4. image-design-master — AI 配图

适用：用户要封面主视觉、氛围插画、风格化配图。

流程：

1. 用技能的 `scripts/search_prompts.py` 检索模板与案例，拿到完整提示词（**不要整篇读 `cases.json`**）。这是第三方技能自带的 Python 脚本，本机没有 Python 就跳过本节增强，按约束里的降级规则走。
2. 按提示词调用图像生成能力产出图片文件。
3. 图片按第 5 节转 base64 内嵌，或用同目录相对路径并**把图片一起交付**。

约束：

- 每份 PPT 大图不超过 2 张；base64 会让单文件体积变大（单张建议压到 300KB 以内）。
- `alt` 必填；图只是氛围，不承载关键数据。
- 生成失败或工具不可用 → 用 `.deco` 几何圆、渐变光斑、内联 SVG 插画占位（模板「配图位」页就是范例），**不留空白 img、不写外链占位图**。

## 5. 产物内嵌（所有外部图片的统一入口）

把图片转 base64 再替换占位符，避免手工粘贴超长字符串。**优先 Python 3：**

```python
import base64, pathlib
img = pathlib.Path("图片路径.png")
b64 = base64.b64encode(img.read_bytes()).decode("ascii")
mime = "image/png"  # 按真实格式改 jpeg / webp
uri = "data:%s;base64,%s" % (mime, b64)
# 把 HTML 里的 __IMAGE_URI__ 替换成 uri
```

没有 Python 时用 Node 兜底（用 npx 装的机器一定有）：

```bash
node -e "const fs=require('fs');const b=fs.readFileSync('图片路径.png').toString('base64');console.log('data:image/png;base64,'+b)" > image-uri.txt
```

两个运行时都没有 → 提示用户安装 Python 3 或 Node.js >= 16，装好再继续；**绝不写外链占位图**。

落地写法：

```html
<img src="data:image/png;base64,...." alt="图说明" style="width:100%;height:100%;object-fit:cover">
```

SVG 直接内联进 HTML 更好（可随主题换色、可打印、体积小）；若来自 archify 导出，用文本读取后去掉 XML 声明与外链资源再插入。

## 6. 禁止事项

- 禁止 `<img src="http...">`、`<link href="http...">`、`<script src="http...">`、`@import url(http...)`。校验脚本会逐项拦截。
- 禁止编造数值、单位、来源；没有数据就改成定性要点页。
- 禁止把连接器/CLI 的「任务已受理」「预览图」当正式配图交付。
- 禁止为了配图把控制栏、打印样式、缩放逻辑改坏。
- 禁止在交付文件里留 `TODO`、占位图片路径、`{{...}}` 未替换标记。

## 7. 交付前一句自检

断开网络打开成品：翻页正常、图表有色、配图显示、打印预览完整、导出 HTML 再打开仍正常 —— 全过才算做完。
