import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  drift: number;
}

/** 深海夜空星 Canvas：星星呼吸闪烁，偶有流星 */
export default function StarCanvas({ density = 0.00012 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: Star[] = [];
    let meteor: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextMeteorAt = performance.now() + 4000 + Math.random() * 6000;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(rect.width * rect.height * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 0.03,
      }));
    };

    const tick = (t: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const s of stars) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase + (t / 1000) * s.speed));
        s.x += s.drift;
        if (s.x < 0) s.x = rect.width;
        if (s.x > rect.width) s.x = 0;
        ctx.globalAlpha = tw;
        ctx.fillStyle = "#cfe4ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 流星
      if (!meteor && t > nextMeteorAt) {
        meteor = {
          x: Math.random() * rect.width * 0.7,
          y: Math.random() * rect.height * 0.3,
          vx: 5 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 1,
        };
      }
      if (meteor) {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= 0.02;
        const grad = ctx.createLinearGradient(
          meteor.x,
          meteor.y,
          meteor.x - meteor.vx * 10,
          meteor.y - meteor.vy * 10
        );
        grad.addColorStop(0, `rgba(220, 236, 255, ${meteor.life})`);
        grad.addColorStop(1, "rgba(220, 236, 255, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.vx * 10, meteor.y - meteor.vy * 10);
        ctx.stroke();
        if (meteor.life <= 0 || meteor.x > rect.width + 100) {
          meteor = null;
          nextMeteorAt = t + 6000 + Math.random() * 10000;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
