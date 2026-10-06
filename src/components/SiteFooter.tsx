import { site } from "@/content/types";

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-night-950 text-paper/70 grain">
      {/* 海面般的渐变 */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ocean-500/60 to-transparent" />
      <div className="relative mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-serif text-xl font-bold tracking-[0.3em] text-paper">SilentBouquet</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-paper/60">
              {site.tagline}
            </p>
          </div>
          <p className="font-latin text-sm italic text-ocean-200/70">
            "The stars are not afraid to appear like fireflies."
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-paper/10 pt-6 text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono-meta">
            © SilentBouquet · 手工打磨于深海与星空之间
          </p>
          <p className="tracking-[0.2em]">笔记 · 文章 · 小说</p>
        </div>
      </div>
    </footer>
  );
}
