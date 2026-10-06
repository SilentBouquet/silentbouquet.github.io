import { Link } from "react-router";
import { Plus } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { loadFictions } from "@/lib/fiction";

/** 小说列表页 */
export default function Fiction() {
  const fictions = loadFictions();

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-32">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono-meta text-xs tracking-[0.5em] text-muted-foreground">FICTION</p>
            <h1 className="mt-4 font-serif text-4xl font-black tracking-[0.15em]">小说</h1>
          </div>
          <Link
            to="/write?type=fiction"
            className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-85"
          >
            <Plus size={15} /> 开新篇
          </Link>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          虚构是另一种诚实。关于海、雪、邮件，以及那些不在场的东西。
        </p>
        <div className="hairline mt-10" />

        <div className="mt-4 divide-y divide-border/60">
          {fictions.length === 0 && (
            <div className="py-16 text-center">
              <p className="font-serif text-lg text-foreground/70">这里还没有小说。</p>
              <p className="mt-3 text-sm text-muted-foreground">
                点「开新篇」，让第一个故事从这里开始。
              </p>
            </div>
          )}
          {fictions.map((f) => (
            <Link key={f.slug} to={`/fiction/${f.slug}`} className="group block py-10">
              <div className="flex items-center gap-4">
                <p className="font-mono-meta text-xs text-muted-foreground">{f.date}</p>
                <span
                  className={`rounded-sm border px-2 py-0.5 text-xs tracking-wider ${
                    f.status === "连载中"
                      ? "border-primary/40 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {f.status}
                </span>
                <p className="text-xs text-muted-foreground">{f.genre}</p>
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold tracking-wide transition-colors group-hover:text-primary">
                《{f.title}》
              </h2>
              <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
                {f.intro}
              </p>
              <p className="mt-4 text-xs tracking-[0.3em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                进入阅读 →
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
