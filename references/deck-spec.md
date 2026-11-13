# 页面规范与版式片段库

从 `assets/deck-template.html` 复制出的文件里，只改 `<!-- SLIDES:START -->` 到 `<!-- SLIDES:END -->` 之间的内容。本文件提供可直接复制的片段与硬约束。

## 1. 命名细则

| 情况 | 结果 |
|---|---|
| 用户说「存成 汇报.html」 | `汇报.html` |
| 用户说「做份 PPT」，主标题《中小企业知识中台落地路径》 | `html-ppt-中小企业知识中台.html`（取前 12 字） |
| 只有一堆要点没有标题 | 提炼核心名词，如 `html-ppt-产品路线图.html` |
| 同名文件已存在 | `...-2.html`、`...-3.html`，永不覆盖 |

`<主要内容>` 清洗规则：去掉书名号、引号、扩展名、日期前缀以外的标点；空白替换为连字符；只保留 2–12 个字符；禁用 `\/:*?"<>|`。

## 2. 页面骨架

```html
<section class="slide" data-title="目录显示用短标题" data-notes="演讲者备注：这页要讲什么、停多久、别展开什么">
  <div class="slide__head">
    <div class="eyebrow">SECTION LABEL</div>
    <h2>一句结论当标题</h2>
    <div class="sub">一句补充，不超过 30 字</div>
  </div>
  <div class="slide__body"> ... 内容 ... </div>
  <div class="slide__foot"><span>页脚左侧</span><span><b>05</b> / 12</span></div>
</section>
```

- 第一页必须带 `class="slide active"`，其余不带 `active`。
- `data-title` 是目录抽屉的数据源，短、可扫读。
- `data-notes` 是备注抽屉的数据源，**每页都要有**。
- 封面 / 章节页 / 结束页可省略 `slide__head`，用各自修饰类。

## 3. 版式片段（复制后改文字）

### 封面
```html
<section class="slide slide--cover active" data-title="封面" data-notes="开场 90 秒内进正题">
  <div class="bar"></div>
  <div class="eyebrow">SUBTITLE / BRAND</div>
  <h1>主标题</h1>
  <div class="lead">副标题，一句话说明这份演示解决什么</div>
  <div class="meta"><span class="pill">标签</span><span>日期 · 场合</span></div>
  <div class="deco"></div>
  <div class="slide__foot"><span>品牌</span><span><b>01</b> / 12</span></div>
</section>
```

### 目录（静态版；操作栏「目录」按钮另有一份自动生成的，且带每页缩略预览）
```html
<div class="slide__body"><ul class="agenda">
  <li><span>01</span>第一章标题</li>
  <li><span>02</span>第二章标题</li>
  <li><span>03</span>第三章标题</li>
  <li><span>04</span>第四章标题</li>
</ul></div>
```

### 章节过渡
```html
<section class="slide slide--section" data-title="第一章 · 为什么" data-notes="换气，问一句有没有问题">
  <div class="no grad-text">01</div>
  <h2 class="grad-text">章节标题</h2>
  <p>一句话点这章要回答什么</p>
</section>
```

### KPI 数字卡
```html
<div class="grid grid-4">
  <div class="card card--kpi"><div class="num">2.4<span class="unit">h</span></div><div class="lab">人均每日找资料</div></div>
  <div class="card card--kpi"><div class="num">63<span class="unit">%</span></div><div class="lab">检索靠问人</div></div>
</div>
```
`grid-2 / grid-3 / grid-4` 可选。数字必须来自真实材料，没有数据就改用要点页。

### 要点列表
```html
<ul class="bullets">
  <li><span class="dot">1</span><span><strong>加粗结论：</strong>一句解释，不超过 24 字。</span></li>
  <li><span class="dot">2</span><span><strong>加粗结论：</strong>一句解释。</span></li>
</ul>
```

### 通用卡片
```html
<div class="grid grid-3">
  <div class="card"><div class="kicker">原则一</div><h3>小标题</h3><p>两三句说明。</p></div>
</div>
```

