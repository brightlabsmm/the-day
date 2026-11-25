"use client";

/*
 * Lotus Pollen & Sacred Stardust Particle System (ကြာပန်းဝတ်မှုံ လွင့်ပျံသည့် animation)
 * 1. Continuous Ambient Floating: Gentle golden & rose pollen grains and stardust
 *    always floating in the background (visible on the pond and behind the card modal).
 * 2. Wide, Slow Blossom Burst: When a petal or core is unlocked, a majestic cloud of
 *    glowing pollen spores bursts outward slowly, expands widely across the screen,
 *    and floats leisurely upward (5 - 8 seconds duration).
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type PollenOptions = {
  count?: number;
  spread?: number;
  speed?: number;
  colorTheme?: "gold" | "lotus" | "all";
};

export type PollenEmitter = {
  burst: (x: number, y: number, options?: PollenOptions) => void;
  celebrate: (centerX?: number, centerY?: number) => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobblePhase: number;
  twinkleSpeed: number;
  kind: "pollen" | "sparkle" | "spore";
  coreColor: string;
  glowColor: string;
  isAmbient?: boolean;
};

const PALETTES = {
  gold: [
    { core: "rgba(255, 252, 235, ALPHA)", glow: "rgba(248, 226, 162, ALPHA)" },
    { core: "rgba(254, 240, 138, ALPHA)", glow: "rgba(229, 193, 108, ALPHA)" },
    { core: "rgba(253, 224, 71, ALPHA)", glow: "rgba(217, 119, 6, ALPHA)" },
  ],
  lotus: [
    { core: "rgba(255, 240, 245, ALPHA)", glow: "rgba(244, 114, 182, ALPHA)" },
    { core: "rgba(254, 205, 211, ALPHA)", glow: "rgba(230, 168, 184, ALPHA)" },
    { core: "rgba(255, 250, 220, ALPHA)", glow: "rgba(248, 226, 162, ALPHA)" },
  ],
};

const AMBIENT_COUNT = 45;

export const PollenCanvas = forwardRef<PollenEmitter, { className?: string }>(function PollenCanvas(
  { className = "" },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ambientParticlesRef = useRef<Particle[]>([]);
  const burstParticlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize continuous ambient floating pollen spores
  const initAmbient = (width: number, height: number) => {
    const list: Particle[] = [];
    const allColors = [...PALETTES.gold, ...PALETTES.lotus];

    for (let i = 0; i < AMBIENT_COUNT; i++) {
      const pair = allColors[i % allColors.length];
      const isSparkle = i % 5 === 0;
      const isSpore = i % 3 === 0;

      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 8, // gentle horizontal drift
        vy: -(Math.random() * 18 + 10), // slow upward float
        size: isSparkle ? 2.0 + Math.random() * 1.5 : isSpore ? 1.2 + Math.random() * 1.0 : 1.8 + Math.random() * 1.6,
        alpha: 0,
        maxAlpha: 0.35 + Math.random() * 0.45,
        life: Math.random() * 8,
        maxLife: 8 + Math.random() * 6,
        wobbleSpeed: 0.8 + Math.random() * 1.6,
        wobbleAmp: 0.8 + Math.random() * 1.4,
        wobblePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 2.5 + Math.random() * 4,
        kind: isSparkle ? "sparkle" : isSpore ? "spore" : "pollen",
        coreColor: pair.core,
        glowColor: pair.glow,
        isAmbient: true,
      });
    }
    ambientParticlesRef.current = list;
  };

  const startLoop = () => {
    if (animFrameRef.current !== null) return;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = null;
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animFrameRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Render & update ambient continuous particles
      const ambient = ambientParticlesRef.current;
      for (let i = 0; i < ambient.length; i++) {
        const p = ambient[i];
        p.life += dt;
        p.y += p.vy * dt;
        const sway = Math.sin(p.life * p.wobbleSpeed + p.wobblePhase) * p.wobbleAmp;
        p.x += (p.vx + sway * 12) * dt;

        // Wrap around vertically & horizontally
        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
          p.life = 0;
        }
        if (p.x < -30) p.x = canvas.width + 20;
        if (p.x > canvas.width + 30) p.x = -20;

        // Breathing twinkle
        const breathe = 0.5 + 0.5 * Math.sin(p.life * p.twinkleSpeed + p.wobblePhase);
        const a = Math.max(0, Math.min(1, p.maxAlpha * breathe));

        drawParticle(ctx, p, a);
      }

      // 2. Render & update wide, slow blossom burst particles
      const bursts = burstParticlesRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          bursts.splice(i, 1);
          continue;
        }

        // Slower air drag: floats widely and leisurely
        p.vx *= Math.pow(0.93, dt * 60);
        p.vy *= Math.pow(0.95, dt * 60);
        p.vy -= 16 * dt; // slow, gentle upward thermal rise

        // Wide organic horizontal sway
        const sway = Math.sin(p.life * p.wobbleSpeed + p.wobblePhase) * p.wobbleAmp * 60 * dt;
        p.x += p.vx * 60 * dt + sway;
        p.y += p.vy * 60 * dt;

        // Opacity curve: gentle fade-in, long slow fade-out, delicate twinkle
        const progress = p.life / p.maxLife;
        let a = progress < 0.15 ? p.maxAlpha * (progress / 0.15) : p.maxAlpha * (1 - (progress - 0.15) / 0.85);
        const twinkle = 0.8 + 0.2 * Math.sin(p.life * p.twinkleSpeed);
        a = Math.max(0, Math.min(1, a * twinkle));

        drawParticle(ctx, p, a);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle, a: number) => {
    if (a <= 0.005) return;
    const core = p.coreColor.replace("ALPHA", a.toFixed(3));
    const glow = p.glowColor.replace("ALPHA", (a * 0.7).toFixed(3));
    const fade = p.glowColor.replace("ALPHA", "0");

    if (p.kind === "sparkle") {
      // 4-pointed golden sparkle glint
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * 0.8 + p.wobblePhase);
      ctx.fillStyle = core;
      ctx.beginPath();
      const s = p.size * 2.4;
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(0, 0, s * 0.7, 0);
      ctx.quadraticCurveTo(0, 0, 0, s);
      ctx.quadraticCurveTo(0, 0, -s * 0.7, 0);
      ctx.quadraticCurveTo(0, 0, 0, -s);
      ctx.fill();
      ctx.restore();
    } else {
      // Glowing soft lotus pollen orb
      const rad = p.size * (p.kind === "pollen" ? 3.0 : 2.0);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
      grad.addColorStop(0, core);
      grad.addColorStop(0.35, glow);
      grad.addColorStop(1, fade);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const burst = (originX: number, originY: number, options: PollenOptions = {}) => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Wide, slow, majestic lotus pollen burst
    const count = options.count ?? 80;
    const speedBase = options.speed ?? 1.8; // significantly slower
    const theme = options.colorTheme ?? "all";
    const palette =
      theme === "all"
        ? [...PALETTES.gold, ...PALETTES.lotus]
        : theme === "lotus"
          ? PALETTES.lotus
          : PALETTES.gold;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      // Wide dispersion: almost full 360 spread with gentle upward lift
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (options.spread ?? Math.PI * 1.85);
      const spd = (Math.random() * 1.5 + 0.4) * speedBase;
      const pair = palette[Math.floor(Math.random() * palette.length)];

      const isSparkle = i % 4 === 0;
      const isSpore = i % 3 === 0;

      newParticles.push({
        x: originX + (Math.random() - 0.5) * 32, // wide spawn radius
        y: originY + (Math.random() - 0.5) * 32,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: isSparkle ? 2.8 + Math.random() * 2.0 : isSpore ? 1.6 + Math.random() * 1.4 : 2.4 + Math.random() * 2.2,
        alpha: 0,
        maxAlpha: 0.85 + Math.random() * 0.15,
        life: 0,
        maxLife: 4.8 + Math.random() * 3.2, // much longer lifespan: 4.8s - 8.0s
        wobbleSpeed: 1.2 + Math.random() * 2.2, // leisurely sway
        wobbleAmp: 1.2 + Math.random() * 1.8,
        wobblePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 4.5 + Math.random() * 6,
        kind: isSparkle ? "sparkle" : isSpore ? "spore" : "pollen",
        coreColor: pair.core,
        glowColor: pair.glow,
      });
    }

    burstParticlesRef.current.push(...newParticles);
    startLoop();
  };

  const celebrate = (centerX?: number, centerY?: number) => {
    const cx = centerX ?? window.innerWidth / 2;
    const cy = centerY ?? window.innerHeight / 2;

    // Grand celestial spiral bloom across the entire sanctuary
    burst(cx, cy, { count: 70, spread: Math.PI * 2, speed: 2.4, colorTheme: "gold" });
    window.setTimeout(() => {
      burst(cx, cy - 25, { count: 75, spread: Math.PI * 2, speed: 2.8, colorTheme: "lotus" });
    }, 200);
    window.setTimeout(() => {
      burst(cx, cy - 50, { count: 65, spread: Math.PI * 1.9, speed: 2.2, colorTheme: "gold" });
    }, 450);
  };

  useImperativeHandle(ref, () => ({ burst, celebrate }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    initAmbient(window.innerWidth, window.innerHeight);
    startLoop();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[45] size-full ${className}`}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
});
