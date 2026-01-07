import type { Metadata } from "next";
import { Geist, Geist_Mono, Cherry_Bomb_One } from "next/font/google";
import "./globals.css";

const cherryBomb = Cherry_Bomb_One({
  variable: "--font-cherry-bomb-one",
  subsets: ["latin"],
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Japaneasy",
  description: "Master Japanese the easy way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cherryBomb.variable} antialiased bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
