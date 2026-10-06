import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft, Check, Link as LinkIcon } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ReadingProgress from "@/components/ReadingProgress";
import EssayActions from "@/components/EssayActions";
import Reveal from "@/components/Reveal";
import { useEssays } from "@/hooks/useEssays";
import { countWords, formatCount, readingTime } from "@/lib/format";

/** 文章阅读页：衬线正文、首字下沉、进度条、元信息栏、收藏/置顶、上一篇/下一篇 */
export default function EssayReader() {
  const { slug } = useParams();
  const { list } = useEssays();
  const [copied, setCopied] = useState(false);
  const items = list();
  const idx = items.findIndex((e) => e.slug === slug);
  if (idx < 0) return <Navigate to="/essays" replace />;

  const essay = items[idx];
  const prev = idx > 0 ? items[idx - 1] : null;
  const next = idx < items.length - 1 ? items[idx + 1] : null;
  const paragraphs = essay.body.split("\n\n");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 忽略 */
    }
  };

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-28">
        <div className="flex items-center justify-between">
          <Link to="/essays" className="flex items-center gap-1.5 text-xs tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft size={13} /> 文章
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={copyLink}
              title="复制链接"
              className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {copied ? <Check size={12} /> : <LinkIcon size={12} />}
              {copied ? "已复制" : "分享"}
            </button>
            <EssayActions slug={essay.slug} />
          </div>
        </div>

        <Reveal>
          <header className="mt-10 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="rounded-full bg-accent/80 px-3 py-1 text-[11px] tracking-[0.25em] text-primary">
                {essay.category}
              </span>
              <span className="font-mono-meta text-xs text-muted-foreground">{essay.date}</span>
              <span className="font-mono-meta text-xs text-muted-foreground">{readingTime(essay.body)}</span>
              <span className="font-mono-meta text-xs text-muted-foreground">{formatCount(countWords(essay.body))} 字</span>
            </div>
            <h1 className="mt-6 font-serif text-4xl font-black leading-snug tracking-[0.08em]">
              {essay.title}
            </h1>
            {essay.subtitle && (
              <p className="mt-3 font-serif text-lg text-muted-foreground">{essay.subtitle}</p>
            )}
            {essay.tags && essay.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {essay.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border px-3 py-0.5 text-[11px] tracking-wider text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </header>
        </Reveal>

        <div className="hairline mx-auto mt-10 max-w-xs" />

        <article className="measure mx-auto mt-12 font-serif">
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={Math.min(i * 0.03, 0.3)}>
              <p
                className={`mb-7 text-justify text-[17px] leading-[2.1] tracking-[0.02em] ${
                  i === 0 ? "dropcap" : ""
                }`}
              >
                {p}
              </p>
            </Reveal>
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
