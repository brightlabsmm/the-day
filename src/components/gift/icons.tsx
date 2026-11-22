import type { ReactNode } from "react";
import type { GiftIcon } from "@/lib/gift";

/*
 * Colour drawings for gifts, matching the emoji of the original design (🪷 💎 📖
 * 🔮 🎓 🕯️ 🌙 ✍️ 🌿 ✨ 👑) but as SVG, so they look the same on every phone. The
 * exception is 📿 (necklace), which is the emoji itself. Flat fills only (no
 * gradients), so many copies on one page never clash.
 */
const DRAWINGS: Record<GiftIcon, ReactNode> = {
  lotus: (
    <>
      <path d="M12 21C7 21 3 20 1.5 17c3.5.2 7 1.5 10.5 4Z" fill="#4f9a63" />
      <path d="M12 21c5 0 9-1 10.5-4-3.5.2-7 1.5-10.5 4Z" fill="#3d8453" />
      <path d="M12 20C6 19 2 15 2 9c4 1 8 4 10 11Z" fill="#c23a74" />
      <path d="M12 20c6-1 10-5 10-11-4 1-8 4-10 11Z" fill="#c23a74" />
      <path d="M12 20c-5-1.500-7.500-6-6-12 3.500 3 5.500 7 6 12Z" fill="#e8639a" />
      <path d="M12 20c5-1.500 7.500-6 6-12-3.500 3-5.500 7-6 12Z" fill="#e8639a" />
      <path d="M12 20C8 16 7.500 8 12 2c4.500 6 4 14 0 18Z" fill="#ff9fc2" />
      <path d="M12 17c-1.500-4-1.500-8.500 0-12" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".7" strokeLinecap="round" />
    </>
  ),
  gem: (
    <>
      <path d="M6 3h12l5 6-11 13L1 9l5-6Z" fill="#3aa3ff" />
      <path d="M6 3 1 9h22l-5-6H6Z" fill="#8fd2ff" />
      <path d="m12 22 4.500-13H7.500L12 22Z" fill="#1f7bd8" />
      <path d="M8 3 7.500 9 12 3l4 6-.5-6" fill="none" stroke="#e9f6ff" strokeOpacity=".7" strokeWidth=".6" />
    </>
  ),
  book: (
    <>
      <path d="M2 5c3.500-1.500 7-1.500 10 .5v15c-3-2-6.500-2-10-.5V5Z" fill="#fdf3d8" stroke="#b78a3c" strokeWidth=".8" />
      <path d="M22 5c-3.500-1.500-7-1.500-10 .5v15c3-2 6.500-2 10-.5V5Z" fill="#fff9e8" stroke="#b78a3c" strokeWidth=".8" />
      <path d="M4.500 8.500c2-.6 4-.5 6 .3M4.500 11.500c2-.6 4-.5 6 .3M13.500 8.800c2-.8 4-.9 6-.3M13.500 11.800c2-.8 4-.9 6-.3" fill="none" stroke="#9a8a6a" strokeWidth=".8" strokeLinecap="round" />
    </>
  ),
  crystal: (
    <>
      <path d="M6 21h12l-2-3H8l-2 3Z" fill="#6b4a2f" />
      <circle cx="12" cy="11" r="8" fill="#7b4fd6" />
      <path d="M6 12a6 6 0 0 1 6-6.500c-3 2-4 5-3.500 9-1-.5-2-1.500-2.500-2.500Z" fill="#a98bf0" />
      <circle cx="9" cy="8" r="1.600" fill="#fff" fillOpacity=".7" />
      <path d="m15 12 .7 1.500 1.500.7-1.500.7L15 16.400l-.7-1.500-1.500-.7 1.500-.7L15 12Z" fill="#ffe27a" />
    </>
  ),
  cap: (
    <>
      <path d="M12 3 1 9l11 6 11-6-11-6Z" fill="#2f3248" />
      <path d="M6 12v4c0 2 3 3.500 6 3.500s6-1.500 6-3.500v-4l-6 3.300L6 12Z" fill="#454a6b" />
      <path d="M21 10v6" stroke="#f2c24a" strokeWidth="1.300" strokeLinecap="round" />
      <circle cx="21" cy="17.500" r="1.500" fill="#f2c24a" />
    </>
  ),
  flame: (
    <>
      <rect x="8" y="10" width="8" height="12" rx="1.200" fill="#f4e3c1" />
      <rect x="8" y="10" width="3" height="12" rx="1" fill="#fff3d9" />
      <path d="M12 9.500c-3-2-3.500-5-1-8.500 1 2 4.500 3.500 4.500 6.500 0 1.200-1.500 2.500-3.500 2Z" fill="#ff8a2a" />
      <path d="M12 8.500c-1.500-1-1.800-2.500-.5-4.200.6 1 2 1.800 2 3.200 0 .6-.7 1.200-1.500 1Z" fill="#ffd34d" />
    </>
  ),
  moon: <path d="M20 14.500A9 9 0 1 1 9.500 4a7 7 0 0 0 10.500 10.500Z" fill="#ffd54a" stroke="#e0a91f" strokeWidth=".8" />,
  // The original design's own sticker: the real 📿 emoji, drawn by the device's emoji font.
  necklace: (
    <text x="12" y="19.500" fontSize="19" textAnchor="middle" style={{ fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif' }}>
      📿
    </text>
  ),
  pen: (
    <>
      <path d="m3 21 1.500-5L17 3.500 20.500 7 8 19.500 3 21Z" fill="#ffd34d" />
      <path d="m17 3.500 1.600-1.600a1.500 1.500 0 0 1 2.100 0l.4.4a1.500 1.500 0 0 1 0 2.100L19.500 6 17 3.500Z" fill="#f47fa1" />
      <path d="m3 21 1.500-5 3.500 3.500L3 21Z" fill="#f4e3c1" />
      <path d="m3 21 .8-2.600 1.800 1.800L3 21Z" fill="#2f3248" />
    </>
  ),
  leaf: (
    <>
      <path d="M12 22V9" stroke="#2f7d46" strokeWidth="1.500" strokeLinecap="round" />
      <path d="M12 12C6 12 3 8 3 4c5 0 9 3 9 8Z" fill="#4caf64" />
      <path d="M12 9c6 0 9-3.500 9-7.500-5 0-9 2.500-9 7.500Z" fill="#6cc57e" />
      <path d="M12 17c-5 0-7.500-3-7.500-6.500 4.500 0 7.500 2.500 7.500 6.500Z" fill="#3d9a55" />
      <path d="M12 18c4.500 0 7-2.500 7-6-4 0-7 2-7 6Z" fill="#58b86f" />
    </>
  ),
  sparkles: (
    <>
      <path d="m10 3 2 6.500 6.500 2-6.500 2L10 20l-2-6.500-6.500-2L8 9.500 10 3Z" fill="#ffd54a" />
      <path d="m19 2 .9 2.600L22.500 5.500l-2.600.9L19 9l-.9-2.600-2.600-.9 2.600-.9L19 2ZM19 15l.8 2.200 2.200.8-2.200.8L19 21l-.8-2.200-2.200-.8 2.200-.8L19 15Z" fill="#ffe98a" />
    </>
  ),
  crown: (
    <>
      <path d="m2 7 5 5 5-8 5 8 5-5-2 13H4L2 7Z" fill="#f5b81f" stroke="#c98a0c" strokeWidth=".8" strokeLinejoin="round" />
      <path d="M4 17h16v3H4z" fill="#e0a010" />
      <circle cx="12" cy="14" r="1.500" fill="#e8445a" />
      <circle cx="7.500" cy="14.500" r="1" fill="#3aa3ff" />
      <circle cx="16.500" cy="14.500" r="1" fill="#3aa3ff" />
    </>
  ),
  star: <path d="m12 2 3 6.500 7 .8-5.200 4.800 1.400 7L12 17.600 5.800 21.100l1.400-7L2 9.300l7-.8L12 2Z" fill="#ffd54a" stroke="#e0a91f" strokeWidth=".8" strokeLinejoin="round" />,
  gift: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="1.500" fill="#e8445a" />
      <rect x="2" y="6" width="20" height="4.500" rx="1.200" fill="#f26a7d" />
      <rect x="10.500" y="6" width="3" height="15" fill="#ffd54a" />
      <path d="M12 6c-3-.5-5-1.500-5-3 0-2 3.500-1.500 5 3Zm0 0c3-.5 5-1.500 5-3 0-2-3.500-1.500-5 3Z" fill="#ffd54a" />
    </>
  ),
  heart: <path d="M12 21C4 15 2 11 2 7.500A5 5 0 0 1 12 6a5 5 0 0 1 10 1.500C22 11 20 15 12 21Z" fill="#e8445a" />,
  music: (
    <>
      <path d="M9 17V5l11-2v12" fill="none" stroke="#7b4fd6" strokeWidth="1.800" strokeLinejoin="round" />
      <circle cx="6.500" cy="17.500" r="3" fill="#7b4fd6" />
      <circle cx="17.500" cy="15.500" r="3" fill="#7b4fd6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="5" fill="#ffb02e" />
      <path d="M12 1.500v3M12 19.500v3M1.500 12h3M19.500 12h3M4.600 4.600l2.100 2.100M17.300 17.300l2.100 2.100M4.600 19.400l2.100-2.100M17.300 6.700l2.100-2.100" stroke="#ffb02e" strokeWidth="1.600" strokeLinecap="round" />
    </>
  ),
};

/** A gift's colour drawing. */
export function GiftIconView({ icon, className = "" }: { icon: GiftIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {DRAWINGS[icon] ?? DRAWINGS.star}
    </svg>
  );
}

/** The pink lotus of the original design (a drawing, so it matches on every phone). */
export function PinkLotus({ className = "" }: { className?: string }) {
  return <GiftIconView icon="lotus" className={className} />;
}

/**
 * The star on locked petals and nodes: a solid four-point star (✦), or an
 * outline of one (✧) on the astrolabe.
 */
export function LockedStar({ className = "", hollow = false }: { className?: string; hollow?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 1.500c.8 5.200 3.800 8.200 9 9-5.200.8-8.200 3.800-9 9-.8-5.200-3.800-8.200-9-9 5.200-.8 8.200-3.800 9-9Z"
        fill={hollow ? "none" : "currentColor"}
        stroke="currentColor"
        strokeWidth={hollow ? 1.200 : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}
