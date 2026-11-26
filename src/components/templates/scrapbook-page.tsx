import Image from "next/image";
import { z } from "zod";
import type { AlbumPhoto } from "@/lib/album";
import { mediaUrl } from "@/lib/media";
import { Reveal } from "./reveal";
import { TrackOpen } from "./track-open";
import { viewOf, type TemplateProps } from "./view";

const Art = z.record(z.string(), z.object({ p: z.string(), w: z.number(), h: z.number() }));
type ArtMap = z.infer<typeof Art>;
const Gift = z.array(z.object({ qr_path: z.string() }));

/** The wording of this design lives in cover_text.scrapbook, and its artwork in cover_text.art. */
const Copy = z
  .object({
    intro: z.string(),
    dateLine: z.string(),
    place: z.string(),
    rsvpBy: z.string(),
    buttons: z.object({ rsvp: z.string(), gift: z.string() }),
    story: z.object({ title: z.string(), text: z.string() }),
    about: z.object({ title: z.string(), items: z.array(z.object({ art: z.string(), title: z.string(), text: z.string() })) }),
    program: z.object({ title: z.string(), items: z.array(z.object({ time: z.string(), title: z.string() })) }),
    meta: z.object({ left: z.string(), right: z.string() }),
    gift: z.object({ title: z.string(), line: z.string(), paragraphs: z.array(z.string()), thanks: z.string() }),
    contact: z.object({ lead: z.string(), people: z.array(z.object({ name: z.string(), phone: z.string(), email: z.string(), tone: z.enum(["blue", "pink"]) })) }),
  })
  .partial();
type Copy = z.infer<typeof Copy>;

/*
 * The published design is a fixed canvas that is scaled to the width of the screen: one canvas for
 * wide screens (1280 units across) and another for phones (375 across). Every piece below sits at
 * the same place and size as in that design. `--u` is one canvas unit in pixels.
 */
const RUST = "#ae2700";
const INK = "#222";
const CREAM = "#fefbf8";
const u = (n: number) => `calc(var(--u) * ${n})`;
type CSS = React.CSSProperties;

/** A box given by its centre (as the design records it). */
const centred = (cx: number, cy: number, w: number, h: number): CSS => ({ position: "absolute", left: u(cx - w / 2), top: u(cy - h / 2), width: u(w), height: u(h) });
/** A text box given by its top-left corner. */
const corner = (x: number, y: number, w: number, fs: number, lh: number, align: CSS["textAlign"] = "left", extra: CSS = {}): CSS => ({
  position: "absolute",
  left: u(x),
  top: u(y),
  width: u(w),
  fontSize: u(fs),
  lineHeight: u(lh),
  textAlign: align,
  ...extra,
});

type Ctx = { art: ArtMap; photos: Record<string, AlbumPhoto | null>; qr: string | null };

/** A cut-out picture (flower, drawing, paper). */
function Piece({ ctx, k, cx, cy, w, h, r = 0, delay = 0, crop, flip }: { ctx: Ctx; k: string; cx: number; cy: number; w: number; h: number; r?: number; delay?: number; crop?: number; flip?: boolean }) {
  const a = ctx.art[k];
  if (!a) return null;
  return (
    <Reveal variant="photo" delay={delay} style={centred(cx, cy, w, h)}>
      <div className="h-full w-full" style={{ transform: `${r ? `rotate(${r}deg)` : ""}${flip ? " scaleX(-1)" : ""}`.trim() || undefined }}>
        <Image src={mediaUrl(a.p)} width={a.w} height={a.h} alt="" sizes="(max-width: 767px) 100vw, 800px" className="pointer-events-none block select-none" style={{ width: "100%", height: crop ? u(crop) : "100%", objectFit: crop ? "cover" : "fill", objectPosition: "top" }} />
      </div>
    </Reveal>
  );
}

/** A strip of masking tape, cropped to the part the design shows (`vx` and `vw`, measured from the tape's left edge). */
function Tape({ ctx, left, cy, w, h, vx, vw, flip }: { ctx: Ctx; left: number; cy: number; w: number; h: number; vx: number; vw: number; flip?: boolean }) {
  const a = ctx.art.tape;
  if (!a) return null;
  return (
    <Reveal variant="photo" style={{ position: "absolute", left: u(left + vx), top: u(cy - h / 2), width: u(vw), height: u(h), overflow: "hidden" }}>
      <Image src={mediaUrl(a.p)} width={a.w} height={a.h} alt="" sizes="300px" className="pointer-events-none absolute max-w-none select-none" style={{ left: u(-vx), top: 0, width: u(w), height: u(h), transform: flip ? "scaleX(-1)" : undefined }} />
    </Reveal>
  );
}

