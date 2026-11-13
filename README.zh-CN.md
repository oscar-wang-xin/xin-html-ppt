# xin-html-ppt

给一份大纲，出一份**单文件、断网也能放**的 HTML 演示文稿；装到 AI 工具里，也就一行命令的事。

**MIT 协议** · **Node.js >= 16** · **安装器零运行时依赖** · **生成的演示稿零外链**

[English README](README.md) · [Issues](https://github.com/oscar-wang-xin/xin-html-ppt/issues)

---

## 这到底是什么

不是一个拿来 `import` 的 JS 库，是一份 **Agent Skill**：`SKILL.md` 说明文件 + 一个 HTML 模板 + 三份参考规范 + Node/Python 双份辅助脚本。AI 编程助手读到这些文件，你说一句「把这份大纲做成 PPT」，它照着做。

仓库里唯一可执行的是 `bin/cli.js`，职责只有一件：把技能文件复制进你那个 AI 工具的 skills 目录。不联网、不装依赖、不构建。

## 运行时依赖

| 场景 | 需要什么 |
| --- | --- |
| 用 `npx` 安装 | Node.js >= 16（npx 就是 Node 的命令）。 |
| 下载 zip 手动安装 | 什么都不需要，复制一个文件夹。 |
| 打开 / 放映生成的演示稿 | 任意现代浏览器。不需要 Node、不需要 Python、不需要联网。 |
| 跑辅助脚本 | **优先 Python 3**；没有 Python 时用等价的 Node.js >= 16 兜底。 |
| 两个运行时都没有 | AI 直接提示用户安装 Python 3 或 Node.js >= 16，装好再继续；不擅自替用户安装。 |
| 维护者重建 `dist/*.zip` | `tools/build_dist.py` 需要 Python 3，用户永远碰不到。 |

**Python 3 是主路径，`.js` 脚本是没有 Python 时的兜底。** 两套脚本保持同步，结果逐项一致。WorkBuddy、Copilot 这类 agent 工具一般自带 Python 和 Node；真两个都缺，`SKILL.md` 要求 AI 提示用户装一个，而不是自己手工硬扛。

生成的 HTML 完全自包含，没有 CDN、外链字体、远程脚本。第三方美化技能自带 Python 脚本，调不通就按三条铁律降级到内置主题和内联 SVG。

## 三种拿法

### 一、npx，一行搞定

```bash
# 直接从 GitHub 装。仓库 push 完就能用，不需要先发 npm 包，需要本机有 git。
npx --yes github:oscar-wang-xin/xin-html-ppt

# 等包发到 npm 之后，可以用短写法：
npx --yes xin-html-ppt
```

`--yes` 用来跳过 npx 那句 "Ok to proceed?" 确认，不然在非交互终端里会卡住。

安装器会自动找 `~/.workbuddy/skills` 和 `~/.claude/skills`，找到哪个装哪个；一个都没找到就建 WorkBuddy 那个目录。**已装过的不覆盖**，除非明确加 `--force`。

```bash
npx --yes xin-html-ppt --list                    # 看检测到哪些工具、装没装
npx --yes xin-html-ppt --tool claude             # 只装 Claude Code
npx --yes xin-html-ppt --target ~/my-agent/skills
npx --yes xin-html-ppt --force                   # 覆盖已有安装
npx --yes xin-html-ppt --uninstall
```

| 参数 | 作用 |
| --- | --- |
| `--target <dir>` | 装到 `<dir>/xin-html-ppt`，优先于自动探测 |
| `--tool <id>` | `workbuddy`、`claude`，支持逗号分隔多个 |
| `--all` | 所有支持的工具都装，目录不存在就建 |
| `--force` | 覆盖已有安装 |
| `--dry-run` | 只打印将要做什么，不写文件 |
| `--list` | 列出工具探测结果与安装状态 |
| `--uninstall` | 卸载 |
| `-h` / `--help`、`-v` / `--version` | 帮助 / 版本 |

### 二、下载 zip

仓库里两个 zip 都能直接用：

- **[`dist/xin-html-ppt-skill.zip`](dist/xin-html-ppt-skill.zip)** —— 省心那个。只含技能文件，附带 `LICENSE` 和两份 README，没有开发杂项，解压出来的目录就叫 `xin-html-ppt`。
- **GitHub → Code → Download ZIP** —— 仓库根就是技能根，`SKILL.md` 在最顶层，源码同样能用。但 GitHub 解压出来的目录叫 `xin-html-ppt-main`，**记得改名成 `xin-html-ppt`** 再放进 skills 目录。

放进 `~/.workbuddy/skills/`（或 `~/.claude/skills/`）即可。目录名必须和 `SKILL.md` 里的 `name` 一致。

### 三、clone 下来自己跑

```bash
git clone https://github.com/oscar-wang-xin/xin-html-ppt.git
cd xin-html-ppt
node bin/cli.js --target ~/.workbuddy/skills
```

## 怎么用

工具如果会缓存技能，装完重启一下，然后正常说话就行：

> 把这份大纲做成 PPT
> 做 10 页，蓝紫色，数据那页放个柱状图

输入可以是粘贴的文本、Markdown、txt、docx、pdf、xlsx。输出只有一个 `.html`：你指定的名字，或者 `html-ppt-<主题>.html`。同名文件不覆盖，自动加 `-2`、`-3`。

辅助脚本也能单独使。优先 Python 3；没有 Python 时，Node 版参数相同、输出一致：

```bash
python scripts/new_deck.py --out . --title "2026 产品路线图"
python scripts/check_deck.py html-ppt-2026产品路线图.html

# 没有 Python 时的等价兜底
node scripts/new_deck.js --out . --title "2026 产品路线图"
node scripts/check_deck.js html-ppt-2026产品路线图.html
```

## 出来的演示稿有什么

- **操作栏九项**：前后页、目录点击跳页、演讲者备注、实时时钟、倒计时（5–45 分预设，开始/暂停/重置，到点提示）、全屏、导出（单文件 HTML / 大纲 Markdown / 打印成 PDF）、打印、隐藏控制栏。
- 六套主题，默认 `aurora`（浅色蓝紫）。另有键盘快捷键、进度条、URL 页码深链、`@media print` 一页一张。
- 内联 SVG 柱状图 / 折线图 / 环形图，改 HTML 里一小段 JSON 就能换数据。
- 16:9 舞台，窗口怎么拉都等比缩放。
- **断网可用是设计底线**：CSS、JS、SVG、字体回退全部内联，配图必须 base64 内嵌或随文件同目录交付。没有 CDN、没有外链字体、没有远程脚本。导出走 `outerHTML`，也正是因为零外链才不会当场失效。

## 目录结构

```
.
├── SKILL.md                      # 技能入口：frontmatter + 工作流
├── assets/deck-template.html     # 零依赖 10 页模板
├── references/                   # 版式片段、主题变量、图表与配图规范
├── scripts/                      # new_deck.js/.py、check_deck.js/.py
├── bin/cli.js                    # 零依赖 npx 安装器
├── tools/build_dist.py           # 重新生成分发 zip（维护者，需 Python 3）
├── examples/outline.md           # 示例大纲（数字是占位）
├── dist/xin-html-ppt-skill.zip   # 可直接下载的技能包
├── package.json                  # npm 元数据 + bin
├── LICENSE / README.md / README.zh-CN.md / CONTRIBUTING.md / CHANGELOG.md
└── .gitignore / .gitattributes
```

真正被复制进 AI 工具的只有 `SKILL.md`、`assets/`、`references/`、`scripts/` 和 `LICENSE`，其它一概不装。

## 开发与自检

```bash
npm test                                  # 安装器帮助冒烟测试
npm pack --dry-run                        # 看 npm 实际会打包哪些文件
node bin/cli.js --target /tmp/skills --dry-run
python scripts/check_deck.py <deck.html>  # 交付前 23 项校验（主实现）
node scripts/check_deck.js <deck.html>    # 没有 Python 时的等价兜底
python tools/build_dist.py                # 重建分发 zip（仅维护者，需 Python 3）
```

`check_deck.py` 校验页面结构、九项操作栏钩子、自包含性和图表数据，`check_deck.js` 是等价兜底。不引入测试框架，不需要构建步骤，也不需要 lockfile。

## 发布（维护者）

```bash
git tag v1.0.0
git push origin main --tags
npm publish --access public       # 可选：发了才有 `npx xin-html-ppt` 这个短写法
```

把 `dist/xin-html-ppt-skill.zip` 挂到 GitHub Release 上，别人就能下载带版本号的压缩包。即便不发 npm，`npx --yes github:...` 这条也照样能用。

## 关于可选的美化技能

`ui-ux-pro-max`、`chart-infographic`、`archify`、`image-design-master` 都是各自作者做的第三方技能。`SKILL.md` 只把它们当**可选增强**：任何一个调不通，立刻降级到内置主题和内联 SVG。本项目不打包、不复制、也不分发这些技能，用之前请去看它们各自的仓库和许可，尊重原作者。

## 参与贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。提 issue 和 PR 都欢迎，前提是 `SKILL.md` 的 frontmatter 合法、`check_deck` 两套脚本都全绿。

## 许可

MIT © 2026 Oscar Wang (王鑫)，见 [LICENSE](LICENSE)。
