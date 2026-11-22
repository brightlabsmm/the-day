import { Cinzel } from "next/font/google";

/** Engraved capitals for gift pages only, so other pages do not load it. */
export const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
