"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Design = { key: string; name: string; mood: string; blurb: string };

/** The real screen each preview pretends to be. Previews are scaled down to fit their card. */
const DEVICES = {
  phone: { label: "Phone", icon: Smartphone, w: 390, h: 800, card: 300, radius: "rounded-[2.2rem]", border: "border-[7px]" },
  tablet: { label: "Tablet", icon: Tablet, w: 820, h: 1100, card: 440, radius: "rounded-[1.6rem]", border: "border-[9px]" },
  desktop: { label: "Desktop", icon: Monitor, w: 1366, h: 820, card: 640, radius: "rounded-xl", border: "border-[6px]" },
} as const;
type DeviceKey = keyof typeof DEVICES;

function Preview({ design, device, lang }: { design: Design; device: DeviceKey; lang: "en" | "my" }) {
  const d = DEVICES[device];
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  // Scale the full-size page to whatever width the card actually has.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / d.w);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [d.w]);

  return (
    <div className={`bg-[#2a2420] shadow-[0_28px_50px_-24px_rgba(42,36,32,.6)] ${d.radius} ${d.border} border-[#2a2420]`}>
      <div ref={box} className={`relative w-full overflow-hidden bg-white ${device === "phone" ? "rounded-[1.6rem]" : "rounded-md"}`} style={{ height: scale ? d.h * scale : undefined, aspectRatio: scale ? undefined : `${d.w} / ${d.h}` }}>
        {scale > 0 && (
          <iframe
            key={`${design.key}-${device}-${lang}`}
            title={`${design.name} design preview, ${DEVICES[device].label.toLowerCase()}`}
            src={`/w/showcase-${design.key}?lang=${lang}`}
            loading="lazy"
            className="absolute top-0 left-0 origin-top-left border-0"
            style={{ width: d.w, height: d.h, transform: `scale(${scale})` }}
          />
        )}
      </div>
    </div>
  );
}

export function ShowcaseGallery({ designs }: { designs: Design[] }) {
  const [device, setDevice] = useState<DeviceKey>("phone");
  const [lang, setLang] = useState<"en" | "my">("en");
  const d = DEVICES[device];

  const pill = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${on ? "border-[#4a3a2e] bg-[#4a3a2e] text-[#f6efe2]" : "border-[#4a3a2e]/30 hover:border-[#4a3a2e]"}`;

  return (
    <>
      <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <div role="group" aria-label="Preview screen size" className="flex flex-wrap justify-center gap-2">
          {(Object.keys(DEVICES) as DeviceKey[]).map((k) => {
            const Icon = DEVICES[k].icon;
            return (
              <button key={k} type="button" aria-pressed={device === k} onClick={() => setDevice(k)} className={pill(device === k)}>
                <Icon className="size-4" aria-hidden />
                {DEVICES[k].label}
              </button>
            );
          })}
        </div>
        <div role="group" aria-label="Preview language" className="flex gap-2">
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} className={pill(lang === "en")}>
            English
          </button>
          <button type="button" aria-pressed={lang === "my"} onClick={() => setLang("my")} className={pill(lang === "my")} lang="my">
            မြန်မာ
          </button>
        </div>
      </div>

      <ul className="mx-auto mt-12 flex max-w-[110rem] flex-wrap justify-center gap-x-10 gap-y-16">
        {designs.map((t) => (
          <li key={t.key} className="flex flex-col items-center text-center" style={{ width: `min(100%, ${d.card}px)` }}>
            <div className="w-full">
              <Preview design={t} device={device} lang={lang} />
            </div>
            <h2 className="font-display mt-6 text-2xl font-semibold">{t.name}</h2>
            <p className="label-caps mt-1 text-[0.65rem] text-[#8a7766]">{t.mood}</p>
            <p className="mt-3 max-w-[22rem] text-[0.95rem] leading-relaxed text-[#6e5f53]">{t.blurb}</p>
            <div className="mt-4 flex gap-5 text-sm underline underline-offset-4">
              <a href={`/w/showcase-${t.key}?lang=en`} target="_blank" rel="noopener noreferrer">
                Open in English
              </a>
              <a href={`/w/showcase-${t.key}?lang=my`} target="_blank" rel="noopener noreferrer" lang="my">
                မြန်မာဖြင့်ကြည့်ရန်
              </a>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
