import type { Note } from "@/content/types";

/**
 * 笔记加载器：从 src/content/notes/*.md 读取。
 * frontmatter: date / tags；正文即笔记内容。文件名（不含 .md）即 id。
 */

const files = import.meta.glob<string>("/src/content/notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function parse(raw: string): Omit<Note, "id"> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { date: "", tags: [], text: raw.trim() };
  let date = "";
  let tags: string[] = [];
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    if (kv[1] === "date") date = kv[2].trim();
    if (kv[1] === "tags") {
      tags = kv[2]
        .replace(/^\[|\]$/g, "")
        .split(/[,，]/)
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
  }
  return { date, tags, text: m[2].trim() };
}

export function loadNotes(): Note[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const id = path.split("/").pop()!.replace(/\.md$/, "");
      return { id, ...parse(raw) };
    })
    .filter((n) => !n.id.startsWith("_"))
    .sort((a, b) => b.date.localeCompare(a.date));
}
