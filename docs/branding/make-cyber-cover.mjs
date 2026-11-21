// "From paper to phone": a neon cover for the Facebook page. Draws an SVG and renders PNGs.
//   node docs/branding/make-cyber-cover.mjs
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
const r = rng(11);
const gauss = () => (r() + r() + r() + r() - 2) / 2;
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const CREAM = [247, 240, 226], GOLD = [255, 209, 102], ROSE = [255, 92, 154], CYAN = [92, 242, 255];

// Pixels peeling off the card edge and streaming into the phone.
function stream() {
  const out = [];
  for (let i = 0; i < 230; i++) {
    const t = Math.pow(r(), 0.85);
    const x = 1016 + t * 120;
    const spread = 100 * Math.pow(1 - t, 1.4) + 6;
    const y = 296 + Math.sin(t * Math.PI * 2) * 16 + gauss() * spread;
    const size = 13 * (1 - t) + 2.5 + r() * 2.5;
    let c = t < 0.35 ? mix(CREAM, GOLD, t / 0.35) : t < 0.75 ? mix(GOLD, ROSE, (t - 0.35) / 0.4) : mix(ROSE, CYAN, (t - 0.75) / 0.25);
    if (r() < 0.07) c = CYAN;
    out.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" fill="${hex(c)}" opacity="${(0.55 + r() * 0.45).toFixed(2)}" transform="rotate(${(r() * 40 - 20).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
  }
  return out.join("");
}

function stars() {
  const rs = rng(5);
  return Array.from({ length: 70 }, () => {
    const x = rs() * W, y = rs() * 440, s = 1 + rs() * 2;
    return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" fill="#ffffff" opacity="${(0.12 + rs() * 0.4).toFixed(2)}"/>`;
  }).join("");
}

function floor() {
  const vx = 820, hy = 478;
  const v = Array.from({ length: 25 }, (_, k) => {
    const bx = vx + (k - 12) * 150;
    return `<line x1="${vx}" y1="${hy}" x2="${bx}" y2="${H}"/>`;
  }).join("");
  const h = [8, 20, 38, 62, 94, 134].map((d) => `<line x1="0" y1="${hy + d}" x2="${W}" y2="${hy + d}"/>`).join("");
  return `<g stroke="#ff5c9a" stroke-width="1.2" opacity=".2">${v}${h}</g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06060f"/><stop offset=".6" stop-color="#110a24"/><stop offset="1" stop-color="#1c0f32"/></linearGradient>
  <radialGradient id="glowPhone" cx="1205" cy="300" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff5c9a" stop-opacity=".42"/><stop offset="1" stop-color="#ff5c9a" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowCard" cx="920" cy="300" r="240" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd166" stop-opacity=".22"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowText" cx="520" cy="270" r="360" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7a2cff" stop-opacity=".22"/><stop offset="1" stop-color="#7a2cff" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowBig" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="shadow" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#000" flood-opacity=".6"/></filter>
</defs>

<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#glowText)"/>
<rect width="${W}" height="${H}" fill="url(#glowPhone)"/>
<rect width="${W}" height="${H}" fill="url(#glowCard)"/>
${stars()}
${floor()}

<!-- TEXT -->
<g transform="translate(28 0)">
  <text x="292" y="256" font-family="Snell Roundhand" font-weight="700" font-size="124" fill="#ff5c9a" filter="url(#glowBig)">The Day</text>
  <text x="292" y="256" font-family="Snell Roundhand" font-weight="700" font-size="124" fill="#fff2f8">The Day</text>
  <path d="M298 290 H520" stroke="#ff5c9a" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
  <text x="296" y="340" font-family="Futura" font-weight="500" font-size="27" letter-spacing="4.2" fill="#ffd166" filter="url(#glowSoft)">FROM PAPER TO PHONE</text>
  <text x="297" y="378" font-family="Futura" font-weight="400" font-size="15" letter-spacing="4.2" fill="#e9e2fb" opacity=".92">DIGITAL WEDDING INVITATIONS</text>
</g>

<!-- PAPER: envelope and card -->
<g filter="url(#shadow)" transform="translate(42 0)">
  <g transform="translate(-50 22) rotate(-7 855 355)">
    <rect x="780" y="300" width="165" height="112" rx="6" fill="#efe4d0" stroke="#8a7a62" stroke-width="2"/>
    <path d="M782 303 L862 360 L943 303" fill="#f6eddc" stroke="#8a7a62" stroke-width="2" stroke-linejoin="round"/>
    <path d="M782 410 L838 348 M943 410 L887 348" stroke="#b5a68c" stroke-width="1.5"/>
    <circle cx="862" cy="358" r="15" fill="#e7b94f" stroke="#b78a2c" stroke-width="2"/>
    <path d="M862 366 C853 360 853 351 858 350 C860 349.500 862 351 862 353 C862 351 864 349.500 866 350 C871 351 871 360 862 366Z" fill="#b78a2c"/>
  </g>
  <g transform="rotate(6 920 292)">
    <rect x="852" y="196" width="136" height="186" rx="7" fill="#f8f1e3" stroke="#8a7a62" stroke-width="2"/>
    <rect x="860" y="204" width="120" height="170" rx="4" fill="none" stroke="#c9b894" stroke-width="1"/>
    <rect x="893" y="222" width="54" height="3.500" rx="1.700" fill="#a99a80"/>
    <path d="M884 258 Q900 238 918 256 T952 252" fill="none" stroke="#6f6252" stroke-width="2.600" stroke-linecap="round"/>
    <path d="M880 280 Q898 262 916 280 T958 276" fill="none" stroke="#6f6252" stroke-width="2.600" stroke-linecap="round"/>
    <path d="M920 322 C909 314 909 303 915 302 C918 301.500 920 303.500 920 306 C920 303.500 922 301.500 925 302 C931 303 931 314 920 322Z" fill="#d9a441"/>
    <rect x="896" y="346" width="48" height="3.500" rx="1.700" fill="#a99a80"/>
  </g>
</g>

<!-- DISSOLVE: paper turns into pixels, then light -->
<g filter="url(#glowSoft)">${stream()}</g>
<g fill="none" stroke-linecap="round" filter="url(#glow)">
  <path d="M1030 300 C1060 262 1095 338 1138 298" stroke="#ff5c9a" stroke-width="3"/>
  <path d="M1030 296 C1062 330 1098 262 1138 302" stroke="#ffd166" stroke-width="2.500"/>
  <path d="M1030 304 C1062 296 1100 308 1138 300" stroke="#5cf2ff" stroke-width="2"/>
</g>

<!-- PHONE -->
<g>
  <ellipse cx="1205" cy="300" rx="128" ry="168" fill="none" stroke="#5cf2ff" stroke-width="1.400" stroke-dasharray="3 9" opacity=".55" transform="rotate(-12 1205 300)"/>
  <rect x="1135" y="172" width="140" height="256" rx="30" fill="#0d0820" stroke="#ff5c9a" stroke-width="5" filter="url(#glowBig)"/>
  <rect x="1135" y="172" width="140" height="256" rx="30" fill="none" stroke="#ffd1e3" stroke-width="2"/>
  <rect x="1147" y="186" width="116" height="228" rx="19" fill="#150c2e" stroke="#ffd166" stroke-width="1.500" opacity=".95"/>
  <rect x="1186" y="193" width="38" height="7" rx="3.500" fill="#ff5c9a" opacity=".8"/>
  <!-- invitation on the screen -->
  <rect x="1163" y="222" width="84" height="116" rx="8" fill="#1f1340" stroke="#ffd166" stroke-width="1.800" filter="url(#glowSoft)"/>
  <path d="M1205 306 C1190 295 1190 280 1198 278.500 C1202 278 1205 281 1205 284 C1205 281 1208 278 1212 278.500 C1220 280 1220 295 1205 306Z" fill="#ff5c9a" filter="url(#glow)"/>
  <rect x="1179" y="318" width="52" height="3" rx="1.500" fill="#ffd166" opacity=".8"/>
  <rect x="1188" y="326" width="34" height="3" rx="1.500" fill="#ffd166" opacity=".5"/>
  <rect x="1176" y="240" width="58" height="3.500" rx="1.700" fill="#e9e2fb" opacity=".7"/>
  <rect x="1186" y="248" width="38" height="3" rx="1.500" fill="#e9e2fb" opacity=".45"/>
  <rect x="1181" y="362" width="48" height="26" rx="13" fill="#ff5c9a" opacity=".9" filter="url(#glowSoft)"/>
  <text x="1205" y="379.500" text-anchor="middle" font-family="Futura" font-size="11" font-weight="500" letter-spacing="1.500" fill="#fff">OPEN</text>
  <rect x="1195" y="404" width="20" height="3.500" rx="1.700" fill="#ffd1e3" opacity=".7"/>
</g>

<!-- feature chips -->
<g font-family="Futura" font-size="13" font-weight="500" letter-spacing="2.200" text-anchor="middle">
  <g filter="url(#glowSoft)" fill="none" stroke-width="1.800">
    <rect x="1292" y="222" width="86" height="30" rx="15" stroke="#5cf2ff"/>
    <rect x="1292" y="290" width="86" height="30" rx="15" stroke="#ffd166"/>
    <rect x="1292" y="358" width="86" height="30" rx="15" stroke="#ff5c9a"/>
  </g>
  <g stroke-width="1.200" stroke-dasharray="2 5" fill="none" opacity=".6">
    <path d="M1275 237 H1292" stroke="#5cf2ff"/><path d="M1275 305 H1292" stroke="#ffd166"/><path d="M1275 373 H1292" stroke="#ff5c9a"/>
  </g>
  <text x="1335" y="241" fill="#d9fcff">QR GIFT</text>
  <text x="1335" y="309" fill="#fff0c8">EN · MY</text>
  <text x="1335" y="377" fill="#ffd9e8">RSVP</text>
</g>

<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;

await writeFile("docs/branding/cyber-cover.svg", svg);
await sharp(Buffer.from(svg), { density: 72 }).resize(1640, 624).png().toFile("docs/branding/cyber-cover-1640x624.png");
await sharp(Buffer.from(svg), { density: 144 }).resize(3280, 1248).png().toFile("docs/branding/cyber-cover-3280x1248.png");

// Preview: how Facebook crops it on a phone (centre) and where the profile circle sits on a computer.
const mobile = await sharp("docs/branding/cyber-cover-1640x624.png").extract({ left: 265, top: 0, width: 1110, height: 624 }).resize(740).png().toBuffer();
await sharp(mobile).toFile("docs/branding/cyber-cover-phone-crop.png");
console.log("done");
