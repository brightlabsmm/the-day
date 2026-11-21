// "Leaving paper behind": paper envelope + its glowing blue ghost. node docs/branding/make-glow-cover.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
const W = 1640, H = 624;

const env = (w, h) => `M${-w/2} ${-h/2} H${w/2} V${h/2} H${-w/2} Z`;
const dots = Array.from({ length: 70 }, (_, i) => {
  const t = i / 70, x = 600 + t * 330 + Math.sin(i * 12.9) * 18, y = 250 + Math.cos(i * 7.3) * 110 * (0.4 + t);
  const r = 1 + ((i * 37) % 10) / 4;
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#9fc4ff" opacity="${(0.25 + t * 0.6).toFixed(2)}"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="bg" cx="55%" cy="48%" r="70%"><stop offset="0" stop-color="#0b1230"/><stop offset="1" stop-color="#030409"/></radialGradient>
  <linearGradient id="paperG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8dcc2"/><stop offset="1" stop-color="#a9987a"/></linearGradient>
  <linearGradient id="flapG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e7cf"/><stop offset="1" stop-color="#bfae8f"/></linearGradient>
  <radialGradient id="seal" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#f6d98a"/><stop offset=".5" stop-color="#c9922e"/><stop offset="1" stop-color="#6e4a0e"/></radialGradient>
  <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2f4dff" stop-opacity=".75"/><stop offset="1" stop-color="#2f4dff" stop-opacity="0"/></radialGradient>
  <filter id="b30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="b12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="smear" x="-80%" y="-50%" width="260%" height="200%"><feGaussianBlur stdDeviation="46 3"/></filter>
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 0"/></filter>
  <pattern id="halftone" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.3" fill="#5f86ff"/></pattern>
  <linearGradient id="fadeR" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="hmask"><rect x="640" y="130" width="250" height="330" fill="url(#fadeR)"/></mask>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>

<!-- blue halo behind the ghost -->
<ellipse cx="830" cy="300" rx="260" ry="210" fill="url(#halo)" filter="url(#b30)"/>
<!-- halftone dissolve between paper and ghost -->
<rect x="640" y="130" width="250" height="330" fill="url(#halftone)" mask="url(#hmask)" opacity=".7"/>
<!-- light smear trailing back toward the paper -->
<g filter="url(#smear)" opacity=".85"><path d="${env(250,150)}" transform="translate(760 300) rotate(-4)" fill="#bcd0ff"/></g>

<!-- the ghost: glowing blue-white envelope -->
<g transform="translate(830 296) rotate(-4)">
  <path d="${env(300,190)}" fill="#2a49ff" filter="url(#b30)" opacity=".9"/>
  <path d="${env(290,182)}" fill="#6f90ff" filter="url(#b12)"/>
  <path d="${env(280,172)}" fill="#fff" filter="url(#b4)"/>
  <path d="M-140 -86 L0 20 L140 -86" fill="none" stroke="#6f8cff" stroke-width="5" stroke-linejoin="round" filter="url(#b4)"/>
  <path d="M0 62 C-30 38 -30 10 -10 6 C-3 4 0 12 0 18 C0 12 3 4 10 6 C30 10 30 38 0 62Z" fill="#4a68ff" opacity=".85" filter="url(#b4)"/>
</g>
${dots}

<!-- the real paper envelope, left behind -->
<g transform="translate(480 330) rotate(-8)">
  <ellipse cx="6" cy="102" rx="150" ry="16" fill="#000" opacity=".7" filter="url(#shadow)"/>
  <rect x="-62" y="-118" width="124" height="150" rx="6" fill="#efe5cd" stroke="#a8977a" transform="rotate(5) translate(8 -6)"/>
  <rect x="-115" y="-72" width="230" height="146" rx="8" fill="url(#paperG)" stroke="#8d7c60" stroke-width="1.4"/>
  <path d="M-113 74 L-34 14 M113 74 L34 14" stroke="#b8a888" stroke-width="1.4" fill="none"/>
  <path d="M-113 -69 L0 22 L113 -69 Z" fill="url(#flapG)" stroke="#8d7c60" stroke-width="1.4" stroke-linejoin="round"/>
  <circle cx="0" cy="20" r="22" fill="url(#seal)" stroke="#6e4a0e" stroke-width="1.4"/>
  <path d="M0 31 C-13 22 -13 10 -6 9 C-2 8.500 0 11 0 14 C0 11 2 8.500 6 9 C13 10 13 22 0 31Z" fill="#7a540f" opacity=".9"/>
</g>

<!-- text -->
<g text-anchor="middle">
  <text x="1215" y="262" font-family="Snell Roundhand" font-weight="700" font-size="92" fill="#4a6bff" filter="url(#b12)">The Day</text>
  <text x="1215" y="262" font-family="Snell Roundhand" font-weight="700" font-size="92" fill="#fff">The Day</text>
  <text x="1215" y="318" font-family="Futura" font-weight="500" font-size="20" letter-spacing="3.500" fill="#d7e2ff">FROM PAPER TO PHONE</text>
  <text x="1215" y="346" font-family="Futura" font-size="12" letter-spacing="3.400" fill="#8fa8ee">DIGITAL WEDDING INVITATIONS</text>
</g>
<text x="300" y="120" font-family="Snell Roundhand" font-style="italic" font-size="24" fill="#4f78ff">goodbye to paper, hello to phone</text>

<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".16"/>
</svg>`;

await writeFile("docs/branding/glow-cover.svg", svg);
await sharp(Buffer.from(svg), { density: 72 }).resize(1640, 624).png().toFile("docs/branding/glow-cover-1640x624.png");
await sharp(Buffer.from(svg), { density: 144 }).resize(3280, 1248).png().toFile("docs/branding/glow-cover-3280x1248.png");
console.log("done");
