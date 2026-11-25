import Image from "next/image";
import { z } from "zod";
import type { Invitation } from "@/lib/invitation";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { mediaUrl } from "@/lib/media";
import { InnerCard } from "./inner-card";
import { GiftReveal } from "./gift-reveal";

const Method = z.object({
  label: z.string().min(1),
  account_name: z.string().optional(),
  qr_path: z.string().min(1),
});

/** Display-only gift QR codes (KBZPay, Wave, …). Nothing here moves money. */
export function GiftSection({ invitation, locale, plain, reveal }: { invitation: Invitation; locale: Locale; plain?: boolean; reveal?: boolean }) {
  const methods = invitation.wedding.gift_methods.flatMap((m) => {
    const parsed = Method.safeParse(m);
    return parsed.success ? [parsed.data] : [];
  });
  if (methods.length === 0) return null;

  const list = (top: string) => (
    <ul className={`mx-auto ${top} grid max-w-xl gap-3 sm:gap-6 ${methods.length > 1 ? "grid-cols-2" : "max-w-xs grid-cols-1"}`}>
      {methods.map((m) => (
        <li
          key={m.qr_path}
          className="flex flex-col items-center gap-3 rounded-2xl border border-navy/15 bg-ivory/70 px-3 py-4 sm:gap-4 sm:px-5 sm:py-6"
        >
          <p className="label-caps text-navy">{m.label}</p>
          <div className="relative aspect-square w-full max-w-[11rem] overflow-hidden rounded-lg border border-navy/25 bg-white p-2 shadow-[0_6px_16px_-10px_rgba(0,0,0,.35)]">
            <Image
              src={mediaUrl(m.qr_path)}
              alt={`${s("giftQrAlt", locale)} — ${m.label}`}
              fill
              sizes="(max-width: 640px) 40vw, 176px"
              className="object-contain p-1"
            />
          </div>
          {m.account_name && (
            <p className="card-body text-center text-[0.95rem] text-ink">
              <span className="block text-ink-soft">{s("giftAccountName", locale)}</span>
              {m.account_name}
            </p>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <InnerCard id="gift-heading" anchor="gift" plain={plain} heading={s("giftHeading", locale)} lang={locale}>
      <p className="card-body mx-auto mt-5 max-w-md text-ink">{s("giftIntro", locale)}</p>
      {/* With `reveal`, the codes stay inside an animated gift box until a guest taps it. */}
      {reveal ? <GiftReveal hint={s("giftOpenHint", locale)}>{list("mt-2")}</GiftReveal> : list("mt-8")}
    </InnerCard>
  );
}
