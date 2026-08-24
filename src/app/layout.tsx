import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { CaseProvider } from "@/lib/store";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
  title: "Golden Hour - Cyber Fraud Action Room",
  description:
    "In Indian cyber fraud the outcome is decided in the first hour. Golden Hour shows you the clock, tells you what to do in the order that recovers money, and explains what happens next. An independent prototype using synthetic data.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#171514" },
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
        className={`${inter.variable} ${notoDeva.variable} ${jetbrains.variable} antialiased`}
      >
        <CaseProvider>
          <PrototypeBanner />
          {children}
        </CaseProvider>
      </body>
    </html>
  );
}
