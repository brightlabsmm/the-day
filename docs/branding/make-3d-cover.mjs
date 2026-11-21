// "From paper to phone", minimal 3D look. Draws an SVG with depth (gradients, bevels, shadows) and renders PNGs.
//   node docs/branding/make-3d-cover.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 1640, H = 624;
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r = rng(21);
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const hex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
const shade = (c, k) => c.map((v) => Math.round(v * k));
const CREAM = [250, 243, 228], GOLD = [255, 209, 102], ROSE = [255, 92, 154];

/** A small 3D cube: lit top, front, darker side. */
function cube(x, y, s, c) {
  const d = s * 0.5;
  const top = `${x},${y} ${x + d},${y - d * 0.7} ${x + s + d},${y - d * 0.7} ${x + s},${y}`;
  const side = `${x + s},${y} ${x + s + d},${y - d * 0.7} ${x + s + d},${y + s - d * 0.7} ${x + s},${y + s}`;
  return `<g><rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${hex(c)}"/><polygon points="${top}" fill="${hex(shade(c, 1.12))}"/><polygon points="${side}" fill="${hex(shade(c, 0.7))}"/></g>`;
}

// Cubes break off the card's right edge and flow into the phone along a gentle arc.
function cubes() {
  const out = [];
  for (let i = 0; i < 46; i++) {
    const t = (i + r() * 0.9) / 46;
    const x = 984 + t * 176;
    const base = 296 - Math.sin(t * Math.PI * 1.2) * 30;
    const spread = 64 * Math.pow(1 - t, 1.3) + 8;
    const y = base + (r() + r() - 1) * spread;
    const s = 12 * (1 - t) + 3.5 + r() * 2;
    const c = t < 0.3 ? mix(CREAM, GOLD, t / 0.3) : mix(GOLD, ROSE, Math.min(1, (t - 0.3) / 0.7));
    out.push({ t, svg: cube(+x.toFixed(1), +y.toFixed(1), +s.toFixed(1), c) });
  }
  return out.sort((a, b) => a.t - b.t).map((o) => o.svg).join("");
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07061a"/><stop offset=".7" stop-color="#120a26"/><stop offset="1" stop-color="#1b0f31"/></linearGradient>
  <radialGradient id="gPhone" cx="1250" cy="300" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff5c9a" stop-opacity=".36"/><stop offset="1" stop-color="#ff5c9a" stop-opacity="0"/></radialGradient>
  <radialGradient id="gEnv" cx="930" cy="330" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd166" stop-opacity=".2"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5c9a" stop-opacity=".07"/><stop offset="1" stop-color="#ff5c9a" stop-opacity="0"/></linearGradient>
  <linearGradient id="envBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e3d2b2"/></linearGradient>
  <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#eadbbd"/></linearGradient>
  <linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#efe3c9"/></linearGradient>
  <radialGradient id="seal" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#fff0b8"/><stop offset=".45" stop-color="#e9b94c"/><stop offset="1" stop-color="#8f6212"/></radialGradient>
  <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe3ee"/><stop offset=".45" stop-color="#f58bb0"/><stop offset="1" stop-color="#8b2b58"/></linearGradient>
  <linearGradient id="side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d1f45"/><stop offset="1" stop-color="#3a0f27"/></linearGradient>
  <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1858"/><stop offset="1" stop-color="#120a2b"/></linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowBig" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>

<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#gPhone)"/>
<rect width="${W}" height="${H}" fill="url(#gEnv)"/>
<rect y="470" width="${W}" height="${H - 470}" fill="url(#floor)"/>
<line x1="0" y1="470" x2="${W}" y2="470" stroke="#ff5c9a" stroke-opacity=".08" stroke-width="1"/>

<!-- TEXT -->
<g transform="translate(28 0)">
  <text x="292" y="254" font-family="Snell Roundhand" font-weight="700" font-size="118" fill="#ff5c9a" filter="url(#glowBig)">The Day</text>
  <text x="292" y="254" font-family="Snell Roundhand" font-weight="700" font-size="118" fill="#fff2f8">The Day</text>
  <path d="M298 288 H500" stroke="#ff5c9a" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
  <text x="296" y="338" font-family="Futura" font-weight="500" font-size="27" letter-spacing="4.2" fill="#ffd166" filter="url(#glowSoft)">FROM PAPER TO PHONE</text>
  <text x="297" y="376" font-family="Futura" font-weight="400" font-size="15" letter-spacing="4.2" fill="#e9e2fb" opacity=".92">DIGITAL WEDDING INVITATIONS</text>
</g>

<!-- PAPER (3D envelope with the invitation card rising from it) -->
<g transform="translate(34 0)">
  <ellipse cx="925" cy="452" rx="130" ry="15" fill="#000" opacity=".55" filter="url(#soft)"/>
  <!-- card, behind the envelope -->
  <g transform="rotate(5 925 270)">
    <rect x="860" y="203" width="136" height="184" rx="7" fill="#d7c7a6" transform="translate(5 5)"/>
    <rect x="860" y="203" width="136" height="184" rx="7" fill="url(#card)" stroke="#b9a881" stroke-width="1.4"/>
    <rect x="868" y="211" width="120" height="168" rx="4" fill="none" stroke="#d2c19c" stroke-width="1"/>
    <rect x="900" y="230" width="56" height="3.500" rx="1.700" fill="#b3a487"/>
    <path d="M890 262 Q906 242 924 260 T958 256" fill="none" stroke="#7d6f5a" stroke-width="2.600" stroke-linecap="round"/>
    <path d="M886 284 Q904 266 922 284 T964 280" fill="none" stroke="#7d6f5a" stroke-width="2.600" stroke-linecap="round"/>
    <path d="M928 326 C917 318 917 307 923 306 C926 305.500 928 307.500 928 310 C928 307.500 930 305.500 933 306 C939 307 939 318 928 326Z" fill="#d9a441"/>
  </g>
  <!-- envelope body: front face plus thickness -->
  <g transform="rotate(-6 925 380)">
    <rect x="828" y="328" width="190" height="122" rx="8" fill="#bfae8a" transform="translate(5 6)"/>
    <rect x="828" y="328" width="190" height="122" rx="8" fill="url(#envBody)" stroke="#b9a881" stroke-width="1.4"/>
    <path d="M830 448 L902 384 M1016 448 L944 384" stroke="#cdbd9a" stroke-width="1.4" fill="none"/>
    <path d="M830 331 L923 398 L1016 331 Z" fill="url(#envFlap)" stroke="#b9a881" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M834 335 L923 399 L1012 335" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.400"/>
    <ellipse cx="923" cy="404" rx="21" ry="5" fill="#000" opacity=".25" filter="url(#glowSoft)"/>
    <circle cx="923" cy="397" r="19" fill="url(#seal)" stroke="#8f6212" stroke-width="1.400"/>
    <circle cx="923" cy="397" r="13" fill="none" stroke="#fff3c4" stroke-opacity=".6" stroke-width="1.200"/>
    <path d="M923 405 C912 398 912 388 918 387 C921 386.500 923 388.500 923 391 C923 388.500 925 386.500 928 387 C934 388 934 398 923 405Z" fill="#a97813" opacity=".9"/>
    <ellipse cx="916" cy="389" rx="6" ry="3.500" fill="#fff" opacity=".45" transform="rotate(-30 916 389)"/>
  </g>
</g>

<!-- TRANSFORMATION: paper breaks into small 3D cubes that become light -->
<g filter="url(#glowSoft)">${cubes()}</g>
<g fill="none" stroke-linecap="round" filter="url(#glow)">
  <path d="M990 296 C1060 246 1110 346 1160 298" stroke="#ff5c9a" stroke-width="2.600"/>
  <path d="M990 302 C1066 346 1116 252 1160 304" stroke="#ffd166" stroke-width="2.200"/>
</g>

<!-- PHONE (3D slab with a rose-gold bevel) -->
<g transform="translate(-20 0) rotate(-5 1255 305)">
  <ellipse cx="1262" cy="458" rx="86" ry="12" fill="#000" opacity=".6" filter="url(#soft)"/>
  <rect x="1178" y="168" width="150" height="272" rx="32" fill="none" stroke="#ff5c9a" stroke-width="7" opacity=".95" filter="url(#glowBig)"/>
  <rect x="1190" y="178" width="150" height="272" rx="32" fill="url(#side)"/>
  <rect x="1180" y="168" width="150" height="272" rx="32" fill="url(#frame)"/>
  <rect x="1186" y="174" width="138" height="260" rx="27" fill="#07040f"/>
  <rect x="1192" y="180" width="126" height="248" rx="22" fill="url(#screen)"/>
  <rect x="1236" y="187" width="38" height="8" rx="4" fill="#07040f"/>
  <!-- the invitation on the screen -->
  <rect x="1210" y="222" width="90" height="128" rx="9" fill="#1d1142" stroke="#ffd166" stroke-width="1.800" filter="url(#glowSoft)"/>
  <path d="M1255 312 C1238 301 1238 284 1247 282 C1252 281.500 1255 284.500 1255 288 C1255 284.500 1258 281.500 1263 282 C1272 284 1272 301 1255 312Z" fill="#ff5c9a" filter="url(#glow)"/>
  <rect x="1228" y="238" width="54" height="3.500" rx="1.700" fill="#e9e2fb" opacity=".75"/>
  <rect x="1238" y="246" width="34" height="3" rx="1.500" fill="#e9e2fb" opacity=".45"/>
  <rect x="1231" y="326" width="48" height="3" rx="1.500" fill="#ffd166" opacity=".8"/>
  <rect x="1237" y="334" width="36" height="3" rx="1.500" fill="#ffd166" opacity=".5"/>
  <rect x="1229" y="372" width="52" height="26" rx="13" fill="#ff5c9a" filter="url(#glowSoft)"/>
  <text x="1255" y="389" text-anchor="middle" font-family="Futura" font-size="11" font-weight="500" letter-spacing="1.500" fill="#fff">OPEN</text>
  <!-- glass reflection -->
  <path d="M1192 180 H1270 L1192 300 Z" fill="url(#sheen)"/>
</g>

<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;

await writeFile("docs/branding/neon3d-cover.svg", svg);
await sharp(Buffer.from(svg), { density: 72 }).resize(1640, 624).png().toFile("docs/branding/neon3d-cover-1640x624.png");
await sharp(Buffer.from(svg), { density: 144 }).resize(3280, 1248).png().toFile("docs/branding/neon3d-cover-3280x1248.png");
await sharp("docs/branding/neon3d-cover-1640x624.png").extract({ left: 265, top: 0, width: 1110, height: 624 }).resize(740).png().toFile("docs/branding/neon3d-cover-phone-crop.png");
console.log("done");
