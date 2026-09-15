import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: "Nyaya Sahayak - AI for Legal Assistance & Access (India)",
  description:
    'Making Indian statutory law, contract rights, and legal remedies accessible through deterministic statutory reasoning and Gemini GenAI. Covers POSH Act 2013, PWDVA 2005, IT Act 2000, BNS 2023, and Indian Contract Act 1872.',
  keywords: [
    'POSH Act 2013',
    'Domestic Violence Act 2005',
    'BNS 2023',
    'BNSS Zero FIR',
    'Indian Contract Act Section 27',
    'Legal Assistance India',
    'Nyaya Sahayak'
  ],
  authors: [{ name: 'Nyaya Sahayak Team' }],
  applicationName: 'Nyaya Sahayak',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
