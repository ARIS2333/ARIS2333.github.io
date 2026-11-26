# CV website

面向实习求职的多页个人网站。技术栈是 Astro 与 TypeScript，输出静态 HTML。界面是英文。当前姓名、学校、论文、经历和笔记都是 **Sample 占位**，用来演示版式和内容结构，不是真实履历。投递前请按文末清单替换。

## 本地命令

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev       # 开发预览，默认 http://localhost:4321
npm run check     # 类型检查
npm run build     # 生产构建，输出 dist/
npm run preview   # 预览 dist/，默认 http://localhost:4321
```

直接打开这些地址可以刷新和分享。主导航进入独立页面，不使用首页锚点。

| 路径 | 页面 |
| --- | --- |
| `/` | 个人介绍、求职意向、精选项目、最新一条公告 |
| `/work` | 项目列表 |
| `/work/[slug]` | 项目详情 |
| `/publications` | 论文 |
| `/experience` | 经历 |
| `/education` | 教育 |
| `/news` | 全部公告 |
| `/blog` | 已发布笔记 |
| `/blog/[slug]` | 笔记详情 |

News 不在页头主导航里。首页的 All news → 和页尾的 News 进入 `/news`。

## 静态部署

`npm run build` 之后把 `dist/` 交给任意静态托管即可，例如 Nginx、Cloudflare Pages 或 GitHub Pages。站点按域名根路径生成链接。

发布前把 `src/config/site.ts` 里的 `url` 改成正式域名，再重新构建。站点地图和 canonical 链接都使用这个地址。

## 内容放在哪里

个人资料只改 `src/config/site.ts`：姓名、别名、学校、实验室、研究方向、一句介绍、求职状态、邮箱、头像、简历、GitHub / Google Scholar / LinkedIn、首页代表作和域名。字符串留空就会隐藏对应按钮或链接。没有头像路径时使用 `public/images/portrait.svg`。

栏目资料：

- `src/content/projects/` 项目。带图的项目用目录加 `index.md`，纯文字项目可以是单个 Markdown 文件。
- `src/content/publications/` 论文，YAML。
- `src/content/experience/` 经历，YAML。
- `src/content/education/` 教育，YAML。
- `src/content/news/` 公告，YAML。
- `src/content/blog/` 笔记。公开文章必须写 `draft: false`。

页面、布局、导航、样式和内容是分开的。颜色、字体、间距和页面宽度在 `src/styles/global.css` 顶部的变量里。

必填字段由 `src/content.config.ts` 校验。缺字段时 `npm run check` 或 `npm run build` 会失败。

## 替换头像和简历

1. 把照片放到 `public/images/portrait.jpg`（或保留 SVG）。
2. 把简历 PDF 放到 `public/cv/cv.pdf`。
3. 修改 `src/config/site.ts`：

```ts
portrait: "/images/portrait.jpg",
portraitAlt: "Portrait of Your Name",
cv: "/cv/cv.pdf",
```

`portrait` 或 `cv` 设为 `""` 时，分别回退到中性占位图或隐藏 Download CV。邮箱留空则隐藏 Email。GitHub、Google Scholar、LinkedIn 只在对应字符串非空时显示。

## 更新求职状态

仍在 `src/config/site.ts` 的 `seeking` 里改：

```ts
seeking: {
  active: true,
  roles: ["Research Intern"],
  areas: ["ML systems"],
  availability: "Summer 2027",
},
```

`active: false`，或角色、方向、时间都留空时，首页不显示求职意向。

## 选择首页代表作

`featuredWork` 写 1 或 2 个项目 id。id 是文件名去掉扩展名；如果文件是 `index.md`，id 是它所在的目录名。首页只读这些 id，文案来自项目文件的 `title` 和 `summary`。id 不存在，或数量不是 1–2 个，构建会失败。

## 添加论文

新建 `src/content/publications/my-paper.yaml`：

```yaml
title: "Paper title"
authors:
  - "Your Name"
  - "Coauthor"
venue: "Conference or journal"
year: 2026
month: 6
representative: true
projectId: my-project
links:
  paper: /papers/my-paper.pdf
  code: "https://github.com/example/repo"
