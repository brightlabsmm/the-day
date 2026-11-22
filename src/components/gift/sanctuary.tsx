"use client";

/*
 * A gift invitation page: twelve gifts to unlock in one of three views, a
 * vault of unlocked codes, and an optional sign-up ("E-Invitation").
 * What this browser has unlocked is remembered in localStorage only.
 */
import { useCallback, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Gift, Mail, Volume2, VolumeX } from "lucide-react";
import { GIFT_VIEWS, parseUnlocked, unlockedKey, type GiftCampaign, type GiftView } from "@/lib/gift";
import type { Locale } from "@/lib/i18n/numerals";
import { formatNumber, t } from "@/lib/i18n/numerals";
import { gs, type GiftStringKey } from "@/lib/i18n/gift-strings";
import type { SignupState } from "@/app/g/[slug]/actions";
import { LanguageSwitch } from "@/components/invite/language-switch";
import { cinzel } from "./fonts";
import { GiftDialog, InviteDialog, VaultDialog } from "./dialogs";
import { AstrolabeView, LotusView, TarotView } from "./views";
import { useSanctuarySound } from "./use-sound";
import "./gift.css";

const VIEW_LABEL: Record<GiftView, GiftStringKey> = { lotus: "viewLotus", astrolabe: "viewAstrolabe", tarot: "viewTarot" };
const VIEW_HINT: Record<GiftView, GiftStringKey> = { lotus: "hintLotus", astrolabe: "hintAstrolabe", tarot: "hintTarot" };

const unit = (n: number) => {
  const f = (Math.sin(n) * 43758.5453) % 1;
  return Math.round((f < 0 ? f + 1 : f) * 1000) / 10;
};
const MOTES = Array.from({ length: 34 }, (_, i) => ({
  x: unit(i * 12.9898 + 7),
  y: unit(i * 78.233 + 11),
  size: 1.5 + (i % 3) * 0.8,
  dur: 9 + (i % 5) * 2,
  delay: (i % 9) * -1.7,
}));

/*
 * Unlocked gifts live in localStorage, read through useSyncExternalStore so
 * the server render (nothing unlocked) and the browser agree, and other tabs
 * stay in step. If storage is blocked (private mode), an in-memory copy is used.
 */
const CHANGED = "theday-gift-unlocked";
const memory = new Map<string, string>();

function readStored(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? "";
  } catch {
    return memory.get(key) ?? "";
  }
}

function writeStored(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {}
  window.dispatchEvent(new Event(CHANGED));
}

