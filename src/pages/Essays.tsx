import { Link } from "react-router";
import { Plus, Pin, Star } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import EssayActions from "@/components/EssayActions";
import { useEssays } from "@/hooks/useEssays";

/** 文章列表页：置顶优先，入口指向写作间 */
export default function Essays() {
  const { list, isFavorite, isPinned } = useEssays();

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-32">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono-meta text-xs tracking-[0.5em] text-muted-foreground">ESSAYS</p>
            <h1 className="mt-4 font-serif text-4xl font-black tracking-[0.15em]">文章</h1>
          </div>
          <Link
            to="/write?type=essay"
            className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-85"
          >
            <Plus size={15} /> 写文章
          </Link>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          成篇的写作：哲学笔记、文学评论与随笔。写得慢，但不打算写得更乖。
        </p>
        <div className="hairline mt-10" />

        <div className="mt-4 divide-y divide-border/60">
          {list().map((e) => (
            <div key={e.slug} className="group py-10">
              <div className="flex items-start justify-between gap-4">
                <Link to={`/essays/${e.slug}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-mono-meta text-xs text-muted-foreground">
                      {e.date} · {e.category}
                    </p>
                    {isPinned(e.slug) && (
                      <span className="flex items-center gap-1 rounded-sm border border-primary/40 px-2 py-0.5 text-xs tracking-wider text-primary">
                        <Pin size={11} /> 置顶
                      </span>
                    )}
                    {isFavorite(e.slug) && (
                      <span className="flex items-center gap-1 text-xs text-primary/80">
                        <Star size={11} fill="currentColor" /> 已收藏
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 font-serif text-2xl font-bold tracking-wide transition-colors group-hover:text-primary">
                    {e.title}
                  </h2>
                  {e.subtitle && <p className="mt-1 text-sm text-muted-foreground">{e.subtitle}</p>}
                  <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
                    {e.excerpt}
                  </p>
                  <p className="mt-4 text-xs tracking-[0.3em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    阅读全文 →
                  </p>
                </Link>
                <div className="shrink-0 pt-1 opacity-40 transition-opacity group-hover:opacity-100">
                  <EssayActions slug={e.slug} />
                </div>
              </div>
            </div>
          ))}
          {list().length === 0 && (
            <div className="py-16 text-center">
              <p className="font-serif text-lg text-foreground/70">这里还没有文章。</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                在「写作间」起草并导出 Markdown，或直接在仓库的{" "}
                <code className="font-mono-meta text-xs bg-accent px-1.5 py-0.5 rounded">src/content/essays/</code>{" "}
                目录中添加 .md 文件。
              </p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
