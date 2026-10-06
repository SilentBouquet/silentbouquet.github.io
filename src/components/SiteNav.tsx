import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Droplets, Feather } from "lucide-react";

const PALETTE_KEY = "silentbouquet:palette";

type Palette = "blue" | "paper";

function readPalette(): Palette {
  return (localStorage.getItem(PALETTE_KEY) as Palette) || "blue";
}

function applyPalette(p: Palette) {
  if (p === "blue") {
    document.documentElement.dataset.palette = "blue";
  } else {
    delete document.documentElement.dataset.palette;
  }
  localStorage.setItem(PALETTE_KEY, p);
}

const links = [
  { to: "/", label: "首页" },
  { to: "/notes", label: "笔记" },
  { to: "/essays", label: "文章" },
  { to: "/fiction", label: "小说" },
  { to: "/about", label: "关于" },
];

/** 顶部导航：透明叠在首页夜空上，滚动后变为底色；含淡蓝/纸白主题切换 */
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [palette, setPalette] = useState<Palette>("blue");
  const { pathname } = useLocation();
  const onNight = pathname === "/";

  useEffect(() => {
    const p = readPalette();
    setPalette(p);
    applyPalette(p);
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const togglePalette = () => {
    const next: Palette = palette === "blue" ? "paper" : "blue";
    setPalette(next);
    applyPalette(next);
  };

  const darkText = !onNight || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-[0_1px_0_0_hsl(var(--border))]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          to="/"
          className={`group flex items-baseline gap-2 font-serif text-lg font-bold tracking-[0.2em] transition-colors ${
            darkText ? "text-foreground" : "text-paper"
          }`}
        >
          SilentBouquet
          <span
            className={`hidden font-latin text-xs tracking-widest transition-colors sm:inline ${
              darkText ? "text-muted-foreground" : "text-ocean-200/80"
            }`}
          >
            深海与星空之间
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm tracking-[0.15em] transition-colors ${
                  darkText
                    ? isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                    : isActive
                      ? "text-starlight font-medium"
                      : "text-paper/70 hover:text-paper"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={togglePalette}
            title={palette === "blue" ? "切换为纸白" : "切换为淡蓝"}
            className={`ml-1 rounded p-2 transition-colors ${
              darkText
                ? "text-muted-foreground hover:bg-accent hover:text-primary"
                : "text-paper/70 hover:bg-paper/10 hover:text-paper"
            }`}
          >
            {palette === "blue" ? <Droplets size={16} /> : <Feather size={16} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
