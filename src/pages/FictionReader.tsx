import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { Moon, Sun } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import ReadingProgress from "@/components/ReadingProgress";
import StarCanvas from "@/components/StarCanvas";
import { fictions } from "@/content/fictions";

/**
 * 小说阅读页：支持「夜航模式」——深海夜空下的沉浸阅读
 */
export default function FictionReader() {
  const { slug } = useParams();
  const work = fictions.find((f) => f.slug === slug);
  const [night, setNight] = useState(false);
  const [chapter, setChapter] = useState(0);

  if (!work) return <Navigate to="/fiction" replace />;
  const ch = work.chapters[chapter];

  if (night) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-night-950 text-paper/90">
        <ReadingProgress />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,hsl(212_55%_20%)_0%,hsl(218_45%_7%)_65%)]" />
        <StarCanvas density={0.00008} />
        <div className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-10">
          <div className="flex items-center justify-between text-xs">
            <Link to="/fiction" className="tracking-[0.3em] text-ocean-200/70 hover:text-ocean-200">
              ← 返回
            </Link>
            <button
              onClick={() => setNight(false)}
              className="flex items-center gap-2 rounded-sm border border-paper/20 px-3 py-1.5 tracking-[0.2em] text-paper/70 transition-colors hover:border-paper/50 hover:text-paper"
            >
              <Sun size={13} /> 白昼模式
            </button>
          </div>

          <header className="mt-16 text-center">
            <p className="font-latin text-sm italic tracking-widest text-ocean-200/70">
              《{work.title}》
            </p>
            <h1 className="mt-6 font-serif text-3xl font-bold tracking-[0.2em] text-starlight">
              {ch.title}
            </h1>
          </header>

          <article className="measure mx-auto mt-14">
            {ch.body.split("\n\n").map((p, i) => (
              <p key={i} className={`mb-7 text-justify text-[17px] leading-[2.2] text-paper/85 ${i === 0 ? "dropcap" : ""}`}>
                {p}
              </p>
            ))}
          </article>

          <ChapterNav
            total={work.chapters.length}
            current={chapter}
            onSelect={setChapter}
            dark
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <SiteNav />
      <main className="mx-auto max-w-2xl px-6 pb-10 pt-32">
        <div className="flex items-center justify-between">
          <Link to="/fiction" className="text-xs tracking-[0.3em] text-muted-foreground hover:text-foreground">
            ← 返回小说
          </Link>
          <button
            onClick={() => setNight(true)}
            className="flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-xs tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Moon size={13} /> 夜航模式
          </button>
        </div>

        <header className="mt-12 text-center">
          <p className="font-latin text-sm italic tracking-widest text-muted-foreground">
            《{work.title}》
          </p>
          <h1 className="mt-6 font-serif text-3xl font-bold tracking-[0.2em]">{ch.title}</h1>
          <p className="mt-3 font-mono-meta text-xs text-muted-foreground">
            {work.genre} · {work.status} · 共 {work.chapters.length} 章
          </p>
        </header>

        <div className="hairline mx-auto mt-10 max-w-xs" />

        <article className="measure mx-auto mt-12">
          {ch.body.split("\n\n").map((p, i) => (
            <p key={i} className={`mb-7 text-justify text-[17px] leading-[2.2] ${i === 0 ? "dropcap" : ""}`}>
              {p}
            </p>
          ))}
        </article>

        <ChapterNav total={work.chapters.length} current={chapter} onSelect={setChapter} />
      </main>
      <SiteFooter />
    </div>
  );
}

function ChapterNav({
  total,
  current,
  onSelect,
  dark,
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
  dark?: boolean;
}) {
  const base = dark ? "border-paper/20 text-paper/60 hover:border-paper/50 hover:text-paper"
    : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary";
  return (
    <nav className="mt-16 flex items-center justify-center gap-3">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => {
            onSelect(i);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`rounded-sm border px-4 py-2 text-sm tracking-widest transition-colors ${
            i === current
              ? dark
                ? "border-ocean-300/60 bg-ocean-500/15 text-ocean-200"
                : "border-primary/60 bg-accent text-primary"
              : base
          }`}
        >
          {i + 1}
        </button>
      ))}
    </nav>
  );
}
