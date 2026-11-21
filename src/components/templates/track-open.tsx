"use client";

import { useEffect } from "react";

/**
 * Records that a guest opened their personal link, on their first scroll,
 * tap or key press. Link-preview bots never do any of those.
 */
export function TrackOpen({
  slug,
  token,
  action,
}: {
  slug: string;
  token: string | null;
  action: (slug: string, token: string) => Promise<void>;
}) {
  useEffect(() => {
    if (!token) return;
    const events = ["pointerdown", "scroll", "keydown"] as const;
    const fire = () => {
      events.forEach((e) => window.removeEventListener(e, fire));
      void action(slug, token);
    };
    events.forEach((e) => window.addEventListener(e, fire, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, fire));
  }, [slug, token, action]);
  return null;
}
