import type { Essay } from "@/content/types";

/**
 * 文章加载器：从 src/content/essays/*.md 读取全部文章。
 * 文件名（不含 .md）即 slug；以 _ 开头的文件会被忽略。
 * 新增文章 = 在目录里放一个 .md 文件，重新构建后自动上线。
 */

const files = import.meta.glob<string>("/src/content/essays/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parseFrontmatter(raw: string): Omit<Essay, "slug"> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) {
    return { title: "未命名", date: "", category: "随笔", excerpt: "", body: raw.trim() };
  }
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, "$1");
  }
  const body = m[2].trim();
  return {
    title: meta.title || "未命名",
    subtitle: meta.subtitle || undefined,
    category: meta.category || "随笔",
    date: meta.date || "",
    excerpt: meta.excerpt || body.replace(/\s+/g, "").slice(0, 80) + "……",
    pinned: meta.pinned === "true",
    body,
  };
}

/** 全部文章，按日期倒序 */
export function loadEssays(): Essay[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const name = path.split("/").pop()!.replace(/\.md$/, "");
      return { name, ...parseFrontmatter(raw) };
    })
    .filter((e) => !e.name.startsWith("_"))
    .map(({ name, ...e }) => ({ ...e, slug: name } as Essay))
    .sort((a, b) => b.date.localeCompare(a.date));
}
