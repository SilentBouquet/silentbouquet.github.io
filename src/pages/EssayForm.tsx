import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Check, Copy, Download } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const inputCls =
  "w-full rounded-sm border border-border bg-card px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-1 focus:ring-primary/30";

/**
 * 写作间：在浏览器里起草文章，一键生成 Markdown 文件。
 * 发布方式：把下载的 .md 文件放进 src/content/essays/ 并 git push。
 */
export default function EssayForm() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("随笔");
  const [date, setDate] = useState(todayMD());
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  const md = useMemo(() => {
    const head = [
      "---",
      `title: ${title || "未命名"}`,
      subtitle ? `subtitle: ${subtitle}` : null,
      `category: ${category || "随笔"}`,
      `date: ${date || todayMD()}`,
      excerpt ? `excerpt: ${excerpt}` : null,
      "---",
      "",
    ]
      .filter((l) => l !== null)
      .join("\n");
    return head + body.trim() + "\n";
  }, [title, subtitle, category, date, excerpt, body]);

  const filename = useMemo(() => {
    const base =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "untitled";
    return `${base}.md`;
  }, [title]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("复制失败，请手动全选文本复制。");
    }
  };

  const download = () => {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-32">
        <Link to="/essays" className="text-xs tracking-[0.3em] text-muted-foreground hover:text-foreground">
          ← 返回文章
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-black tracking-[0.15em]">写作间</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          在这里起草，然后导出 Markdown 文件——把它放进仓库的{" "}
          <code className="font-mono-meta text-xs bg-accent px-1.5 py-0.5 rounded">src/content/essays/</code>{" "}
          目录并 push，文章即上线。
        </p>

        <div className="mt-10 space-y-6">
          <div>
            <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">标题 *</label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" />
          </div>
          <div>
            <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">副标题</label>
            <input className={inputCls} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="——可留空" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">分类</label>
              <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="哲学 / 文学 / 随笔" />
            </div>
            <div>
              <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">日期</label>
              <input className={`${inputCls} font-mono-meta`} value={date} onChange={(e) => setDate(e.target.value)} placeholder="MM-DD" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">摘要</label>
            <textarea className={`${inputCls} h-20 resize-y`} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="留空则自动截取正文开头" />
          </div>
          <div>
            <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">
              正文 *（空行分段，段首自动首字下沉）
            </label>
            <textarea
              className={`${inputCls} min-h-[380px] resize-y leading-[1.9]`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={"第一段……\n\n第二段……"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-8">
            <button
              onClick={download}
              className="flex items-center gap-2 rounded-sm bg-primary px-6 py-2.5 text-sm tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-85"
            >
              <Download size={15} /> 导出 {filename}
            </button>
            <button
              onClick={copy}
              className="flex items-center gap-2 rounded-sm border border-border px-6 py-2.5 text-sm tracking-[0.25em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "已复制" : "复制 Markdown"}
            </button>
          </div>

          <details className="rounded-sm border border-border bg-secondary/40 p-5">
            <summary className="cursor-pointer text-xs tracking-[0.3em] text-muted-foreground">
              预览生成的文件
            </summary>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-mono-meta text-xs leading-relaxed text-muted-foreground">
              {md}
            </pre>
          </details>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function todayMD(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