/** A photograph. */
function Snap({ ctx, n, cx, cy, w, h, r = 0, delay = 0, pos = "50% 50%" }: { ctx: Ctx; n: string; cx: number; cy: number; w: number; h: number; r?: number; delay?: number; pos?: string }) {
  const p = ctx.photos[n];
  if (!p) return null;
  return (
    <Reveal variant="photo" delay={delay} style={centred(cx, cy, w, h)}>
      <div className="relative h-full w-full overflow-hidden" style={{ transform: r ? `rotate(${r}deg)` : undefined }}>
        <Image src={p.src} alt={p.alt} fill sizes="(max-width: 767px) 100vw, 900px" className="object-cover" style={{ objectPosition: pos }} />
      </div>
    </Reveal>
  );
}

/** A piece of text on the canvas. */
function Txt({ box, font = "t", color = INK, upper, ls, delay = 0, underline, fscale = 1, children }: { box: CSS; font?: "t" | "s"; color?: string; upper?: boolean; ls?: string; delay?: number; underline?: boolean; fscale?: number; children: React.ReactNode }) {
  return (
    <Reveal delay={delay} style={{ ...box, color, textTransform: upper ? "uppercase" : undefined, letterSpacing: ls, textDecoration: underline ? "underline" : undefined, textUnderlineOffset: underline ? "0.12em" : undefined }}>
      <div className={font === "s" ? "sb-s" : "sb-t"} style={font === "s" ? { fontSize: `${fscale}em` } : undefined}>{children}</div>
    </Reveal>
  );
}

/** A white polaroid: the picture with its thick white frame, and two more sheets peeking out behind it. */
function Polaroid({ ctx, n, cx, cy, w, h, r, pos, sheets = true }: { ctx: Ctx; n: string; cx: number; cy: number; w: number; h: number; r: number; pos?: string; sheets?: boolean }) {
  const p = ctx.photos[n];
  if (!p) return null;
  const side = w * 0.04;
  const top = w * 0.03;
  const bottom = w * 0.2;
  const cw = w + side * 2;
  const ch = h + top + bottom;
  return (
    <>
      {sheets &&
        [
          [-9, 19],
          [-21, 35],
        ].map(([dx, dy]) => (
          <Reveal key={dx} variant="photo" style={centred(cx + dx, cy + dy + (bottom - top) / 2, cw, ch)}>
            <div className="h-full w-full border border-[#e4e1db] bg-[#fdfdfb]" style={{ transform: `rotate(${r}deg)`, boxShadow: "0 1px 2px rgba(60,40,20,.2)" }} />
          </Reveal>
        ))}
      <Reveal variant="photo" style={centred(cx, cy + (bottom - top) / 2, cw, ch)}>
        <div className="relative h-full w-full bg-[#fdfdfb] sb-lift" style={{ transform: `rotate(${r}deg)` }}>
          <div className="absolute overflow-hidden" style={{ left: u(side), top: u(top), width: u(w), height: u(h) }}>
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 767px) 100vw, 400px" className="object-cover" style={{ objectPosition: pos ?? "50% 50%" }} />
          </div>
        </div>
      </Reveal>
    </>
  );
}

/** The paperclip on the front polaroid. */
function Clip({ cx, cy, s, r }: { cx: number; cy: number; s: number; r: number }) {
  return (
    <Reveal style={centred(cx, cy, 20 * s, 56 * s)}>
      <svg aria-hidden viewBox="0 0 24 56" className="h-full w-full" style={{ transform: `rotate(${r}deg)` }} fill="none" stroke="#7d8286" strokeWidth="2.4" strokeLinecap="round">
        <path d="M7 46 V12 C7 3 19 3 19 12 V48 C19 56 8 56 8 48 V18" />
      </svg>
    </Reveal>
  );
}

