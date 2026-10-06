import { Link, Navigate, useParams } from "react-router";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ReadingProgress from "@/components/ReadingProgress";
import EssayActions from "@/components/EssayActions";
import { useEssays } from "@/hooks/useEssays";

/** 文章阅读页：衬线正文、首字下沉、进度条、收藏/置顶/编辑/删除、上一篇/下一篇 */
export default function EssayReader() {
  const { slug } = useParams();
  const { list } = useEssays();
  const items = list();
  const idx = items.findIndex((e) => e.slug === slug);
  if (idx < 0) return <Navigate to="/essays" replace />;

  const essay = items[idx];
  const prev = idx > 0 ? items[idx - 1] : null;
  const next = idx < items.length - 1 ? items[idx + 1] : null;
  const paragraphs = essay.body.split("\n\n");

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-32">
        <div className="flex items-center justify-between">
          <Link
            to="/essays"
            className="text-xs tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            ← 返回文章
          </Link>
          <EssayActions slug={essay.slug} />
        </div>

        <header className="mt-10 text-center">
          <p className="font-mono-meta text-xs text-muted-foreground">
            {essay.date} · {essay.category}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-black leading-snug tracking-[0.1em]">
            {essay.title}
          </h1>
          {essay.subtitle && (
            <p className="mt-3 font-serif text-lg text-muted-foreground">{essay.subtitle}</p>
          )}
        </header>

        <div className="hairline mx-auto mt-10 max-w-xs" />

        <article className="measure mx-auto mt-12">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`mb-7 text-justify text-[17px] leading-[2.1] tracking-[0.02em] ${
                i === 0 ? "dropcap" : ""
              }`}
            >
              {p}
            </p>
          ))}
        </article>

        <div className="hairline mx-auto mt-16 max-w-xs" />
        <p className="mt-8 text-center font-latin text-sm italic text-muted-foreground">
          — 完 · {essay.date} —
        </p>

        <nav className="mt-16 grid gap-6 border-t border-border pt-10 sm:grid-cols-2">
          {prev ? (
            <Link to={`/essays/${prev.slug}`} className="group">
              <p className="text-xs tracking-[0.3em] text-muted-foreground">← 上一篇</p>
              <p className="mt-2 font-serif text-lg font-bold transition-colors group-hover:text-primary">
                {prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/essays/${next.slug}`} className="group text-right">
              <p className="text-xs tracking-[0.3em] text-muted-foreground">下一篇 →</p>
              <p className="mt-2 font-serif text-lg font-bold transition-colors group-hover:text-primary">
                {next.title}
              </p>
            </Link>
          )}
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
