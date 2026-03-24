import type { Metadata } from 'next';
import { Baloo_2, Cherry_Bomb_One, Geist, Geist_Mono, Nunito } from 'next/font/google';

import './globals.css';

const cherryBomb = Cherry_Bomb_One({
  variable: '--font-cherry-bomb-one',
  subsets: ['latin'],
  weight: '400',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });
const baloo = Baloo_2({ subsets: ['latin'], variable: '--font-baloo' });

export const metadata: Metadata = {
  title: 'Japaneasy',
  description: 'Master Japanese the easy way',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cherryBomb.variable} ${nunito.variable} ${baloo.variable} bg-background min-h-screen antialiased font-nunito`}
      >
        {children}
      </body>
    </html>
  );
}