/** The first part of the page, shared by both canvases: the invitation and its buttons. */
function Header({ ctx, copy, names, d }: { ctx: Ctx; copy: Copy; names: [string, string]; d: boolean }) {
  // Positions: [desktop, phone]
  const p = <T,>(a: T, b: T) => (d ? a : b);
  const tape1 = p<[number, number, number, number]>([672, 569, 272, 67], [175, 906, 230, 57]);
  const tape2 = p<[number, number, number, number]>([920, 563, 272, 67], [175, 977, 230, 57]);
  return (
    <>
      <Piece ctx={ctx} k="pink-plant" {...p({ cx: 135, cy: 81, w: 379, h: 335 }, { cx: 120, cy: 63, w: 294, h: 260 })} />
      <Polaroid ctx={ctx} n="p1" {...p({ cx: 244, cy: 281, w: 265, h: 398, r: 14.1 }, { cx: 204, cy: 218, w: 206, h: 309, r: 14.1 })} />
      <Clip {...p({ cx: 360, cy: 262, s: 1.2, r: 12 }, { cx: 285, cy: 172, s: 0.95, r: 12 })} />
      <Piece ctx={ctx} k="butterfly" {...p({ cx: 47, cy: 342, w: 153, h: 73 }, { cx: 14, cy: 502, w: 45, h: 21 })} />
      <Piece ctx={ctx} k="petals-cream" delay={100} {...p({ cx: 124, cy: 602, w: 221, h: 181 }, { cx: 111, cy: 467, w: 172, h: 140 })} />
      <Piece ctx={ctx} k="red-flower" delay={150} {...p({ cx: 306, cy: 602, w: 221, h: 378, r: -9 }, { cx: 252, cy: 467, w: 172, h: 293, r: -9 })} />

      {copy.intro && (
        <Txt upper box={d ? corner(575, 87, 499, 26.2, 36.5, "center") : corner(21, 573, 333, 22.1, 30.8, "center")}>
          {copy.intro}
        </Txt>
      )}
      <Txt font="s" fscale={0.9} color={RUST} delay={100} box={d ? corner(521, 169, 607, 120.9, 102.1, "center", { whiteSpace: "nowrap" }) : corner(15, 670, 345, 68.7, 58.1, "center", { whiteSpace: "nowrap" })}>
        {names[0]}
        <br />
        &amp; {names[1]}
      </Txt>
      {copy.dateLine && (
        <Txt upper box={d ? corner(666, 435, 316, 25, 34.7, "center", { whiteSpace: "nowrap" }) : corner(98, 821, 180, 14.2, 19.7, "center", { whiteSpace: "nowrap" })}>
          {copy.dateLine}
        </Txt>
      )}
      {copy.place && (
        <Txt upper box={d ? corner(607, 470, 434, 25, 34.7, "center", { whiteSpace: "nowrap" }) : corner(64, 840, 246, 14.2, 19.7, "center", { whiteSpace: "nowrap" })}>
          {copy.place}
        </Txt>
      )}
      {copy.buttons && (
        <>
          <a href={d ? "#contact" : "#contact-m"} aria-label={copy.buttons.rsvp}>
            {d ? <Tape ctx={ctx} left={536} cy={569} w={272} h={67} vx={59} vw={183} /> : <Piece ctx={ctx} k="tape" cx={tape1[0]} cy={tape1[1]} w={tape1[2]} h={tape1[3]} />}
            <Txt upper underline color={CREAM} box={d ? corner(643, 553, 70, 26.2, 36.5, "center", { whiteSpace: "nowrap" }) : corner(151, 892, 59, 22.1, 30.8, "center", { whiteSpace: "nowrap" })}>
              {copy.buttons.rsvp}
            </Txt>
          </a>
          <a href={d ? "#gift" : "#gift-m"} aria-label={copy.buttons.gift}>
            {d ? <Tape ctx={ctx} left={783} cy={563} w={272} h={67} vx={31} vw={237} /> : <Piece ctx={ctx} k="tape" cx={tape2[0]} cy={tape2[1]} w={tape2[2]} h={tape2[3]} />}
            <Txt underline color={CREAM} box={d ? corner(846, 547, 176, 26.2, 36.5, "center", { whiteSpace: "nowrap" }) : corner(113, 964, 149, 22.1, 30.8, "center", { whiteSpace: "nowrap" })}>
              {copy.buttons.gift}
            </Txt>
          </a>
        </>
      )}
      {copy.rsvpBy && (
        <Txt box={d ? corner(661, 631, 326, 20, 27.2, "center") : corner(50, 1020, 275, 16.9, 22.9, "center")}>{copy.rsvpBy}</Txt>
      )}
    </>
  );
}

