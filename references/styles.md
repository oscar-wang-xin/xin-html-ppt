# 主题、配色与视觉规范

模板的 `<style>` 顶部用 `html[data-theme="..."]` 定义六套主题。换肤只改 CSS 变量，不动结构、不动 JS。

## 1. 六套内置预设

| `data-theme` | 名称 | 底色 | 主色 | 适用 |
|---|---|---|---|---|
| `aurora` | 浅色蓝紫（**默认**） | 近白 `#ffffff` | 靛蓝 `#5b5bd6` → 紫 `#8b5cf6` | 科技、产品、AI、通用汇报；符合用户一贯的浅色蓝紫偏好 |
| `ink` | 暗夜极简 | 深蓝黑 `#171c28` | 亮青 `#6ee7e0` | 技术分享、开发者大会、夜间场次 |
| `paper` | 暖纸刊物 | 米白 `#fbf7ef` | 朱红 `#a8442e` | 读书、人文、品牌故事、偏出版的调性 |
| `biz` | 商务深蓝 | 藏青 `#142642` | 亮蓝 `#5b9dff` + 金 `#e5b567` | 投标、董事会、正式对外汇报 |
| `sumi` | 国风水墨 | 宣纸白 `#f6f5f0` | 墨黑 `#353a40` + 印红 `#b34b3d` | 国风、传统行业、文化类内容 |
| `vivid` | 渐变活力 | 白 | 紫 `#7c3aed` → 粉 `#ec4899` → 橙 | 年轻化、营销、创意提案 |

操作栏的「切换主题」按钮（`T` 键）会循环这六套，并把选择存进 `localStorage`。交付时如需锁定风格，把 `<html data-theme="...">` 里的值固定，JS 里读 localStorage 的逻辑可保留（用户手动切不影响文件本身）。

## 2. 变量清单（自定义主题时逐一给值）

```
--bg / --stage / --surface / --surface-2     背景层
--ink / --ink-2 / --ink-3                    正文 / 次级 / 弱化文字
--line                                       描边与网格
--brand / --brand-2 / --accent               品牌主色
--c1 ... --c5                                图表系列色（按顺序取）
--grad                                       主渐变（标题字、按钮、数字）
--soft                                       浅色渐变底（卡片、光斑）
--shadow / --radius                          阴影与圆角
--font / --font-title                        正文字体链 / 标题字体链
```

新增第七套主题：复制任意一段 `html[data-theme="..."]`，改选择器名与变量值，再把名字加进 JS 的 `THEMES` 数组与 `THEME_LABEL` 映射，循环切换才会包含它。

## 3. 接入 ui-ux-pro-max（可选）

适用：用户给了明确视觉方向（品牌色、行业调性、「要高级点」「别太花」），或要审视排版、对比度、图标一致性时。默认六套预设已够用，不必每次都调。

定位技能目录（不要硬编码路径，`~` 代表当前用户主目录）：

```
Glob: ~/.workbuddy/skills/**/ui-ux-pro-max/SKILL.md
```

整体视觉方向用 `--design-system`；单点问题用 `--domain`：

```bash
python "<ui-ux-pro-max>/scripts/search.py" "enterprise knowledge platform presentation light violet" --design-system
python "<ui-ux-pro-max>/scripts/search.py" "presentation typography heading hierarchy" --domain typography
python "<ui-ux-pro-max>/scripts/search.py" "chart color contrast legend" --domain chart
```

把检索结果映射到变量，按这个对应关系落地：

| 检索结果 | 落到哪里 |
|---|---|
| 主色 / 辅色 | `--brand`、`--brand-2`、`--grad`、`--c1..--c5` |
| 背景 / surface | `--bg`、`--stage`、`--surface`、`--surface-2` |
| 文字色阶 | `--ink`、`--ink-2`、`--ink-3` |
| 字体配对 | `--font`、`--font-title`（**只接受系统字体**） |
| 圆角 / 阴影 | `--radius`、`--shadow` |

硬约束：

- 正文与背景对比度 ≥ 4.5:1，大标题 ≥ 3:1。深色主题下 `--ink-3` 容易过灰，必须复核。
- 图标一律内联 SVG，`stroke="currentColor"`，**不用 emoji**（该技能 Style Selection 规则明确禁止）。
- 不引入 Web Font、Tailwind、GSAP 等外部依赖；检索结果只作为设计建议，落地仍用模板原生 CSS。
- 检索为空或跑不通时，沿用六套预设，标为「通用设计兜底」，不要声称已按该技能验证。

## 4. 字体

只用系统字体回退链，顺序固定：

```
"Inter","HarmonyOS Sans SC","PingFang SC","Microsoft YaHei","Segoe UI",sans-serif
```

中文标题不设 `letter-spacing` 过大值；模板用 `-.02em`。正文 `line-height` 不低于 1.5。不要为了「设计感」把正文压到 15px 以下。

## 5. 动效与质感

- 翻页用 340ms 透明度 + 轻微位移；`prefers-reduced-motion` 下自动关闭。
- 质感来自渐变光斑、细网格纹理、柔和阴影、玻璃拟态操作栏，不靠堆叠动画。
- 单页内动画不超过一处；演示文稿的可读性优先于炫技。
- 主题切换时图表颜色靠 CSS 变量自动跟随，不需要重绘。
