import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ArcScan Pro - Arc Network Explorer",
  description: "Explorer & Analytics Dashboard for the Arc Blockchain by Circle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body
        style={{
          margin: 0,
          fontFamily: "var(--font-dm-sans), sans-serif",
          backgroundColor: "#F5F6F8",
          color: "#0D1117",
          minHeight: "100vh",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
