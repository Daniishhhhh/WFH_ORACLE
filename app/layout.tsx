import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans } from 'next/font/google';
import './globals.css';

const display = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: { icon: '/favicon.svg' },
  title: 'Should I WFH Today? — Bengaluru Edition',
  description: 'A weather-powered Bengaluru oracle for the daily WFH decision.',
  openGraph: {
    title: 'Should I WFH Today? — Bengaluru Edition',
    description: 'A weather-powered Bengaluru oracle for the daily WFH decision.',
    type: 'website',
    images: [{ url: '/api/card?verdict=MAYBE&score=52&area=Koramangala&tone=corporate', width: 1200, height: 630, alt: 'Should I WFH Today result card' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Should I WFH Today? — Bengaluru Edition',
    description: 'The Bengaluru commute has been assessed.',
    images: ['/api/card?verdict=MAYBE&score=52&area=Koramangala&tone=corporate'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