### 大字结论页（一页只讲一句）
```html
<section class="slide slide--statement" data-title="核心结论" data-notes="停一下，让听众把这句话读完">
  <div class="statement">检索耗时占每人每天 <em>2.4 小时</em></div>
  <div class="after">这句话是全篇要解决的唯一问题，后面每一页都在回答它。</div>
</section>
```
一页只用一次，别和卡片、图表混排；`<em>` 只给最关键的那个词上渐变。

### 步骤条（三到五步）
```html
<ul class="steps">
  <li><b>归拢存量</b><span>盘清入口，先解决找不到</span></li>
  <li><b>定责任人</b><span>定更新节奏，解决不敢信</span></li>
  <li><b>接检索</b><span>让知识能被找到、被引用</span></li>
</ul>
```
列数按条目数自动均分；超过 5 步拆成两页，别压字号。

### 图表页（一页最多两个图表，且必配解读）
```html
<div class="slide__body"><div class="grid grid-2" style="height:340px">
  <div class="chart-box"><div class="cap">季度沉淀文档量（篇）</div>
    <div class="chart" data-chart="bar">
      <script type="application/json">{"labels":["Q1","Q2","Q3","Q4"],"series":[{"name":"2025","values":[120,168,210,264]}],"unit":"篇"}</script>
    </div>
  </div>
  <div class="chart-box"><div class="cap">知识来源构成</div>
    <div class="chart" data-chart="donut">
      <script type="application/json">{"labels":["项目文档","会议纪要","客户问答","外部资料"],"values":[38,27,21,14],"unit":"%","center":"100%"}</script>
    </div>
  </div>
</div></div>
```
`grid-2` 外层必须给固定高度，否则图表 SVG 会被压扁。单图表时用 `grid` 单列并同样给高度。

### 时间线
```html
<div class="slide__body"><div class="timeline">
  <div class="tp"><div class="mk"></div><h3>归拢</h3><p>先解决找不到</p></div>
  <div class="tp"><div class="mk"></div><h3>清洗</h3><p>定责任人与节奏</p></div>
  <div class="tp"><div class="mk"></div><h3>结构化</h3><p>打标签建关联</p></div>
  <div class="tp"><div class="mk"></div><h3>智能化</h3><p>接问答与摘要</p></div>
</div></div>
```
`.timeline` 的横线按 4 列画；少于 4 列时改用 `.flow` 或 `.grid` 卡片。

### 流程 / 架构（轻量）
```html
<div class="flow">
  <div class="node"><b>数据源</b><small>文档 / IM</small></div><div class="arw">→</div>
  <div class="node hi"><b>核心层</b><small>索引 / 权限</small></div><div class="arw">→</div>
  <div class="node"><b>场景</b><small>检索 / 问答</small></div>
</div>
```
节点超过 6 个就换 archify 生成架构图（见 `visuals.md`）。

### 对比
```html
<div class="compare">
  <div class="col"><h3>方案 A</h3><ul><li>缺点一</li><li>缺点二</li></ul></div>
  <div class="col win"><h3>方案 B（推荐）</h3><ul><li>优点一</li><li>优点二</li></ul></div>
</div>
```

### 图文 / 配图位
```html
<div class="media">
  <div class="art"><img src="data:image/png;base64,...." alt="图说明" style="width:100%;height:100%;object-fit:cover"></div>
  <div><ul class="bullets">...</ul></div>
</div>
```
`.art` 里可放内联 SVG 代替图片（模板示例就是 SVG）。**禁止 `http(s)://` 外链。**

### 引用 / 结束
```html
<section class="slide slide--end" data-title="结语" data-notes="收尾只讲一句行动，别开新话题">
  <div class="eyebrow">THE END</div>
  <h2 class="grad-text">收尾那句话</h2>
  <p>一句补充</p>
  <div class="thanks"></div>
</section>
```

## 4. 图表数据格式

