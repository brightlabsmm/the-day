import Image from "next/image";
import { z } from "zod";
import type { Invitation } from "@/lib/invitation";
import type { Locale } from "@/lib/i18n/numerals";
import { s } from "@/lib/i18n/strings";
import { mediaUrl } from "@/lib/media";
import { InnerCard } from "./inner-card";

const Method = z.object({
  label: z.string().min(1),
  account_name: z.string().optional(),
  qr_path: z.string().min(1),
});

/** Display-only gift QR codes (KBZPay, Wave, …). Nothing here moves money. */
export function GiftSection({ invitation, locale, plain }: { invitation: Invitation; locale: Locale; plain?: boolean }) {
  const methods = invitation.wedding.gift_methods.flatMap((m) => {
    const parsed = Method.safeParse(m);
    return parsed.success ? [parsed.data] : [];
  });
  if (methods.length === 0) return null;

  return (
    <InnerCard id="gift-heading" anchor="gift" plain={plain} heading={s("giftHeading", locale)} lang={locale}>
      <p className="card-body mt-5 text-ink">{s("giftIntro", locale)}</p>
      <ul className="mt-6 grid gap-6">
        {methods.map((m) => (
          <li key={m.qr_path} className="flex flex-col items-center">
            <p className="label-caps text-navy">{m.label}</p>
            <Image
              src={mediaUrl(m.qr_path)}
              alt={`${s("giftQrAlt", locale)} — ${m.label}`}
              width={240}
              height={240}
              className="mt-3 size-48 border border-navy/30 bg-white p-2"
            />
            {m.account_name && (
              <p className="card-body mt-3 text-ink">
                <span className="text-ink-soft">{s("giftAccountName", locale)}: </span>
                {m.account_name}
              </p>
            )}
          </li>
        ))}
      </ul>
    </InnerCard>
  );
}
