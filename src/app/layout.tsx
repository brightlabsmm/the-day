import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono, Great_Vibes, Jost, Noto_Serif_Myanmar, Pacifico, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./templates.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Burmese glyphs only load on pages that actually render Burmese text.
const notoMyanmar = Noto_Serif_Myanmar({
  variable: "--font-noto-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Used only by the Editorial / Scratch / Envelope templates.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});
const greatVibes = Great_Vibes({ variable: "--font-script", subsets: ["latin"], weight: "400", display: "swap" });

const pacifico = Pacifico({ variable: "--font-brush", subsets: ["latin"], weight: "400", display: "swap" });

const dmMono = DM_Mono({ variable: "--font-mono-label", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "THE DAY — Make Your Day Unforgettable",
    template: "%s · THE DAY",
  },
  description: "Digital wedding invitations by Bright Labs.",
};

export const viewport: Viewport = {
  themeColor: "#ede0ca",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="my"
      className={`${cormorant.variable} ${notoMyanmar.variable} ${jost.variable} ${playfair.variable} ${greatVibes.variable} ${pacifico.variable} ${dmMono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
