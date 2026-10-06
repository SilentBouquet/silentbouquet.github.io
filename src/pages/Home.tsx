import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, PenLine } from "lucide-react";
import StarCanvas from "@/components/StarCanvas";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import { site } from "@/content/types";
import { loadNotes } from "@/lib/notes";
import { loadFictions } from "@/lib/fiction";
import { useEssays } from "@/hooks/useEssays";
import { countWords, formatCount, readingTime } from "@/lib/format";

export default function Home() {
  const { list } = useEssays();
  const essays = list();
  const featured = essays.slice(0, 3);
  const notes = loadNotes().slice(0, 3);
  const fiction = loadFictions()[0];
  const totalWords =
    essays.reduce((s, e) => s + countWords(e.body), 0) +
    loadNotes().reduce((s, n) => s + countWords(n.text), 0) +
    loadFictions().reduce((s, f) => s + f.chapters.reduce((a, c) => a + countWords(c.body), 0), 0);

  const stats = [
    { n: essays.length, label: "文章" },
    { n: loadNotes().length, label: "笔记" },
    { n: loadFictions().length, label: "小说" },
    { n: formatCount(totalWords), label: "字数" },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* ── 卷首：深海夜空 ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-night-950 grain">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,hsl(212_60%_22%)_0%,hsl(218_45%_7%)_60%)]" />
        <StarCanvas />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,hsl(210_60%_18%/0.5),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ocean-300/50 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center px-6 text-center"
        >
          <p className="font-mono-meta text-[11px] tracking-[0.5em] text-ocean-200/70">
            SILENTBOUQUET · A READER & WRITER'S HARBOR
          </p>
          <h1 className="text-gradient-sea mt-6 font-serif text-5xl font-black leading-tight tracking-[0.12em] sm:text-7xl">
            深海与星空之间
          </h1>
          <p className="mt-2 font-latin text-xl italic tracking-wide text-ocean-200/80">
            Between the Deep Sea and the Stars
          </p>
          <p className="measure mt-8 font-serif text-base leading-loose text-paper/70">
            {site.manifesto}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/essays"
              className="group flex items-center gap-2 rounded-full bg-paper px-7 py-3 text-sm tracking-[0.3em] text-night-950 transition-all hover:-translate-y-0.5 hover:bg-ocean-100"
            >
              开始阅读
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/write"
              className="flex items-center gap-2 rounded-full border border-paper/25 px-7 py-3 text-sm tracking-[0.3em] text-paper/80 transition-all hover:-translate-y-0.5 hover:border-paper/50 hover:text-paper"
            >
              <PenLine size={14} /> 去写作
            </Link>
          </div>

          {/* 统计 */}
          <div className="mt-14 flex items-center gap-8 sm:gap-12">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.12 }}
                className="text-center"
              >
                <p className="font-latin text-2xl font-semibold text-paper sm:text-3xl">{s.n}</p>
                <p className="mt-1 text-[11px] tracking-[0.4em] text-paper/50">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 z-10 animate-drift text-paper/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
            <path d="M10 0v26M3 19l7 8 7-8" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.div>
      </section>

      {/* ── 壹 · 精选文章 ── */}
      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="kicker">壹 · ESSAYS</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-[0.15em]">精选文章</h2>
            </div>
            <Link to="/essays" className="group flex items-center gap-1.5 text-sm tracking-[0.2em] text-primary">
              全部
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.length === 0 && (
            <p className="text-sm leading-relaxed text-muted-foreground md:col-span-3">
              文章正在路上——它们将被安放在写作间与仓库的 src/content/essays/ 目录。
            </p>
          )}
          {featured.map((e, i) => (
            <Reveal key={e.slug} delay={i * 0.08} className="h-full">
              <Link
                to={`/essays/${e.slug}`}
                className="card-lift flex h-full flex-col rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-accent/80 px-2.5 py-0.5 text-[11px] tracking-[0.2em] text-primary">{e.category}</span>
                  <span className="font-mono-meta text-[11px] text-muted-foreground">{e.date}</span>
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold leading-snug tracking-wide">{e.title}</h3>
                {e.subtitle && <p className="mt-1 font-serif text-sm text-muted-foreground">{e.subtitle}</p>}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{e.excerpt}</p>
                <p className="mt-4 font-mono-meta text-[11px] text-muted-foreground/70">
                  {readingTime(e.body)} · {formatCount(countWords(e.body))} 字
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 贰 · 笔记与小说 ── */}
      <section className="bg-secondary/40">
        <div className="mx-auto grid max-w-5xl gap-14 px-6 py-24 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="kicker">贰 · NOTES</p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-[0.15em]">最新笔记</h2>
              </div>
              <Link to="/notes" className="group flex items-center gap-1.5 text-sm tracking-[0.2em] text-primary">
                全部
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-8 space-y-4">
              {notes.length === 0 && <p className="text-sm text-muted-foreground">笔记簿还是空白页。</p>}
              {notes.map((n) => (
                <div key={n.id} className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-mono-meta text-[11px] text-muted-foreground">{n.date}</p>
                    {n.tags.length > 0 && (
                      <div className="flex gap-2">
                        {n.tags.map((t) => (
                          <span key={t} className="rounded-full bg-accent/70 px-2 py-0.5 text-[10px] tracking-wider text-primary">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-[1.9]">{n.text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={0.1}>
            <p className="kicker">叁 · FICTION</p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-[0.15em]">正在写的小说</h2>
            {fiction ? (
              <Link
                to={`/fiction/${fiction.slug}`}
                className="card-lift group relative mt-8 block overflow-hidden rounded-xl border border-border bg-card p-7"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(210_60%_30%/0.10),transparent_60%)]" />
                <div className="relative flex items-center gap-2.5">
                  <span className="rounded-full border border-primary/40 bg-accent/60 px-2.5 py-0.5 text-[11px] tracking-wider text-primary">{fiction.status}</span>
                  <span className="font-mono-meta text-[11px] text-muted-foreground">{fiction.date}</span>
                </div>
                <h3 className="relative mt-4 font-serif text-2xl font-bold tracking-wide transition-colors group-hover:text-primary">
                  《{fiction.title}》
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {fiction.intro}
                </p>
                <p className="relative mt-5 flex items-center gap-1.5 text-xs tracking-[0.3em] text-primary">
                  进入阅读
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            ) : (
              <p className="mt-8 text-sm text-muted-foreground">第一篇小说尚未开篇。</p>
            )}
            <Link to="/fiction" className="mt-5 inline-flex items-center gap-1.5 text-sm tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
              全部小说
              <ArrowRight size={13} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── 卷尾引文 ── */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <Reveal>
          <p className="font-latin text-5xl leading-none text-primary/25">"</p>
          <blockquote className="mt-2 font-serif text-xl leading-loose tracking-wide text-foreground/90">
            有两种东西，我对它们的思考越是深沉和持久，
            <br />
            它们在我心灵中唤起的惊奇和敬畏就会日新月异，不断增长——
            <br />
            这就是我头上的星空和心中的道德律。
          </blockquote>
          <p className="mt-6 font-mono-meta text-xs tracking-[0.3em] text-muted-foreground">
            伊曼努尔 · 康德 · 《实践理性批判》
          </p>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
