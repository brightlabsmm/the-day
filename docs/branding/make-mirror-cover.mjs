// "Paper | Digital": a symmetrical mirror-room cover. Hexagon chambers, icy chrome light, mist, floor reflections.
//   node docs/branding/make-mirror-cover.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 1640, H = 624;
const CL = { x: 452, y: 292 }, CR = { x: 1188, y: 292 }; // chamber centres
const R = 196;

const hexPts = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90); // pointy top
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const poly = (pts) => pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");

/** A mirrored hexagon tunnel: rings shrink toward the centre, edges link the corners. */
function chamber(cx, cy, id) {
  const rings = [R, R * 0.8, R * 0.62, R * 0.46, R * 0.32, R * 0.2, R * 0.1];
  const outer = hexPts(cx, cy, R), inner = hexPts(cx, cy, R * 0.1);
  const edges = outer.map((p, i) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${inner[i][0].toFixed(1)}" y2="${inner[i][1].toFixed(1)}"/>`).join("");
  return `
  <g id="${id}">
    <polygon points="${poly(outer)}" fill="url(#glass)"/>
    <g fill="none" stroke="#bff4ff" stroke-linejoin="round">
      ${rings.map((rr, i) => `<polygon points="${poly(hexPts(cx, cy, rr))}" stroke-width="${i === 0 ? 3 : 1.4}" opacity="${(0.95 - i * 0.11).toFixed(2)}"/>`).join("")}
      <g stroke-width="1.2" opacity=".5">${edges}</g>
    </g>
    <polygon points="${poly(outer)}" fill="none" stroke="#e8fbff" stroke-width="3.500" filter="url(#glowSoft)"/>
    <polygon points="${poly(hexPts(cx, cy, R * 0.1))}" fill="#d8f8ff" opacity=".5" filter="url(#glow)"/>
  </g>`;
}

// ---- the two objects, drawn around their own centres ----
const paper = `
  <g id="paper">
    <ellipse cx="0" cy="124" rx="118" ry="13" fill="#000" opacity=".55" filter="url(#soft)"/>
    <g transform="rotate(5 0 -50)">
      <rect x="-62" y="-130" width="124" height="168" rx="7" fill="#cdbd9b" transform="translate(5 5)"/>
      <rect x="-62" y="-130" width="124" height="168" rx="7" fill="url(#card)" stroke="#a8977a" stroke-width="1.4"/>
      <rect x="-54" y="-122" width="108" height="152" rx="4" fill="none" stroke="#cdbc97" stroke-width="1"/>
      <rect x="-24" y="-104" width="48" height="3.500" rx="1.700" fill="#a99a80"/>
      <path d="M-34 -72 Q-18 -90 0 -74 T34 -78" fill="none" stroke="#6f6252" stroke-width="2.500" stroke-linecap="round"/>
      <path d="M-38 -52 Q-20 -68 -2 -52 T40 -56" fill="none" stroke="#6f6252" stroke-width="2.500" stroke-linecap="round"/>
      <path d="M0 -8 C-11 -16 -11 -27 -5 -28 C-2 -28.500 0 -26.500 0 -24 C0 -26.500 2 -28.500 5 -28 C11 -27 11 -16 0 -8Z" fill="#d9a441"/>
    </g>
    <g transform="rotate(-6 0 70)">
      <rect x="-98" y="14" width="196" height="118" rx="8" fill="#b9a883" transform="translate(5 6)"/>
      <rect x="-98" y="14" width="196" height="118" rx="8" fill="url(#envBody)" stroke="#a8977a" stroke-width="1.4"/>
      <path d="M-96 130 L-26 68 M96 130 L26 68" stroke="#cdbd9a" stroke-width="1.4" fill="none"/>
      <path d="M-96 17 L0 84 L96 17 Z" fill="url(#envFlap)" stroke="#a8977a" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M-90 21 L0 85 L90 21" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.400"/>
      <ellipse cx="0" cy="90" rx="21" ry="5" fill="#000" opacity=".25"/>
      <circle cx="0" cy="83" r="19" fill="url(#seal)" stroke="#8f6212" stroke-width="1.400"/>
      <circle cx="0" cy="83" r="13" fill="none" stroke="#fff3c4" stroke-opacity=".6" stroke-width="1.200"/>
      <path d="M0 91 C-11 84 -11 74 -5 73 C-2 72.500 0 74.500 0 77 C0 74.500 2 72.500 5 73 C11 74 11 84 0 91Z" fill="#a97813" opacity=".9"/>
      <ellipse cx="-7" cy="75" rx="6" ry="3.500" fill="#fff" opacity=".45" transform="rotate(-30 -7 75)"/>
    </g>
  </g>`;

const digital = `
  <g id="digital">
    <ellipse cx="0" cy="124" rx="100" ry="13" fill="#000" opacity=".55" filter="url(#soft)"/>
    <!-- the glass hologram of the same envelope, floating above the phone -->
    <g transform="translate(0 -122)" fill="none" stroke="#9eeeff" stroke-linejoin="round" stroke-linecap="round" filter="url(#glow)">
      <rect x="-70" y="-38" width="140" height="84" rx="7" fill="#7fe7ff" fill-opacity=".1" stroke-width="2.400"/>
      <path d="M-68 -34 L0 14 L68 -34" stroke-width="2"/>
      <path d="M-68 44 L-22 8 M68 44 L22 8" stroke-width="1.400" opacity=".7"/>
      <path d="M0 4 C-8 -2 -8 -10 -4 -11 C-1.500 -11.500 0 -9.500 0 -7.500 C0 -9.500 1.500 -11.500 4 -11 C8 -10 8 -2 0 4Z" fill="#ffc857" stroke="none"/>
    </g>
    <!-- cubes lifting off into the phone -->
    ${[ [-34,-60,6],[-10,-50,5],[18,-62,6],[34,-46,4],[-22,-38,4],[4,-36,5],[26,-30,3.500] ].map(([x,y,s],i)=>`<g filter="url(#glowSoft)"><rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${i%3===0?"#ffc857":"#8feeff"}" opacity=".9"/><polygon points="${x},${y} ${x+s*0.5},${y-s*0.35} ${x+s*1.5},${y-s*0.35} ${x+s},${y}" fill="#e6fcff" opacity=".9"/></g>`).join("")}
    <!-- the phone -->
    <g transform="translate(0 28) scale(.9) rotate(-3)">
      <rect x="-70" y="-120" width="140" height="262" rx="30" fill="none" stroke="#9eeeff" stroke-width="7" opacity=".9" filter="url(#glowBig)"/>
      <rect x="-60" y="-110" width="140" height="262" rx="30" fill="#0a2430"/>
      <rect x="-70" y="-120" width="140" height="262" rx="30" fill="url(#frame)"/>
      <rect x="-64" y="-114" width="128" height="250" rx="25" fill="#04121a"/>
      <rect x="-58" y="-108" width="116" height="238" rx="20" fill="url(#screen)"/>
      <rect x="-18" y="-101" width="36" height="8" rx="4" fill="#04121a"/>
      <rect x="-42" y="-68" width="84" height="122" rx="9" fill="#0d3140" stroke="#9eeeff" stroke-width="1.800" filter="url(#glowSoft)"/>
      <path d="M0 30 C-16 19 -16 2 -8 0 C-3 -0.500 0 2.500 0 6 C0 2.500 3 -0.500 8 0 C16 2 16 19 0 30Z" fill="#ffc857" filter="url(#glow)"/>
      <rect x="-26" y="-52" width="52" height="3.500" rx="1.700" fill="#e6fcff" opacity=".75"/>
      <rect x="-16" y="-44" width="32" height="3" rx="1.500" fill="#e6fcff" opacity=".45"/>
      <rect x="-24" y="42" width="48" height="3" rx="1.500" fill="#ffc857" opacity=".8"/>
      <rect x="-24" y="80" width="48" height="25" rx="12.500" fill="#7fe7ff" filter="url(#glowSoft)"/>
      <text x="0" y="96.500" text-anchor="middle" font-family="Futura" font-size="11" font-weight="500" letter-spacing="1.500" fill="#04323f">OPEN</text>
      <path d="M-58 -108 H18 L-58 10 Z" fill="url(#sheen)"/>
    </g>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  ${paper}
  ${digital}
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04131a"/><stop offset=".55" stop-color="#0a2a36"/><stop offset="1" stop-color="#0b1f2a"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff4ff" stop-opacity=".30"/><stop offset=".5" stop-color="#3a8da3" stop-opacity=".14"/><stop offset="1" stop-color="#e8fbff" stop-opacity=".24"/></linearGradient>
  <radialGradient id="mistC" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e8fbff" stop-opacity=".30"/><stop offset="1" stop-color="#e8fbff" stop-opacity="0"/></radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff4ff" stop-opacity=".16"/><stop offset="1" stop-color="#bff4ff" stop-opacity="0"/></linearGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="refl"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#fade)" transform="translate(0 0)"/></mask>
  <linearGradient id="envBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e3d2b2"/></linearGradient>
  <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#eadbbd"/></linearGradient>
  <linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#efe3c9"/></linearGradient>
  <radialGradient id="seal" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#fff0b8"/><stop offset=".45" stop-color="#e9b94c"/><stop offset="1" stop-color="#8f6212"/></radialGradient>
  <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4fdff"/><stop offset=".45" stop-color="#8fd6e8"/><stop offset="1" stop-color="#2a6a80"/></linearGradient>
  <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#103647"/><stop offset="1" stop-color="#06161e"/></linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowBig" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="mist" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
</defs>

<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect y="470" width="${W}" height="${H - 470}" fill="url(#floor)"/>

<!-- the two mirror chambers -->
${chamber(CL.x, CL.y, "chamL")}
${chamber(CR.x, CR.y, "chamR")}

<!-- mist -->
<g filter="url(#mist)" opacity=".55">
  <ellipse cx="452" cy="446" rx="200" ry="30" fill="#e8fbff"/>
  <ellipse cx="1188" cy="446" rx="200" ry="30" fill="#e8fbff"/>
  <ellipse cx="820" cy="300" rx="190" ry="120" fill="#7fe7ff" opacity=".18"/>
</g>

<!-- paper (left) and its digital twin (right) -->
<g transform="translate(${CL.x} ${CL.y + 12})">
  <use href="#paper"/>
</g>
<g transform="translate(${CR.x} ${CR.y + 12})">
  <use href="#digital"/>
</g>

<!-- centre text -->
<g text-anchor="middle">
  <text x="820" y="258" font-family="Snell Roundhand" font-weight="700" font-size="82" fill="#7fe7ff" filter="url(#glowBig)">The Day</text>
  <text x="820" y="258" font-family="Snell Roundhand" font-weight="700" font-size="82" fill="#f4fdff">The Day</text>
  <path d="M752 286 H888" stroke="#7fe7ff" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
  <text x="822" y="334" font-family="Futura" font-weight="500" font-size="21" letter-spacing="3.600" fill="#d9fbff" filter="url(#glowSoft)">FROM PAPER TO PHONE</text>
  <text x="822" y="364" font-family="Futura" font-weight="400" font-size="12" letter-spacing="3.400" fill="#b8e8f2" opacity=".9">DIGITAL WEDDING INVITATIONS</text>
  <g fill="none" stroke="#7fe7ff" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowSoft)">
    <path d="M788 402 l10 8 l-10 8"/><path d="M810 402 l10 8 l-10 8" opacity=".75"/><path d="M832 402 l10 8 l-10 8" opacity=".5"/>
  </g>
</g>

<!-- captions under each chamber -->
<g font-family="Futura" font-size="12" letter-spacing="4" fill="#b8e8f2" text-anchor="middle" opacity=".9">
  <text x="${CL.x}" y="508">PAPER</text>
  <text x="${CR.x}" y="508">E-INVITATION</text>
</g>

<rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;

await writeFile("docs/branding/mirror-cover.svg", svg);
await sharp(Buffer.from(svg), { density: 72 }).resize(1640, 624).png().toFile("docs/branding/mirror-cover-1640x624.png");
await sharp(Buffer.from(svg), { density: 144 }).resize(3280, 1248).png().toFile("docs/branding/mirror-cover-3280x1248.png");
await sharp("docs/branding/mirror-cover-1640x624.png").extract({ left: 265, top: 0, width: 1110, height: 624 }).resize(740).png().toFile("docs/branding/mirror-cover-phone-crop.png");
console.log("done");
