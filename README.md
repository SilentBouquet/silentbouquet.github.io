# SilentBouquet · 深海与星空之间

个人文学与哲学站点：笔记、文章、小说。React + TypeScript + Vite + Tailwind。

## 日常写作（发布文章）

文章源是 `src/content/essays/` 目录下的 Markdown 文件：

1. 复制 `src/content/essays/_template.md`，重命名为英文短横线 slug，如 `my-essay.md`；
2. 修改文件头部信息（`title` 必填，`pinned: true` 置顶），正文以空行分段；
3. 提交并推送，GitHub Pages 自动重新构建，约一分钟后上线：

```bash
git add src/content/essays/my-essay.md
git commit -m "publish: my-essay"
git push
```

也可以在站内「写作间」（/essays/new）起草，一键导出 Markdown 文件。

## 开发

```bash
npm install
npm run dev     # 本地开发
npm run build   # 生产构建 → dist/
```

## 本地预览

```bash
npm run preview
```
