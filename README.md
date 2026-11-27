# Kehao Zheng

English personal site. Astro 5 and TypeScript, built to static HTML.

[English](#english) · [中文](#中文)

## English

### Setup

Node.js 20 or newer.

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # typecheck
npm run build     # writes dist/
npm run preview   # serves dist/
```

`npm run dev` reloads as you edit. `npm run preview` serves the last build and does not watch the source. After adding photos or notes, run `npm run build` before previewing.

Before a public deploy, set `url` in `src/config/site.ts` to the real domain and build again. The sitemap and canonical links use that value. Upload `dist/` to any static host.

### Pages

| Path | Page |
| --- | --- |
| `/` | Profile, about, news, featured photographs |
| `/publications` | Papers, newest year first |
| `/experience` | Education and the Bybit internship |
| `/blog` | Notes, filtered by section |
| `/blog/section/[slug]` | One section |
| `/blog/tag/[slug]` | One tag |
| `/blog/[slug]` | One note |
| `/news` | All news |
| `/gallery` | All photographs, filtered by place |

`/education` redirects to `/experience`. `/work` redirects to `/`.

### Project structure

```text
src/config/site.ts          name, about, links, domain
src/content.config.ts       required fields for each content type
src/pages/                  one route per file
src/layouts/                page shell
src/components/             header, blog, photo grid, lightbox
src/lib/                    content helpers and the photo scanner
src/styles/global.css       layout and type
src/content/                text content (YAML and Markdown)
src/assets/                 portrait and gallery originals
public/                     files copied into the site as-is
dist/                       build output, not committed
```

### Where to add something

Profile, about, email, Scholar, LinkedIn, and the domain live in `src/config/site.ts`. `bio` is the About text. A blank line starts a new paragraph. An empty string hides that link.

| Add | Put it here |
| --- | --- |
| Portrait | Replace `src/assets/portrait.jpg`. `portrait` in `site.ts` stays `"portrait.jpg"`. |
| CV PDF | `public/cv/your-cv.pdf`, then set `cv` to `"/cv/your-cv.pdf"`. Leave `cv` empty to hide the link. |
| Gallery photo | `src/assets/photographs/<Place>/filename.jpg`. The folder name, including a flag if you use one, is the place label. A filename containing `featured` or `Featured` is also shown on the homepage. |
| Blog note | `src/content/blog/<slug>/index.md`, with images in that folder's `images/`. |
| Paper | `src/content/publications/<id>.yaml` |
| Job or internship | `src/content/experience/<id>.yaml` |
| School | `src/content/education/<id>.yaml` |
| News item | `src/content/news/<id>.yaml` |
| Favicon | `public/favicon.svg` |

Gallery photos are resized at build time. Commit a JPEG whose long edge is about 2400 pixels. Keep the camera original outside this repo. The build makes WebP thumbnails and a lightbox image at most 1800 pixels on the long edge. Rebuild after adding or renaming photos.

A paper title becomes a link only when `links.paper` is set. Omit it when there is no public PDF. `links.code` still renders as a Code link.

```yaml
title: "Paper title"
authors:
  - Kehao Zheng
  - Coauthor Name
venue: SIGCSE TS
year: 2026
month: 2
summary: "One short paragraph."
tags:
  - CS education
links:
  paper: https://example.com/paper
```

`month` is only used to sort papers in the same year. A name in `authors` that matches `nameAliases` is shown in bold. `status: accepted` prints "Just accepted". `representative: true` prints "Representative".

Blog notes stay off the site until `draft: false`. `category` is the section in the left column. `tags` get their own pages. Put images next to the note and use a relative path.

```yaml
---
title: "Note title"
description: "One sentence."
date: 2026-03-06
category: "Cross-Chain"
tags:
  - "Smart Contract"
draft: false
---

![Diagram](./images/diagram.png)
```

`date` is `YYYY-MM-DD`. An old Markdown file can be imported with `npm run import-note -- path/to/note.md`. The import is a draft. Set `draft: false` after checking the title, description, date, and images.

```yaml
date: 2026-11-26
label: Paper Accepted
content: "One sentence about what happened."
href: https://example.com/paper
linkLabel: Paper
```

`href` and `linkLabel` are optional. The homepage shows the two newest items.

Education and experience are YAML files. Omit `end` on a current role or degree. On education, `precision: year` shows years only.

Do not put gallery photos in `public/photographs/`. Files there are copied into the site unchanged. `src/content/projects/` is not used by the current pages.

## 中文

英文个人网站。用 Astro 5 和 TypeScript 生成静态 HTML。

### 本地运行

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # 类型检查
npm run build     # 输出到 dist/
npm run preview   # 预览 dist/
```

`npm run dev` 会跟着源文件刷新。`npm run preview` 只提供上一次构建的结果，不会监视源文件。加了照片或笔记之后，要先 `npm run build`，再预览。

正式发布前，把 `src/config/site.ts` 里的 `url` 改成真实域名，然后重新构建。站点地图和 canonical 链接都用这个地址。把 `dist/` 上传到任意静态托管即可。

### 页面

| 路径 | 页面 |
| --- | --- |
| `/` | 个人资料、About、新闻、精选照片 |
| `/publications` | 论文，按年份从新到旧 |
| `/experience` | 教育和 Bybit 实习 |
| `/blog` | 笔记，可按分区筛选 |
| `/blog/section/[slug]` | 某一个分区 |
| `/blog/tag/[slug]` | 某一个标签 |
| `/blog/[slug]` | 一篇笔记 |
| `/news` | 全部新闻 |
| `/gallery` | 全部照片，可按地点筛选 |

`/education` 会跳到 `/experience`。`/work` 会跳到首页。

### 项目结构

```text
src/config/site.ts          姓名、About、链接、域名
src/content.config.ts       各类内容的必填字段
src/pages/                  一个文件对应一个路由
src/layouts/                页面外壳
src/components/             导航、博客、照片网格、灯箱
src/lib/                    内容辅助函数和照片扫描
src/styles/global.css       排版和布局
src/content/                文字内容（YAML 和 Markdown）
src/assets/                 头像和相册原图
public/                     原样复制进网站的文件
dist/                       构建结果，不提交
```

### 以后新内容放哪里

姓名、About、邮箱、Scholar、LinkedIn 和域名都在 `src/config/site.ts`。`bio` 是首页 About。空一行就是新的一段。字符串留空，对应的链接就不会显示。

| 要加的东西 | 放在这里 |
| --- | --- |
| 头像 | 替换 `src/assets/portrait.jpg`。`site.ts` 里的 `portrait` 保持 `"portrait.jpg"`。 |
| 简历 PDF | 放到 `public/cv/your-cv.pdf`，再把 `cv` 设为 `"/cv/your-cv.pdf"`。`cv` 留空则不显示下载。 |
| 相册照片 | `src/assets/photographs/<地点>/文件名.jpg`。文件夹名就是地点，可以带国旗 emoji。文件名里有 `featured` 或 `Featured` 的，也会出现在首页。 |
| 博客笔记 | `src/content/blog/<slug>/index.md`，图片放在该目录的 `images/`。 |
| 论文 | `src/content/publications/<id>.yaml` |
| 工作或实习 | `src/content/experience/<id>.yaml` |
| 学校 | `src/content/education/<id>.yaml` |
| 新闻 | `src/content/news/<id>.yaml` |
| 网站图标 | `public/favicon.svg` |

相册照片在构建时会被缩小。提交进仓库的 JPEG 长边大约 2400 像素即可。相机原图留在仓库外面。构建会生成 WebP 缩略图，以及长边最多 1800 像素的大图。添加或重命名照片后需要重新构建。

论文标题只有在写了 `links.paper` 时才能点开。还没有公开 PDF 就不要写这个字段。`links.code` 仍会显示成 Code 链接。

```yaml
title: "Paper title"
authors:
  - Kehao Zheng
  - Coauthor Name
venue: SIGCSE TS
year: 2026
month: 2
summary: "一段简短说明。"
tags:
  - CS education
links:
  paper: https://example.com/paper
```

`month` 只用来给同一年的论文排序。`authors` 里和 `nameAliases` 完全一致的名字会加粗。`status: accepted` 会显示 Just accepted。`representative: true` 会显示 Representative。

博客笔记在 `draft: false` 之前不会出现在网站上。`category` 是左侧的分区。`tags` 会各自生成页面。图片和笔记放在一起，用相对路径引用。

```yaml
---
title: "Note title"
description: "一句话摘要。"
date: 2026-03-06
category: "Cross-Chain"
tags:
  - "Smart Contract"
draft: false
---

![Diagram](./images/diagram.png)
```

`date` 的格式是 `YYYY-MM-DD`。旧 Markdown 可以用 `npm run import-note -- path/to/note.md` 导入。导入结果是草稿。核对标题、摘要、日期和图片之后，再把 `draft` 改成 `false`。

```yaml
date: 2026-11-26
label: Paper Accepted
content: "一句话说明发生了什么。"
href: https://example.com/paper
linkLabel: Paper
```

`href` 和 `linkLabel` 可以不写。首页显示最新的两条。

教育和经历都是 YAML。当前仍在进行的经历或学位，省略 `end`。教育经历写 `precision: year` 时，页面只显示年份。

不要把相册照片放到 `public/photographs/`。那里的文件会原样复制进网站。`src/content/projects/` 目前没有对应页面。
