import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Droplets, Feather, Moon, Sun } from "lucide-react";

const PALETTE_KEY = "silentbouquet:palette";
const THEME_KEY = "silentbouquet:theme";

type Palette = "blue" | "paper";

function readPalette(): Palette {
  return ((typeof localStorage !== "undefined" && localStorage.getItem(PALETTE_KEY)) as Palette) || "blue";
}

function applyPalette(p: Palette) {
  if (p === "blue") {
    document.documentElement.dataset.palette = "blue";
  } else {
    delete document.documentElement.dataset.palette;
  }
  localStorage.setItem(PALETTE_KEY, p);
}

function readTheme(): "light" | "dark" {
  const t = typeof localStorage !== "undefined" && localStorage.getItem(THEME_KEY);
  return t === "dark" ? "dark" : "light";
}

function applyTheme(t: "light" | "dark", animate = true) {
  const apply = () => {
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem(THEME_KEY, t);
  };
  if (animate) {
    document.documentElement.classList.add("theming");
    apply();
    setTimeout(() => document.documentElement.classList.remove("theming"), 400);
  } else {
    apply();
  }
}

const links = [
  { to: "/", label: "首页" },
  { to: "/notes", label: "笔记" },
  { to: "/essays", label: "文章" },
  { to: "/fiction", label: "小说" },
  { to: "/about", label: "关于" },
];

/** 顶部导航：首页夜空透明、滚动毛玻璃；主题切换 */
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [palette, setPalette] = useState<Palette>("blue");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { pathname } = useLocation();
  const onNight = pathname === "/";

  useEffect(() => {
    const p = readPalette();
    const t = readTheme();
    setPalette(p);
    setTheme(t);
    applyPalette(p);
    applyTheme(t, false);
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

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const darkText = !onNight || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          to="/"
          className={`group flex items-baseline gap-2 font-serif text-lg font-bold tracking-[0.15em] transition-colors ${
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
        <div className="flex items-center gap-0.5 sm:gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm tracking-[0.1em] transition-all ${
                  darkText
                    ? isActive
                      ? "text-primary font-medium bg-accent/70"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    : isActive
                      ? "text-starlight font-medium bg-paper/10"
                      : "text-paper/70 hover:text-paper hover:bg-paper/10"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {theme === "light" && (
            <button
              onClick={togglePalette}
              title={palette === "blue" ? "白昼：淡蓝（点击切换纸白）" : "白昼：纸白（点击切换淡蓝）"}
              className={`ml-1 rounded-full p-2 transition-colors ${
                darkText
                  ? "text-muted-foreground hover:bg-accent hover:text-primary"
                  : "text-paper/70 hover:bg-paper/10 hover:text-paper"
              }`}
            >
              {palette === "blue" ? <Droplets size={15} /> : <Feather size={15} />}
            </button>
          )}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "切换为白昼" : "切换为深海暗夜"}
            className={`rounded-full p-2 transition-colors ${
              darkText
                ? "text-muted-foreground hover:bg-accent hover:text-primary"
                : "text-paper/70 hover:bg-paper/10 hover:text-paper"
            }`}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link
            to="/write"
            className={`ml-2 hidden rounded-full px-4 py-1.5 text-sm tracking-[0.15em] transition-all sm:block ${
              darkText
                ? "bg-primary text-primary-foreground hover:opacity-85"
                : "bg-paper text-night-950 hover:bg-ocean-100"
            }`}
          >
            写作
          </Link>
        </div>
      </nav>
    </header>
  );
}
