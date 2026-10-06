import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft, BookOpen, Moon, Sun } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ReadingProgress from "@/components/ReadingProgress";
import StarCanvas from "@/components/StarCanvas";
import { loadFictions } from "@/lib/fiction";
import { countWords, formatCount, readingTime } from "@/lib/format";

/**
 * 小说阅读页：章节侧栏 + 「夜航模式」沉浸阅读
 */
export default function FictionReader() {
  const { slug } = useParams();
  const work = loadFictions().find((f) => f.slug === slug);
  const [night, setNight] = useState(false);
  const [chapter, setChapter] = useState(0);

  if (!work) return <Navigate to="/fiction" replace />;
  const ch = work.chapters[chapter];
  const totalWords = work.chapters.reduce((s, c) => s + countWords(c.body), 0);

  const goto = (i: number) => {
    setChapter(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const body = (
    <article className="measure font-serif">
      {ch.body.split("\n\n").map((p, i) => (
        <p key={i} className={`mb-7 text-justify text-[17px] leading-[2.2] ${i === 0 ? "dropcap" : ""}`}>
          {p}
        </p>
      ))}
    </article>
  );

  const chapterNav = (
    <nav className="mt-14 flex items-center justify-center gap-2">
      {work.chapters.map((c, i) => (
        <button
          key={i}
          onClick={() => goto(i)}
          title={c.title}
          className={`max-w-32 truncate rounded-full border px-4 py-1.5 text-xs tracking-widest transition-all ${
            i === chapter
              ? "border-primary/60 bg-accent text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
        >
          {c.title}
        </button>
      ))}
    </nav>
  );

  if (night) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-night-950 text-paper/90">
        <ReadingProgress />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,hsl(212_55%_20%)_0%,hsl(218_45%_7%)_65%)]" />
        <StarCanvas density={0.00008} />
        <div className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-8">
          <div className="flex items-center justify-between text-xs">
            <Link to="/fiction" className="flex items-center gap-1.5 tracking-[0.25em] text-ocean-200/70 hover:text-ocean-200">
              <ArrowLeft size={13} /> 返回
            </Link>
            <button
              onClick={() => setNight(false)}
              className="flex items-center gap-2 rounded-full border border-paper/20 px-4 py-1.5 tracking-[0.2em] text-paper/70 transition-colors hover:border-paper/50 hover:text-paper"
            >
              <Sun size={13} /> 白昼
            </button>
          </div>

          <header className="mt-16 text-center">
            <p className="font-latin text-sm italic tracking-widest text-ocean-200/70">《{work.title}》</p>
            <h1 className="mt-6 font-serif text-3xl font-bold tracking-[0.2em] text-starlight">{ch.title}</h1>
          </header>

          <div className="measure mx-auto mt-14 text-paper/85">{body}</div>
          {chapterNav}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 pb-10 pt-28">
        <div className="flex items-center justify-between">
          <Link to="/fiction" className="flex items-center gap-1.5 text-xs tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft size={13} /> 小说
          </Link>
          <button
            onClick={() => setNight(true)}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Moon size={13} /> 夜航模式
          </button>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-4">
          {/* 章节目录 */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
              <p className="flex items-center gap-2 text-xs tracking-[0.25em] text-muted-foreground">
                <BookOpen size={13} className="text-primary" /> 目录
              </p>
              <p className="mt-3 font-serif text-lg font-bold leading-snug">《{work.title}》</p>
              <p className="mt-1 font-mono-meta text-[11px] text-muted-foreground">
                {work.genre} · {work.status} · 共 {work.chapters.length} 章 · {formatCount(totalWords)} 字
              </p>
              <div className="mt-4 space-y-1">
                {work.chapters.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => goto(i)}
                    className={`block w-full truncate rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      i === chapter
                        ? "bg-accent font-medium text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 正文 */}
          <div className="lg:col-span-3">
            <header className="text-center">
              <p className="font-mono-meta text-xs text-muted-foreground">
                {work.date} · {readingTime(ch.body)}
              </p>
              <h1 className="mt-4 font-serif text-3xl font-bold tracking-[0.15em]">{ch.title}</h1>
            </header>
            <div className="hairline mx-auto mt-8 max-w-xs" />
            <div className="mx-auto mt-10">{body}</div>
            {chapterNav}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
