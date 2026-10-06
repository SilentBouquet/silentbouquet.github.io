import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { notes } from "@/content/notes";

/** 笔记页：时间线式碎片 */
export default function Notes() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-32">
        <p className="font-mono-meta text-xs tracking-[0.5em] text-muted-foreground">NOTES</p>
        <h1 className="mt-4 font-serif text-4xl font-black tracking-[0.15em]">笔记</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          碎片化的思考：读书时的批注、值班后的感想、雪与海的片刻。不成体系，拒绝收编。
        </p>
        <div className="hairline mt-10" />

        <div className="mt-12 space-y-10">
          {notes.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              笔记簿还是空白页——第一片碎片落下时，会出现在这里。
            </p>
          )}
          {notes.map((n) => (
            <article key={n.id} className="group flex gap-6">
              <div className="hidden w-16 shrink-0 pt-1 text-right font-mono-meta text-xs text-muted-foreground sm:block">
                {n.date}
              </div>
              <div className="relative border-l-2 border-border pl-6 transition-colors group-hover:border-primary/50">
                <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-border transition-colors group-hover:bg-primary" />
                <p className="font-mono-meta text-xs text-muted-foreground sm:hidden">{n.date}</p>
                <p className="mt-1 text-[15px] leading-[1.9]">{n.text}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {n.tags.map((t) => (
                    <span key={t} className="text-xs tracking-wider text-primary/70">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
