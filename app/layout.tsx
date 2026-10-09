import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { fullName, profile } from "@/data/profile";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
});

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = `${fullName}, ${profile.role.join(" ")}`;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://saintz324.github.io/MyPortfolio.github.io/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: profile.bio,
  openGraph: {
    title,
    description: profile.bio,
    images: [{ url: profile.portrait.src.slice(1), width: profile.portrait.width, height: profile.portrait.height }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
