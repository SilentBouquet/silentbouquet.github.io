# SilentBouquet · 深海与星空之间

个人文学与哲学站点：笔记、文章、小说。React + TypeScript + Vite + Tailwind。

## 发布内容（两种方式，任选）

**方式一 · 站内写作间（推荐）**：打开站点 `/write` 页面 → 连接 GitHub（一次性，细粒度令牌，仅本仓库 Contents 读写权限，只存于你的浏览器）→ 粘贴或上传 Markdown → 点「发布」。文件直接提交进仓库，Actions 自动构建，约 1 分钟上线。文章、笔记、小说均支持。

**方式二 · 直接提交文件**：在 `src/content/` 对应目录添加 Markdown 文件并 push：

| 目录 | 内容 | 文件名即 |
|---|---|---|
| `src/content/essays/` | 文章 | 网址 slug |
| `src/content/notes/` | 笔记（一文件一条） | id |
| `src/content/fiction/` | 小说（`## ` 分章） | 网址 slug |

各目录的 `_template.md` 是写作模板（下划线开头不会被发布）。

## 开发

```bash
npm install
npm run dev     # 本地开发
npm run build   # 生产构建 → dist/
npm run preview # 预览构建产物
```

## 部署

push 到 main 后，GitHub Actions 自动构建并发布到 GitHub Pages：https://silentbouquet.github.io/
