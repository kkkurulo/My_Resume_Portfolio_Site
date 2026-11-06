import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const serif = Source_Serif_4({ subsets: ["latin", "cyrillic"], variable: "--font-source-serif" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-jetbrains" });

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || (productionHost ? `https://${productionHost}` : "http://localhost:3000"),
  ),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#12161a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