/** The wide screen canvas (1280 across). */
function WideCanvas({ ctx, copy, names }: { ctx: Ctx; copy: Copy; names: [string, string] }) {
  const veil = ctx.photos.cover;
  const bg = ctx.photos.p2;
  const paper = ctx.art["paper-bg"];
  const card = ctx.art["paper-card"];
  const about = copy.about?.items ?? [];
  const aboutAt = [
    { piece: [198, 2497, 120, 191, 4.8], title: [151, 2612, 92], text: [69, 2666, 258] },
    { piece: [489.5, 2487, 121, 160, 0], title: [443, 2614, 97], text: [365, 2669, 253] },
    { piece: [723, 2503, 102, 171, 0], title: [742, 2612, 64], text: [657, 2666, 235] },
    { piece: [1072, 2504, 192, 130, 0], title: [1017, 2612, 122], text: [942, 2666, 271] },
  ];
  const rows = [
    { t: [404, 3176, 91], n: [555, 3176, 333] },
    { t: [415, 3266, 91], n: [566, 3266, 195] },
    { t: [423, 3357, 83], n: [566, 3357, 219] },
    { t: [415, 3447, 91], n: [566, 3447, 239] },
  ];
  return (
    <>
      {/* paper behind the invitation */}
      <div className="absolute overflow-hidden" style={{ left: 0, top: 0, width: u(1280), height: u(652) }}>
        {paper && <Image src={mediaUrl(paper.p)} alt="" width={paper.w} height={paper.h} sizes="100vw" priority className="absolute max-w-none" style={{ left: 0, top: u(-545), width: u(1280), height: u(1809) }} />}
      </div>
      <Header ctx={ctx} copy={copy} names={names} d />

      {/* the wide photograph */}
      {veil && (
        <Reveal variant="photo" style={{ position: "absolute", left: 0, top: u(652), width: u(1280), height: u(853) }}>
          <div className="relative h-full w-full overflow-hidden">
            <Image src={veil.src} alt={veil.alt} fill sizes="100vw" className="object-cover" />
          </div>
        </Reveal>
      )}

      {/* a paper card on a photograph */}
      <div className="absolute overflow-hidden" style={{ left: 0, top: u(1505), width: u(1280), height: u(645) }}>
        {bg && <Image src={bg.src} alt="" width={bg.width} height={bg.height} sizes="100vw" className="absolute max-w-none" style={{ left: 0, top: u(-68), width: u(1280), height: u(1921) }} />}
      </div>
      {card && <div className="absolute sb-lift" style={{ left: u(208), top: u(1554), width: u(865), height: u(466), backgroundImage: `url(${mediaUrl(card.p)})`, backgroundSize: "cover" }} />}
      {copy.story && (
        <>
          <Txt font="s" color={RUST} box={corner(326, 1617, 627, 75, 74, "center", { whiteSpace: "pre-line" })}>
            {copy.story.title.replace(" (", "\n(")}
          </Txt>
          <Txt delay={100} box={corner(318, 1797, 644, 20, 27.2, "center")}>
            {copy.story.text}
          </Txt>
        </>
      )}

      {/* about the reception */}
      {copy.about && (
        <>
          <Txt font="s" color={RUST} box={corner(357, 2234, 567, 77.5, 76.8, "center", { whiteSpace: "nowrap" })}>
            {copy.about.title}
          </Txt>
          {about.map((it, i) => {
            const a = aboutAt[i];
            if (!a) return null;
            return (
              <div key={it.title}>
                <Piece ctx={ctx} k={it.art} delay={i * 100} cx={a.piece[0]} cy={a.piece[1]} w={a.piece[2]} h={a.piece[3]} r={a.piece[4]} />
                {it.art === "rabbit" && <Piece ctx={ctx} k="rabbit" delay={200} cx={792} cy={2530} w={70} h={117} flip />}
                <Txt upper color={RUST} delay={i * 100} box={corner(a.title[0], a.title[1], a.title[2], 26.2, 36.5, "center", { whiteSpace: "nowrap" })}>
                  {it.title}
                </Txt>
                <Txt delay={i * 100} box={corner(a.text[0], a.text[1], a.text[2], 15, 20.6, "center")}>
                  {it.text}
                </Txt>
              </div>
            );
          })}
        </>
      )}

      {/* program of events */}
      {copy.program && (
        <>
          <Piece ctx={ctx} k="butterfly" cx={239.5} cy={3047.5} w={97} h={46} r={-30.5} />
          <Piece ctx={ctx} k="orange" cx={104} cy={3134} w={99} h={108} r={46.6} />
          <Piece ctx={ctx} k="petal" cx={223} cy={3267.5} w={142} h={137} r={7.2} />
          <Piece ctx={ctx} k="mustard" cx={144} cy={3439.5} w={184} h={237} flip />
          <Piece ctx={ctx} k="pink-plant" cx={1123.5} cy={3114.5} w={206} h={182} r={-12.8} />
          <Piece ctx={ctx} k="pink-flower" cx={1071} cy={3303.5} w={127} h={125} r={-108.7} />
          <Piece ctx={ctx} k="red-flower" cx={1195.5} cy={3443} w={120} h={205} r={35.5} />
          <Txt font="s" color={RUST} box={corner(385, 3027, 509, 77.5, 76.8, "center", { whiteSpace: "nowrap" })}>
            {copy.program.title}
          </Txt>
          {[3235.5, 3326, 3416.5].map((y) => (
            <div key={y} className="absolute border-t border-dashed" style={{ left: u(404), width: u(485), top: u(y), borderColor: "#444" }} />
          ))}
          {copy.program.items.map((e, i) => {
            const r = rows[i];
            if (!r) return null;
            return (
              <div key={e.title}>
                <Txt color={RUST} ls="0.36px" delay={i * 100} box={corner(r.t[0], r.t[1], r.t[2], 22.5, 33.7, "right", { whiteSpace: "nowrap" })}>
                  {e.time}
                </Txt>
                <Txt ls="0.36px" delay={i * 100} box={corner(r.n[0], r.n[1], r.n[2], 22.5, 33.7, "left", { whiteSpace: "nowrap" })}>
                  {e.title}
                </Txt>
              </div>
            );
          })}
        </>
      )}

      {/* gift registry */}
      {copy.meta && (
        <>
          <Txt upper ls="0.3px" box={corner(71, 3643, 210, 18.7, 28.1, "left")}>
            {copy.meta.left}
          </Txt>
          <Txt ls="0.3px" box={corner(806, 3643, 396, 18.7, 28.1, "right")}>
            {copy.meta.right}
          </Txt>
        </>
      )}
      {copy.gift && (
        <>
          <Txt font="s" color={RUST} box={corner(72, 3711, 359, 77.5, 76.8, "left", { whiteSpace: "nowrap" })}>
            {copy.gift.title}
          </Txt>
          <Txt upper box={corner(72, 3839, 556, 23.7, 32.8, "left")}>
            {copy.gift.line}
          </Txt>
          <Txt box={corner(72, 3927, 597, 17.5, 24.4, "left")}>{copy.gift.paragraphs[0]}</Txt>
          <Txt box={corner(72, 4049, 602, 17.5, 24.4, "left")}>{copy.gift.paragraphs[1]}</Txt>
          <Txt color={RUST} box={corner(72, 4171, 478, 17.5, 24.4, "left")}>
            {copy.gift.thanks}
          </Txt>
          <Piece ctx={ctx} k="lace" cx={940.5} cy={3936.5} w={365} h={397} />
          <Piece ctx={ctx} k="chair" cx={1017.5} cy={3823} w={79} h={142} />
          <Piece ctx={ctx} k="chair" cx={1110.5} cy={3839.5} w={75} h={135} flip />
          <Piece ctx={ctx} k="torn" cx={999} cy={4008} w={298} h={298} />
          <QrTile ctx={ctx} cx={999.5} cy={3989.5} size={179} />
          <Piece ctx={ctx} k="delphinium" cx={1115} cy={4127.5} w={144} h={200} r={13.2} />
        </>
      )}

      {/* contact */}
      {copy.contact && <Contact ctx={ctx} copy={copy} k={1} x0={764} y0={4655} />}
    </>
  );
}