function subscribeStored(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

export function GiftSanctuary({
  data,
  locale,
  signupAction,
}: {
  data: GiftCampaign;
  locale: Locale;
  signupAction: (prev: SignupState, form: FormData) => Promise<SignupState>;
}) {
  const { campaign, items } = data;
  const positions = useMemo(() => items.map((i) => i.position), [items]);
  const [view, setView] = useState<GiftView>(campaign.default_view);
  const storageKey = unlockedKey(campaign.slug);
  const stored = useSyncExternalStore(subscribeStored, () => readStored(storageKey), () => "");
  const unlocked = useMemo<ReadonlySet<number>>(() => new Set(parseUnlocked(stored, positions)), [stored, positions]);
  const [openPos, setOpenPos] = useState<number | null>(null);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const { chime, ambient, toggleAmbient } = useSanctuarySound();

  const save = useCallback((next: ReadonlySet<number>) => writeStored(storageKey, JSON.stringify([...next])), [storageKey]);

  const say = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }, []);

  const open = useCallback(
    (position: number) => {
      chime();
      if (!unlocked.has(position)) save(new Set([...unlocked, position]));
      setOpenPos(position);
    },
    [chime, save, unlocked],
  );

  const openFinale = useCallback(() => {
    const last = items[items.length - 1];
    if (last) open(last.position);
  }, [items, open]);

  const copy = useCallback(
    async (code: string) => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(code);
        ok = true;
      } catch {
        try {
          const area = document.createElement("textarea");
          area.value = code;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          ok = document.execCommand("copy");
          area.remove();
        } catch {}
      }
      if (ok) say(gs("copiedToast", locale, { code }));
      return ok;
    },
    [locale, say],
  );

  const count = unlocked.size;
  const total = items.length;
  const ring = 2 * Math.PI * 9;
  const current = openPos === null ? null : (items.find((i) => i.position === openPos) ?? null);
  const viewProps = { items, unlocked, locale, onOpen: open };

  return (
    <div className={`gift-root ${cinzel.variable} relative flex min-h-svh flex-col`} lang={locale}>
      <div aria-hidden className="gift-motes pointer-events-none fixed inset-0">
        {MOTES.map((m, i) => (
          <span key={i} style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.size, height: m.size, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` } as CSSProperties} />
        ))}
      </div>

      <header className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 px-5 pt-5 pb-3 md:justify-between md:px-10 md:pt-6">
        <div className="text-center md:text-left">
          <h1 className="gift-display flex items-center justify-center gap-2 text-[1.15rem] text-[#f8e2a2] md:justify-start md:text-[1.5rem] [&:lang(my)]:text-[1.05rem] md:[&:lang(my)]:text-[1.25rem]">
            <span aria-hidden className="text-[#e5c16c]">✦</span>
            {t(campaign.title, locale)}
          </h1>
          {t(campaign.subtitle, locale) && <p className="gift-serif text-[0.95rem] text-[#f3dca0]/75 italic md:text-[1.05rem] [&:lang(my)]:text-[0.8rem] md:[&:lang(my)]:text-[0.85rem]">{t(campaign.subtitle, locale)}</p>}
        </div>

        <div role="group" aria-label={gs("viewsLabel", locale)} className="gift-pillbar flex items-center gap-1 rounded-full p-1">
          {GIFT_VIEWS.map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className="gift-mode rounded-full px-3 py-1.5 text-[0.7rem] font-medium">
              {gs(VIEW_LABEL[v], locale)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <p className="gift-pillbar flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[0.75rem] text-[#f7f2e8]">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5 -rotate-90">
              <circle cx="12" cy="12" r="9" stroke="rgba(229,193,108,.2)" strokeWidth="2.5" fill="none" />
              <circle cx="12" cy="12" r="9" stroke="#f8e2a2" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={total ? ring - (count / total) * ring : ring} style={{ transition: "stroke-dashoffset .6s ease" }} />
            </svg>
            <span aria-live="polite">{gs("progress", locale, { n: formatNumber(count, locale), total: formatNumber(total, locale) })}</span>
          </p>
          <button
            type="button"
            onClick={() => say(gs(toggleAmbient() ? "soundOn" : "soundOff", locale))}
            aria-pressed={ambient}
            aria-label={gs("sound", locale)}
            className="gift-pillbar grid size-9 place-items-center rounded-full text-[#e5c16c] transition hover:text-[#f8e2a2]"
          >
            {ambient ? <Volume2 aria-hidden className="size-4" /> : <VolumeX aria-hidden className="size-4" />}
          </button>
          <LanguageSwitch locale={locale} />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-2">
        <p className="gift-serif mb-4 max-w-lg text-center text-[1.05rem] text-[#f3dca0]/80 italic md:text-[1.15rem] [&:lang(my)]:text-[0.85rem] md:[&:lang(my)]:text-[0.92rem]">{gs(VIEW_HINT[view], locale)}</p>
        {view === "lotus" && <LotusView {...viewProps} onCore={openFinale} />}
        {view === "astrolabe" && <AstrolabeView {...viewProps} onCore={openFinale} />}
        {view === "tarot" && <TarotView {...viewProps} />}
      </main>

      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-3 px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={() => setVaultOpen(true)} className="gift-gold-btn inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.82rem]">
          <Gift aria-hidden className="size-4" />
          {gs("vault", locale)}
          <span className="ml-1 rounded-full bg-[#07121c] px-2 py-0.5 text-[0.7rem] text-[#f8e2a2]">{formatNumber(count, locale)}</span>
        </button>
        {campaign.invite_enabled && (
          <button type="button" onClick={() => setInviteOpen(true)} className="gift-pillbar inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.82rem] text-[#f8e2a2] transition hover:border-[#f8e2a2]">
            <Mail aria-hidden className="size-4" />
            {gs("invite", locale)}
          </button>
        )}
      </footer>

      <GiftDialog item={current} campaign={campaign} locale={locale} onClose={() => setOpenPos(null)} onCopy={copy} onChime={() => chime(528, 1.6)} />
      <VaultDialog
        open={vaultOpen}
        items={items}
        unlocked={unlocked}
        locale={locale}
        onClose={() => setVaultOpen(false)}
        onCopy={copy}
        onReset={() => {
          save(new Set());
          setVaultOpen(false);
          say(gs("startedOver", locale));
        }}
      />
      {campaign.invite_enabled && (
        <InviteDialog
          open={inviteOpen}
          campaign={campaign}
          locale={locale}
          action={signupAction}
          onClose={() => setInviteOpen(false)}
          onDone={(name) => {
            chime(396, 1.8);
            say(gs("welcome", locale, { name }));
          }}
        />
      )}

      <div
        role="status"
        aria-live="polite"
        className={`gift-toast fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-full px-5 py-2.5 text-[0.8rem] text-[#f8e2a2] transition-opacity duration-300 ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {toast}
      </div>
    </div>
  );
}
