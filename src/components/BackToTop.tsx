import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** 回到顶部：滚动超过一屏后浮现 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="回到顶部"
      className="fixed bottom-8 right-8 z-50 rounded-full border border-border bg-card/90 p-3 text-muted-foreground shadow-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
    >
      <ArrowUp size={17} />
    </button>
  );
}
