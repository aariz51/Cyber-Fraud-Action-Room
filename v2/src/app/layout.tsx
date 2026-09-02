import type { Metadata, Viewport } from "next";
import {
  DM_Serif_Display,
  JetBrains_Mono,
  Manrope,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { CaseProvider } from "@/lib/store";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const editorial = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  weight: "400",
});

const notoDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-deva",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://golden-hour-rust-mu.vercel.app"),
  title: {
    default: "Golden Hour — Cyber Fraud Action Room",
    template: "%s — Golden Hour",
  },
  description:
    "Every cyber fraud has two victims: the one who was robbed, and the one whose account is frozen because the money passed through it. Golden Hour works both, and names the four missing fields that cause them.",
  openGraph: {
    title: "Golden Hour — Cyber Fraud Action Room",
    description:
      "Every cyber fraud has two victims. The second one has no door. A private, device-local hackathon prototype.",
    type: "website",
    siteName: "Golden Hour",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Hour — Cyber Fraud Action Room",
    description: "A calm command room for the first hours after cyber fraud.",
  },
  applicationName: "Golden Hour",
  authors: [{ name: "Aariz" }],
  keywords: [
    "cyber fraud", "account frozen", "lien marked", "NCRP complaint", "1930 helpline",
    "CFCFRMS", "unfreeze bank account", "cyber crime India", "second victim",
  ],
  robots: { index: true, follow: true },
  category: "civic technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e6" },
    { media: "(prefers-color-scheme: dark)", color: "#101416" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${editorial.variable} ${notoDeva.variable} ${jetbrains.variable} antialiased`}
      >
        <CaseProvider>
          <PrototypeBanner />
          {children}
        </CaseProvider>
      </body>
    </html>
  );
}