/** The QR code, on its white tile. */
function QrTile({ ctx, cx, cy, size }: { ctx: Ctx; cx: number; cy: number; size: number }) {
  if (!ctx.qr) return null;
  return (
    <Reveal variant="photo" delay={100} style={centred(cx, cy, size, size)}>
      <div className="relative h-full w-full bg-white">
        <Image src={ctx.qr} alt="QR code" fill sizes="200px" className="object-contain p-[4%]" />
      </div>
    </Reveal>
  );
}

/** The kraft envelope and the two contact cards. `k` scales the whole group (the phone canvas shows it small). */
function Contact({ ctx, copy, k, x0, y0 }: { ctx: Ctx; copy: Copy; k: number; x0: number; y0: number }) {
  const T = (x: number, y: number): [number, number] => [(x - 764) * k + x0, (y - 4655) * k + y0];
  const at = (x: number, y: number, w: number, h: number) => {
    const [cx, cy] = T(x, y);
    return { cx, cy, w: w * k, h: h * k };
  };
  const film = [
    { n: "p3", x: 259, y: 4521, w: 143, h: 95 },
    { n: "p4", x: 221, y: 4632, w: 86, h: 129 },
    { n: "p5", x: 211, y: 4715, w: 144, h: 96 },
    { n: "p6", x: 187, y: 4812, w: 64, h: 97 },
    { n: "p7", x: 149, y: 4904, w: 142, h: 95 },
  ];
  const cards = [
    { person: copy.contact?.people?.[0], art: "card-blue", c: [500, 4806] as const, r: 0, shadow: [485, 4844, 0] as const },
    { person: copy.contact?.people?.[1], art: "card-pink", c: [944, 4924] as const, r: -7.6, shadow: [938, 4959, -7.4] as const },
  ];
  const [lx, ly] = T(640.5, 4397);
  return (
    <>
      <Txt upper box={corner(lx - (953 * k) / 2, ly - (34 * k) / 2, 953 * k, 28.7 * k, 28.1 * k, "center")}>
        {copy.contact?.lead}
      </Txt>
      <Piece ctx={ctx} k="pink-plant" delay={100} {...at(764, 4655, 431, 381)} r={-16.7} />
      <Piece ctx={ctx} k="envelope" delay={150} {...at(423, 4704, 380, 476)} r={5.5} />
      <Piece ctx={ctx} k="strip" {...at(211, 4714, 93, 499)} r={14.2} />
      {film.map((f) => (
        <Snap key={f.n} ctx={ctx} n={f.n} {...at(f.x, f.y, f.w, f.h)} r={14.2} />
      ))}
      <Piece ctx={ctx} k="yellow-plant" {...at(156, 4908, 220, 183)} />
      <Piece ctx={ctx} k="petal" {...at(684, 4909, 95, 92)} r={-15.9} />
      <Piece ctx={ctx} k="red-flower" delay={200} {...at(1073, 4837, 185, 315)} r={35.5} />
      {cards.map((c, i) => {
        if (!c.person) return null;
        const [cx, cy] = T(c.c[0], c.c[1]);
        const [sx, sy] = T(c.shadow[0], c.shadow[1]);
        const w = 367 * k;
        return (
          <div key={c.person.name}>
            <Piece ctx={ctx} k="shadow" delay={250 + i * 100} cx={sx} cy={sy} w={336 * k} h={35 * k} r={c.shadow[2]} />
            <Reveal variant="photo" delay={250 + i * 100} style={centred(cx, cy, w, 479 * k)}>
              <div className="relative h-full w-full" style={{ transform: c.r ? `rotate(${c.r}deg)` : undefined }}>
                {ctx.art[c.art] && (
                  <Image src={mediaUrl(ctx.art[c.art].p)} width={ctx.art[c.art].w} height={ctx.art[c.art].h} alt="" sizes="400px" className="absolute top-0 left-0 block max-w-none select-none" style={{ width: "100%", height: u(268 * k), objectFit: "cover", objectPosition: "top" }} />
                )}
                <div className="absolute inset-0" style={{ color: INK }}>
                  <div className="sb-s absolute whitespace-nowrap" style={{ left: u(28.5 * k), top: u(24 * k), fontSize: u(45 * k), lineHeight: u(62.8 * k) }}>
                    {c.person.name}
                  </div>
                  {[
                    ["Phone", 87.5],
                    [c.person.phone, 112],
                    ["Email", 164],
                    [c.person.email, 190],
                  ].map(([t, y]) => (
                    <div key={`${t}`} className="sb-t absolute whitespace-nowrap" style={{ left: u(28.5 * k), top: u(Number(y) * k), fontSize: u(18.7 * k), lineHeight: u(25.7 * k) }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        );
      })}
    </>
  );
}

/** The phone canvas (375 across). */
function PhoneCanvas({ ctx, copy, names }: { ctx: Ctx; copy: Copy; names: [string, string] }) {
  const veil = ctx.photos.cover;
  const bg = ctx.photos.p2;
  const paper = ctx.art["paper-bg"];
  const card = ctx.art["paper-card"];
  const about = copy.about?.items ?? [];
  const stack = [
    { piece: [187, 2412, 101, 161, 4.8], title: [148, 2508, 78], text: [79, 2549, 218] },
    { piece: [186, 2734, 102, 135, 0], title: [147, 2816, 82], text: [81, 2858, 214] },
    { piece: [144, 3047, 86, 144, 0], title: [160, 3134, 54], text: [88, 3176, 198] },
    { piece: [183, 3347, 162, 109, 0], title: [136, 3417, 103], text: [73, 3458, 229] },
  ];
  const rows = [
    { t: [149, 4387, 77], n: [47, 4425, 281] },
    { t: [30, 4478, 77], n: [135, 4478, 165] },
    { t: [36, 4532, 70], n: [133, 4532, 185] },
    { t: [30, 4585, 77], n: [131, 4585, 202] },
  ];
  return (
    <>
      <div className="absolute overflow-hidden" style={{ left: 0, top: 0, width: u(375), height: u(1034) }}>
        {paper && <Image src={mediaUrl(paper.p)} alt="" width={paper.w} height={paper.h} sizes="100vw" priority className="absolute max-w-none" style={{ left: u(-186), top: 0, width: u(746), height: u(1055) }} />}
      </div>
      <Header ctx={ctx} copy={copy} names={names} d={false} />
      {veil && (
        <Reveal variant="photo" style={{ position: "absolute", left: 0, top: u(1034), width: u(375), height: u(250) }}>
          <div className="relative h-full w-full overflow-hidden">
            <Image src={veil.src} alt={veil.alt} fill sizes="100vw" className="object-cover" />
          </div>
        </Reveal>
      )}

      <div className="absolute overflow-hidden" style={{ left: 0, top: u(1284), width: u(375), height: u(816) }}>
        {bg && <Image src={bg.src} alt="" width={bg.width} height={bg.height} sizes="100vw" className="absolute max-w-none" style={{ left: u(-545), top: u(-20), width: u(1466), height: u(2200) }} />}
      </div>
      {card && <div className="absolute" style={{ left: u(-178), top: u(1362), width: u(730), height: u(730), backgroundImage: `url(${mediaUrl(card.p)})`, backgroundSize: "cover" }} />}
      {copy.story && (
        <>
          <Txt font="s" color={RUST} box={corner(39, 1415, 298, 63.3, 62.5, "center", { whiteSpace: "normal" })}>
            {copy.story.title}
          </Txt>
          <Txt delay={100} box={corner(33, 1692, 309, 16.9, 22.9, "center")}>
            {copy.story.text}
          </Txt>
        </>
      )}

      {copy.about && (
        <>
          <Txt font="s" color={RUST} box={corner(70, 2153, 236, 65.4, 64.9, "center", { whiteSpace: "nowrap" })}>
            {copy.about.title}
          </Txt>
          {about.map((it, i) => {
            const a = stack[i];
            if (!a) return null;
            return (
              <div key={it.title}>
                <Piece ctx={ctx} k={it.art} cx={a.piece[0]} cy={a.piece[1]} w={a.piece[2]} h={a.piece[3]} r={a.piece[4]} />
                {it.art === "rabbit" && <Piece ctx={ctx} k="rabbit" delay={100} cx={203} cy={3070} w={59} h={99} flip />}
                <Txt upper color={RUST} box={corner(a.title[0], a.title[1], a.title[2], 22.1, 30.8, "center", { whiteSpace: "nowrap" })}>
                  {it.title}
                </Txt>
                <Txt box={corner(a.text[0], a.text[1], a.text[2], 12.7, 17.4, "center")}>{it.text}</Txt>
              </div>
            );
          })}
        </>
      )}

      {copy.program && (
        <>
          <Piece ctx={ctx} k="butterfly" cx={249} cy={3778} w={82} h={39} r={-30.5} />
          <Piece ctx={ctx} k="orange" cx={135} cy={3851} w={83} h={91} r={46.6} />
          <Piece ctx={ctx} k="petal" cx={235} cy={3963} w={120} h={115} r={7.2} />
          <Piece ctx={ctx} k="mustard" cx={169} cy={4108} w={155} h={200} flip />
          <Txt font="s" color={RUST} box={corner(53, 4217, 268, 65.4, 64.9, "center", { whiteSpace: "nowrap" })}>
            {copy.program.title}
          </Txt>
          {copy.program.items.map((e, i) => {
            const r = rows[i];
            if (!r) return null;
            return (
              <div key={e.title}>
                <Txt color={RUST} ls="0.36px" box={corner(r.t[0], r.t[1], r.t[2], 19, 28.5, "right", { whiteSpace: "nowrap" })}>
                  {e.time}
                </Txt>
                <Txt ls="0.36px" box={corner(r.n[0], r.n[1], r.n[2], 19, 28.5, "left", { whiteSpace: "nowrap" })}>
                  {e.title}
                </Txt>
              </div>
            );
          })}
          <Piece ctx={ctx} k="pink-plant" cx={193} cy={4717} w={174} h={153} r={-12.8} />
          <Piece ctx={ctx} k="pink-flower" cx={148} cy={4877} w={108} h={106} r={-108.7} />
          <Piece ctx={ctx} k="red-flower" cx={350} cy={4880} w={35} h={60} r={35.5} />
        </>
      )}

      {copy.meta && (
        <>
          <Txt upper ls="0.3px" box={corner(15, 5016, 177, 15.8, 23.7, "left")}>
            {copy.meta.left}
          </Txt>
          <Txt ls="0.3px" box={corner(25, 5551, 334, 15.8, 23.7, "right")}>
            {copy.meta.right}
          </Txt>
        </>
      )}
      {copy.gift && (
        <>
          <Txt font="s" color={RUST} box={corner(15, 5044, 303, 65.4, 64.9, "left", { whiteSpace: "nowrap" })}>
            {copy.gift.title}
          </Txt>
          <Txt upper box={corner(15, 5144, 320, 20, 27.7, "left")}>
            {copy.gift.line}
          </Txt>
          <Txt box={corner(15, 5210, 345, 14.8, 20.6, "left")}>{copy.gift.paragraphs[0]}</Txt>
          <Txt box={corner(15, 5375, 343, 14.8, 20.6, "left")}>{copy.gift.paragraphs[1]}</Txt>
          <Txt color={RUST} box={corner(15, 5498, 333, 14.8, 20.6, "left")}>
            {copy.gift.thanks}
          </Txt>
          <Piece ctx={ctx} k="lace" cx={155} cy={5743} w={279} h={304} />
          <Piece ctx={ctx} k="chair" cx={214} cy={5657} w={61} h={109} />
          <Piece ctx={ctx} k="chair" cx={285} cy={5669} w={58} h={103} flip />
          <Piece ctx={ctx} k="torn" cx={200} cy={5799} w={228} h={228} />
          <QrTile ctx={ctx} cx={200} cy={5785} size={137} />
          <Piece ctx={ctx} k="delphinium" cx={289} cy={5890} w={110} h={153} r={13.2} />
        </>
      )}
      {copy.contact && <Contact ctx={ctx} copy={copy} k={0.2888} x0={222} y0={6174} />}
    </>
  );
}

/**
 * Pressed Scrapbook: a copy of one published design. The page is the design's own canvas, scaled to
 * the width of the screen (a wide canvas and a phone canvas), using its pieces and wording as given.
 */
export function ScrapbookPage({ invitation, locale, token, onOpenAction }: TemplateProps) {
  const v = viewOf(invitation, locale);
  const { wedding } = invitation;
  const raw = (wedding.cover_text as Record<string, unknown> | null) ?? {};
  const copy = Copy.safeParse(raw.scrapbook).data ?? {};
  const art = Art.safeParse(raw.art).data ?? {};
  const gifts = Gift.safeParse(wedding.gift_methods).data ?? [];

  const album = v.gallery;
  const photos: Record<string, AlbumPhoto | null> = { cover: v.cover };
  album.forEach((p, i) => {
    photos[`p${i + 1}`] = p;
  });
  const ctx: Ctx = { art, photos, qr: gifts[0] ? mediaUrl(gifts[0].qr_path) : null };
  const names: [string, string] = [v.names.one, v.names.two];

  const stage = (ref: number, height: number, children: React.ReactNode, cls: string, id: string) => (
    <div className={cls} style={{ containerType: "inline-size" }}>
      <div id={id} className="relative overflow-hidden" style={{ ["--u" as string]: `calc(100cqw / ${ref})`, height: `calc(100cqw * ${height} / ${ref})` } as CSS}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="tpl tpl-scrapbook" lang={locale}>
      <TrackOpen slug={wedding.slug} token={token} action={onOpenAction} />
      <h1 className="sr-only">
        {v.names.one} &amp; {v.names.two}
      </h1>
      {stage(1280, 5067, <><span id="gift" className="absolute" style={{ top: `calc(var(--u) * 3680)` }} /><span id="contact" className="absolute" style={{ top: `calc(var(--u) * 4370)` }} /><WideCanvas ctx={ctx} copy={copy} names={names} /></>, "hidden md:block", "top")}
      {stage(375, 6355, <><span id="gift-m" className="absolute" style={{ top: `calc(var(--u) * 5010)` }} /><span id="contact-m" className="absolute" style={{ top: `calc(var(--u) * 6070)` }} /><PhoneCanvas ctx={ctx} copy={copy} names={names} /></>, "md:hidden", "top-phone")}
    </div>
  );
}
