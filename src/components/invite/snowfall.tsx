"use client";

import { useEffect, useRef } from "react";

/*
 * Falling snow over the whole invitation, drawn as real six-armed snowflakes.
 *
 * Each flake design is an SVG, rasterised once to an image and then drawn on a
 * single canvas, so even 80 spinning flakes stay smooth on phones. Flakes are
 * white with a clear cool-grey border so they read clearly on cream paper. Snow
 * starts the first time the guest scrolls; scrolling makes it drift faster.
 * Purely decorative: no pointer events, hidden from screen readers, and off
 * for anyone who prefers reduced motion.
 */

/** One arm of a flake, repeated six times around the centre. */
const ARMS: string[] = [
  // Fern: a main spoke with two pairs of side branches and a tip fork
  "M50 50V9 M50 34l-9-8 M50 34l9-8 M50 22l-7-6 M50 22l7-6 M50 12l-4-4 M50 12l4-4",
  // Star: spoke with a diamond near the tip
  "M50 50V12 M50 18l-6 6 6 6 6-6Z M50 38l-6-5 M50 38l6-5",
  // Plate: short spoke ending in a small hexagon-like crown
  "M50 50V14 M43 22h14 M45 30l5-4 5 4 M50 14l-5-5 M50 14l5-5",
];

function flakeSvg(arm: string): string {
  const arms = Array.from({ length: 6 }, (_, i) => `<path d="${arm}" transform="rotate(${i * 60} 50 50)"/>`).join("");
  // Under-stroke in cool grey gives the outline; white over it is the flake.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="rgb(84,100,128)" stroke-opacity="0.9" stroke-width="7">${arms}<circle cx="50" cy="50" r="5"/></g>
      <g stroke="#ffffff" stroke-width="4.2">${arms}<circle cx="50" cy="50" r="5" fill="#fff"/></g>
    </g>
  </svg>`;
}

type Flake = {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  spin: number;
  angle: number;
  alpha: number;
  sprite: number; // index into sprites, or -1 for a soft round flake
};

export function Snowfall() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let started = false;
    let opacity = 0;
    let boost = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    const flakes: Flake[] = [];
    const sprites: HTMLImageElement[] = ARMS.map((arm) => {
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(flakeSvg(arm))}`;
      return img;
    });

    const make = (anywhere: boolean): Flake => {
      const shaped = Math.random() < 0.62;
      const size = shaped ? 9 + Math.random() * 11 : 3 + Math.random() * 3;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -size - Math.random() * 40,
        size,
        // Bigger flakes are "closer": they fall a little faster.
        speed: 26 + size * 1.6 + Math.random() * 22,
        sway: 10 + Math.random() * 26,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.4,
        angle: Math.random() * Math.PI * 2,
        alpha: 0.92 + Math.random() * 0.08,
        sprite: shaped ? Math.floor(Math.random() * sprites.length) : -1,
      };
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      el!.width = Math.round(w * dpr);
      el!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Keep existing flakes (phones resize as the address bar hides); only top up or trim.
      const count = Math.round(0.7 * Math.min(90, Math.max(40, (w * h) / 13000)));
      if (flakes.length > count) flakes.length = count;
      while (flakes.length < count) flakes.push(make(true));
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      opacity = Math.min(1, opacity + dt * 0.9);
      boost *= 0.93;
      ctx!.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.phase += dt * 1.1;
        f.angle += f.spin * dt;
        f.y += (f.speed + boost * (f.size / 4)) * dt;
        f.x += Math.sin(f.phase) * f.sway * dt;
        if (f.y > h + f.size || f.x < -40 || f.x > w + 40) Object.assign(f, make(false));
        ctx!.globalAlpha = f.alpha * opacity;
        const img = f.sprite >= 0 ? sprites[f.sprite] : null;
        if (img && img.complete && img.naturalWidth) {
          ctx!.save();
          ctx!.translate(f.x, f.y);
          ctx!.rotate(f.angle);
          ctx!.drawImage(img, -f.size / 2, -f.size / 2, f.size, f.size);
          ctx!.restore();
        } else {
          // Soft round flake with a faint cool edge.
          ctx!.beginPath();
          ctx!.arc(f.x, f.y, f.size / 2, 0, Math.PI * 2);
          ctx!.fillStyle = "#ffffff";
          ctx!.shadowColor = "rgba(84,100,128,0.6)";
          ctx!.shadowBlur = 3;
          ctx!.fill();
          ctx!.shadowBlur = 0;
          // A thin cool-grey rim so a white flake still shows on cream paper.
          ctx!.lineWidth = 0.7;
          ctx!.strokeStyle = "rgba(84,100,128,0.8)";
          ctx!.stroke();
        }
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (started) return;
      started = true;
      resize();
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function onScroll() {
      const y = window.scrollY;
      boost = Math.min(60, boost + Math.abs(y - lastY) * 0.12);
      lastY = y;
      start();
    }

    function onVisibility() {
      if (!started) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[55] h-full w-full" />;
}
