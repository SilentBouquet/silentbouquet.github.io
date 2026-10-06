import { Link } from "react-router";
import { motion } from "framer-motion";
import StarCanvas from "@/components/StarCanvas";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { site } from "@/content/types";
import { notes } from "@/content/notes";
import { fictions } from "@/content/fictions";
import { useEssays } from "@/hooks/useEssays";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

export default function Home() {
  const { list } = useEssays();
  const featured = list().slice(0, 3);
  const latestNotes = notes.slice(0, 3);
  const latestFiction = fictions[0];

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* ── 卷首：深海夜空 ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-night-950 grain">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,hsl(212_60%_22%)_0%,hsl(218_45%_7%)_60%)]" />
        <StarCanvas />
        {/* 海面微光 */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,hsl(210_60%_18%/0.5),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-ocean-300/50 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center px-6 text-center"
        >
          <p className="font-mono-meta text-xs tracking-[0.5em] text-ocean-200/70">DEEP SEA · STARS</p>
          <h1 className="mt-6 font-serif text-5xl font-black leading-tight tracking-[0.12em] text-paper sm:text-7xl">
            深海与星空之间
          </h1>
          <p className="mt-2 font-latin text-xl italic tracking-wide text-ocean-200/80">
            Between the Deep Sea and the Stars
          </p>
          <p className="measure mt-10 text-base leading-loose text-paper/70">
            {site.manifesto}
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/essays"
              className="rounded-sm border border-ocean-300/40 bg-ocean-500/10 px-6 py-2.5 text-sm tracking-[0.3em] text-ocean-200 transition-colors hover:bg-ocean-500/25"
            >
              开始阅读
            </Link>
            <Link
              to="/about"
              className="rounded-sm border border-paper/20 px-6 py-2.5 text-sm tracking-[0.3em] text-paper/70 transition-colors hover:border-paper/50 hover:text-paper"
            >
              关于我
            </Link>
          </div>
        </motion.div>

        {/* 向下箭头 */}
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

      {/* ── 精选文章 ── */}
      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <motion.div {...fadeUp}>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl font-bold tracking-[0.2em]">精选文章</h2>
            <Link to="/essays" className="text-sm tracking-[0.2em] text-primary hover:underline underline-offset-4">
              全部 →
            </Link>
          </div>
          <div className="hairline mt-6" />
        </motion.div>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {featured.length === 0 && (
            <p className="text-sm leading-relaxed text-muted-foreground md:col-span-3">
              文章正在路上——它们将被安放在 <code className="font-mono-meta text-xs bg-accent px-1.5 py-0.5 rounded">src/content/essays/</code> 目录。
            </p>
          )}
          {featured.map((e, i) => (
            <motion.div key={e.slug} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.12 }}>
              <Link to={`/essays/${e.slug}`} className="group block">
                <p className="font-mono-meta text-xs text-muted-foreground">
                  {e.date} · {e.category}
                </p>
                <h3 className="mt-3 font-serif text-xl font-bold leading-snug tracking-wide transition-colors group-hover:text-primary">
                  {e.title}
                </h3>
                {e.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{e.subtitle}</p>
                )}
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {e.excerpt}
                </p>
                <p className="mt-4 text-xs tracking-[0.3em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  阅读全文
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 最新笔记 & 小说 ── */}
      <section className="bg-secondary/50">
        <div className="mx-auto grid max-w-5xl gap-16 px-6 py-24 lg:grid-cols-5">
          <motion.div className="lg:col-span-3" {...fadeUp}>
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-3xl font-bold tracking-[0.2em]">最新笔记</h2>
              <Link to="/notes" className="text-sm tracking-[0.2em] text-primary hover:underline underline-offset-4">
                全部 →
              </Link>
            </div>
            <div className="mt-8 space-y-8">
              {latestNotes.length === 0 && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  笔记簿还是空白页。
                </p>
              )}
              {latestNotes.map((n) => (
                <div key={n.id} className="border-l-2 border-border pl-5">
                  <p className="font-mono-meta text-xs text-muted-foreground">{n.date}</p>
                  <p className="mt-2 text-sm leading-relaxed">{n.text}</p>
                  <div className="mt-2 flex gap-2">
                    {n.tags.map((t) => (
                      <span key={t} className="text-xs tracking-wider text-primary/70">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="lg:col-span-2" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
            <h2 className="font-serif text-3xl font-bold tracking-[0.2em]">正在写的小说</h2>
            {latestFiction ? (
              <Link
                to={`/fiction/${latestFiction.slug}`}
                className="group relative mt-8 block overflow-hidden rounded-sm border border-border bg-card p-8 transition-shadow hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(210_60%_30%/0.10),transparent_60%)]" />
                <p className="relative font-mono-meta text-xs text-muted-foreground">
                  {latestFiction.genre} · {latestFiction.date}
                </p>
                <h3 className="relative mt-3 font-serif text-2xl font-bold tracking-wide transition-colors group-hover:text-primary">
                  《{latestFiction.title}》
                </h3>
                <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
                  {latestFiction.intro}
                </p>
                <p className="relative mt-6 text-xs tracking-[0.3em] text-primary">进入阅读 →</p>
              </Link>
            ) : (
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                第一篇小说尚未开篇。
              </p>
            )}
            <Link
              to="/fiction"
              className="mt-6 block text-sm tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              全部小说 →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 卷尾引文 ── */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <motion.div {...fadeUp}>
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
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}
