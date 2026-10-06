import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import { loadNotes } from "@/lib/notes";

/** 笔记页：时间线 + 搜索 + 标签筛选 */
export default function Notes() {
  const notes = loadNotes();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("全部");

  const tags = useMemo(
    () => ["全部", ...Array.from(new Set(notes.flatMap((n) => n.tags)))],
    [notes]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (tag !== "全部" && !n.tags.includes(tag)) return false;
      if (!q) return true;
      return n.text.toLowerCase().includes(q);
    });
  }, [notes, query, tag]);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">NOTES</p>
            <h1 className="mt-3 font-serif text-4xl font-black tracking-[0.12em]">笔记</h1>
          </div>
          <Link
            to="/write?type=note"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Plus size={15} /> 记一笔
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索笔记…"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`rounded-full border px-4 py-1.5 text-xs tracking-[0.2em] transition-all ${
                  tag === t
                    ? "border-primary/60 bg-accent text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {t === "全部" ? t : `#${t}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {notes.length === 0 ? "笔记簿还是空白页——点「记一笔」，写下第一片碎片。" : "没有匹配的笔记。"}
            </p>
          )}
          {filtered.map((n, i) => (
            <Reveal key={n.id} delay={Math.min(i * 0.04, 0.3)}>
              <article className="group flex gap-6">
                <div className="hidden w-16 shrink-0 pt-1 text-right font-mono-meta text-xs text-muted-foreground sm:block">
                  {n.date}
                </div>
                <div className="relative flex-1 rounded-lg border border-border bg-card p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-lg">
                  <span className="absolute -left-[5px] top-6 h-2 w-2 rounded-full bg-border transition-colors group-hover:bg-primary" />
                  <p className="font-mono-meta text-xs text-muted-foreground sm:hidden">{n.date}</p>
                  <p className="mt-1 text-[15px] leading-[1.9]">{n.text}</p>
                  {n.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {n.tags.map((t) => (
                        <span key={t} className="rounded-full bg-accent/70 px-2.5 py-0.5 text-[11px] tracking-wider text-primary">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