| `data-chart` | 必填字段 | 示例 |
|---|---|---|
| `bar` | `labels`、`series:[{name,values}]`、可选 `unit` | `{"labels":["Q1","Q2"],"series":[{"name":"A","values":[12,18]},{"name":"B","values":[9,22]}],"unit":"万元"}` |
| `line` | 同 `bar` | 同上 |
| `hbar` | `labels`、`values`、可选 `unit` | `{"labels":["文档","问答","培训"],"values":[80,55,30],"unit":"%"}` |
| `donut` / `pie` | `labels`、`values`、`unit`、可选 `center` | `{"labels":["甲","乙"],"values":[60,40],"unit":"%","center":"100%"}` |

约束：

- `labels.length` 必须等于每个 `values.length`；donut 的 `labels` 与 `values` 等长。
- 只放真实数值。**没有数据时改成要点页或时间线，绝不编数字占位。**
- JSON 里不要出现 `</script>`、`<` 等会破坏 HTML 解析的字符。
- 图表颜色自动取 `--c1`–`--c5`，换主题会跟着变；超过 5 个系列会循环取色。
- **不支持负值**：负值会被按 0 处理，需要表现增减改用文字要点或双向对比页。
- `hbar` 适合排名、完成度对比；横向条自带底槽，右侧显示带单位的数值。
- `<title>` 已内嵌在每个图形元素里，鼠标悬停有提示；打印时图形保留。

## 5. 内容密度与条理检查

| 项 | 上限 |
|---|---|
| 每页要点 | 5 条，每点 ≤24 字 |
| 每页图表 | 1 个（仅数据对比页可 2 个） |
| 每页结论 | 1 个，写在标题里 |
| 标题字号 | 44px（封面 76px），不要靠缩小字号塞内容 |
| 正文最小字号 | 15px；小于 15px 观众看不清 |
| 章节页间隔 | 每 4–6 页一张 |
| 全篇页数 | 8–16 页；超了先合并同主题页 |

条理自检：把每页 `data-title` 连起来读，应能读出一条完整叙事线（为什么 → 现状 → 怎么做 → 做成什么样 → 下一步）。读不通就重排页序。

## 6. data-hook 清单（校验依据，删除即验收失败）

操作栏按钮：`prev`、`next`、`pager`、`toc`、`notes`、`clock`、`timer`、`theme`、`fullscreen`、`export`、`print`、`hide`、`help`、`progress`。

面板：`toc-panel`、`notes-panel`、`timer-panel`、`export-menu`、`help-panel`。

目录缩略图：`buildTOC()` 建条目，`buildThumbs()` 在首次打开目录时懒生成每页缩略图——克隆真实页面 DOM 后按容器宽度等比缩放，颜色走 CSS 变量所以换主题自动跟随；`.toc-thumb` 是样式钩子。导出 HTML 时会清空 `#tocList`，避免页面副本被写进导出文件；导出文件打开后目录会自己重建。缩略图不进打印输出（`toc-panel` 在 `@media print` 里已隐藏）。

结构标记：`SLIDES:START` / `SLIDES:END`、`@media print`、`renderCharts`、`buildThumbs`、`.toc-thumb`、`data-theme`、`data-chart`。

## 7. 缩放与打印约定

- 舞台固定 1280×720 设计稿，JS 按窗口等比缩放；**不要改成百分比布局**，否则打印会错位。
- 打印样式在 `@media print`：所有页展开成流式、每页 297mm×167mm、`page-break-after:always`、隐藏全部 UI、`print-color-adjust:exact` 保证渐变和色块不被浏览器丢掉。
- 导出 PDF 走浏览器「打印 → 另存为 PDF」，不要试图在前端生成 PDF 库。
- 导出 HTML 走 `documentElement.outerHTML`，因此**所有资源必须在文件内**。
- 图表 JSON 数据节点会一直留在文件里，导出稿重新打开时 `renderCharts` 会移除旧 SVG 并按数据重建；改数据后刷新即可生效。
