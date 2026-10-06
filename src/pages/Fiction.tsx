import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import { loadFictions } from "@/lib/fiction";

/** 小说列表页：搜索 */
export default function Fiction() {
  const fictions = loadFictions();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fictions;
    return fictions.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.intro.toLowerCase().includes(q) ||
        f.chapters.some((c) => c.body.toLowerCase().includes(q))
    );
  }, [fictions, query]);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">FICTION</p>
            <h1 className="mt-3 font-serif text-4xl font-black tracking-[0.12em]">小说</h1>
          </div>
          <Link
            to="/write?type=fiction"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Plus size={15} /> 开新篇
          </Link>
        </div>

        <div className="relative mt-8">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索书名、简介或正文…"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="mt-6 divide-y divide-border/50">
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-serif text-lg text-foreground/70">
                {fictions.length === 0 ? "这里还没有小说。" : "没有匹配的作品。"}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {fictions.length === 0 ? "点「开新篇」，让第一个故事从这里开始。" : "换个关键词试试。"}
              </p>
            </div>
          )}
          {filtered.map((f, i) => (
            <Reveal key={f.slug} delay={Math.min(i * 0.05, 0.3)}>
              <Link to={`/fiction/${f.slug}`} className="group block py-8">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] tracking-wider ${
                      f.status === "连载中"
                        ? "border-primary/40 bg-accent/60 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {f.status}
                  </span>
                  <span className="font-mono-meta text-[11px] text-muted-foreground">{f.date}</span>
                  <span className="text-[11px] text-muted-foreground">{f.genre}</span>
                </div>
                <h2 className="mt-3 font-serif text-2xl font-bold tracking-wide transition-colors group-hover:text-primary">
                  《{f.title}》
                </h2>
                <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {f.intro}
                </p>
                <p className="mt-3 text-xs tracking-[0.3em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  进入阅读 →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