```

- `month` 只用于同一年里的排序，页面上不单独显示。
- `representative: true` 时标题后显示 Representative。
- `authors` 里与 `nameAliases` 完全一致的名字会加粗。发表用的缩写写进 `nameAliases`。
- `projectId` 指向项目 id。论文页显示 Project，项目页显示这篇论文的标题。论文标题、作者和会议只写在论文文件里。
- `links.paper` 和 `links.code` 可以省略。没有的链接不会渲染。链接可以是站内路径 `/papers/file.pdf`，或 `https://` URL。

## 导入带图片的旧笔记并发布

旧 Markdown 可以没有 frontmatter。导入器保留正文，并按原来的相对路径复制图片。图片必须在笔记所在目录里面，例如 `./images/figure.png`。

示例源文件在 `examples/legacy-note/internship-scratch-notes.md`。仓库里已经有一次导入结果：`src/content/blog/internship-scratch-notes/`，它是草稿。

再次导入：

```bash
npm run import-note -- path/to/old-note.md
npm run import-note -- path/to/old-note.md --slug my-note
npm run import-note -- path/to/old-note.md --force
```

导入后的 frontmatter 类似：

```yaml
---
# Imported as a draft. Confirm the fields below, then set draft: false to publish.
title: "Internship scratch notes" # TODO: confirm title
description: "TODO: add a short summary"
date: 2026-01-01 # TODO: set the original date
tags: []
draft: true
---
```

处理步骤：

1. 确认 `title`。如果正文开头还有一级标题，而页面模板已经显示标题，删掉正文里的那一行，避免重复。
2. 把 `description` 写成一两句摘要。
3. 把 `date` 改成原文日期，格式 `YYYY-MM-DD`。
4. 按需要填写 `tags` 和 `projectId`。`projectId` 会让这篇笔记出现在对应项目页。
5. 检查相对路径图片是否还在笔记目录里。
6. 确认内容可以公开后，把 `draft: true` 改成 `draft: false`。
7. 如果某段经历要链到这篇笔记，把笔记 id 写进该经历的 `noteIds`。

`draft` 不是 `false` 的笔记不会生成详情页，也不会出现在博客列表、项目关联、经历关联或站点地图里。直接访问草稿地址会得到 404。示例经历 `sample-org-2025.yaml` 同时引用了已发布笔记和这篇草稿，页面上只会看到已发布的那篇。删掉草稿文件时，也要从 `noteIds` 里去掉它的 id，否则构建会提示笔记不存在。

公开笔记的参考是 `src/content/blog/sample-internship-notes/`。它包含目录、代码块、表格、引用和相对路径图片。

## 其他常见修改

- 新项目：添加 Markdown，写上 `title`、`summary`、`problem`、`contribution`、`outcome` 和 `date`。详情页固定先回答 Problem、My contribution、Outcome，后面的章节写在正文里。没有图片或数字也可以。
- 新经历：添加 YAML，包含机构、岗位、起止时间和若干条 `highlights`。`end` 省略时显示 Present。`projectIds` 和 `noteIds` 使用已有 id，页面显示项目名或文章标题。
- 新教育经历：学校、学位、专业和时间必填。导师、实验室、学位论文和链接不写就不显示。
- 新公告：`date` 和 `content` 必填。`href` 可选。首页只显示日期最新的一条。

## 投递前需要替换的占位

这些都是示例，不要原样发给招聘方：

- `src/config/site.ts` 里的姓名、别名、学校、实验室、研究方向、介绍、求职岗位、技术方向、入职时间、邮箱、头像、简历和外部链接
- `public/images/portrait.svg`、`public/cv/sample-cv.pdf`、`public/papers/sample-abstract.pdf`
- `src/content/projects/` 下三篇 Sample 项目
- `src/content/publications/` 下两篇 Sample 论文
- `src/content/experience/` 下两段 Sample 经历
- `src/content/education/` 下的 Sample University 与 Sample College
- `src/content/news/` 下三条 Sample 公告
- `src/content/blog/sample-internship-notes/`
- 草稿 `src/content/blog/internship-scratch-notes/`，确认或删除

替换后运行 `npm run check` 和 `npm run build`，再用 `npm run preview` 看一遍首页、代表作、论文、经历和准备公开的笔记。
