"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  { id: "templates", label: "Templates" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" },
];

/** Fixed brand header: script logo, spaced capitals and a three-link nav that marks the section in view. */
export function LandingNav() {
  // Nothing is marked while the hero is in view; a link lights up once its section reaches the middle of the screen.
  const [active, setActive] = useState("");

  useEffect(() => {
    const els = ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const hero = document.querySelector<HTMLElement>(".lp-hero");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target === hero ? "" : e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    [hero, ...els].forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-[#fbf3ea]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-2 px-3 min-[400px]:px-4 sm:px-8 lg:px-6">
        <a href="#top" className="flex items-baseline gap-4" aria-label="The Day, top">
          <span className="script whitespace-nowrap text-[1.6rem] leading-none min-[400px]:text-[1.9rem] sm:text-[2.4rem] text-[#4a413b]">The Day</span>
          <span className="caps2 hidden text-[0.7rem] text-[#6b5f57] sm:inline">Digital Invitations</span>
        </a>
        <nav className="nav flex items-center text-[0.78rem] min-[400px]:text-[0.8rem] sm:text-base" aria-label="Main">
          {ITEMS.map((i) => (
            <a key={i.id} href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}>
              {i.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
