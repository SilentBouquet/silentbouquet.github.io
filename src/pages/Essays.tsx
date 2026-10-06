import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Pin, Plus, Search, Star } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import EssayActions from "@/components/EssayActions";
import Reveal from "@/components/Reveal";
import { useEssays } from "@/hooks/useEssays";
import { countWords, formatCount, readingTime } from "@/lib/format";

/** 文章列表页：置顶优先，搜索 + 分类筛选 */
export default function Essays() {
  const { list, isFavorite, isPinned } = useEssays();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("全部");

  const all = list();
  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(all.map((e) => e.category)))],
    [all]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((e) => {
      if (cat !== "全部" && e.category !== cat) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        (e.subtitle ?? "").toLowerCase().includes(q) ||
        e.excerpt.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
      );
    });
  }, [all, query, cat]);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">ESSAYS</p>
            <h1 className="mt-3 font-serif text-4xl font-black tracking-[0.12em]">文章</h1>
          </div>
          <Link
            to="/write?type=essay"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Plus size={15} /> 写文章
          </Link>
        </div>

        {/* 搜索 + 筛选 */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索标题、摘要或正文…"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-1.5 text-xs tracking-[0.2em] transition-all ${
                  cat === c
                    ? "border-primary/60 bg-accent text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 divide-y divide-border/50">
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-serif text-lg text-foreground/70">
                {all.length === 0 ? "这里还没有文章。" : "没有匹配的内容。"}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {all.length === 0
                  ? "点「写文章」，或在仓库 src/content/essays/ 目录添加 Markdown 文件。"
                  : "换个关键词或分类试试。"}
              </p>
            </div>
          )}
          {filtered.map((e, i) => (
            <Reveal key={e.slug} delay={Math.min(i * 0.05, 0.3)}>
              <div className="group py-8">
                <div className="flex items-start justify-between gap-4">
                  <Link to={`/essays/${e.slug}`} className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full bg-accent/80 px-2.5 py-0.5 text-[11px] tracking-[0.2em] text-primary">
                        {e.category}
                      </span>
                      <span className="font-mono-meta text-[11px] text-muted-foreground">{e.date}</span>
                      {isPinned(e.slug) && (
                        <span className="flex items-center gap-1 text-[11px] text-primary"><Pin size={11} /> 置顶</span>
                      )}
                      {isFavorite(e.slug) && (
                        <span className="flex items-center gap-1 text-[11px] text-primary/80"><Star size={11} fill="currentColor" /> 已收藏</span>
                      )}
                    </div>
                    <h2 className="mt-3 font-serif text-2xl font-bold leading-snug tracking-wide transition-colors group-hover:text-primary">
                      {e.title}
                    </h2>
                    {e.subtitle && <p className="mt-1 font-serif text-sm text-muted-foreground">{e.subtitle}</p>}
                    <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {e.excerpt}
                    </p>
                    <p className="mt-3 flex items-center gap-3 font-mono-meta text-[11px] text-muted-foreground/70">
                      <span>{readingTime(e.body)}</span>
                      <span>·</span>
                      <span>{formatCount(countWords(e.body))} 字</span>
                      {e.tags && e.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{e.tags.map((t) => `#${t}`).join(" ")}</span>
                        </>
                      )}
                    </p>
                  </Link>
                  <div className="shrink-0 pt-1 opacity-40 transition-opacity group-hover:opacity-100">
                    <EssayActions slug={e.slug} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
