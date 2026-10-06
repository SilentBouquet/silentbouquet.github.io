import type { Fiction, FictionChapter } from "@/content/types";

/**
 * 小说加载器：从 src/content/fiction/*.md 读取。
 * frontmatter: title / genre / status / date / intro；
 * 正文以 `## ` 分章。文件名（不含 .md）即 slug。
 */

const files = import.meta.glob<string>("/src/content/fiction/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseFrontmatter(raw: string): Record<string, string> & { body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { body: raw.trim() };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return { ...meta, body: m[2].trim() };
}

function splitChapters(body: string): FictionChapter[] {
  const parts = body.split(/^##\s+/m).filter((p) => p.trim());
  return parts.map((p) => {
    const nl = p.indexOf("\n");
    const title = (nl === -1 ? p : p.slice(0, nl)).trim();
    const text = nl === -1 ? "" : p.slice(nl + 1).trim();
    return { title, body: text };
  });
}

export function loadFictions(): Fiction[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const slug = path.split("/").pop()!.replace(/\.md$/, "");
      const meta = parseFrontmatter(raw);
      const chapters = splitChapters(meta.body);
      return {
        slug,
        title: meta.title || "未命名",
        genre: meta.genre || "短篇",
        status: (meta.status === "已完成" ? "已完成" : "连载中") as Fiction["status"],
        date: meta.date || "",
        intro: meta.intro || "",
        chapters: chapters.length
          ? chapters
          : [{ title: "全文", body: meta.body }],
      };
    })
    .filter((f) => !f.slug.startsWith("_"))
    .sort((a, b) => b.date.localeCompare(a.date));
}
