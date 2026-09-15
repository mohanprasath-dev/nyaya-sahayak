import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Nyaya Sahayak - Women's Legal Safety & Rights Assistant",
  description:
    'Empowering women in India with verified legal statutes (POSH Act 2013, PWDVA 2005, IT Act 2000, BNS 2023), immediate action roadmaps, emergency helplines, and customized complaint draft templates.',
  keywords: [
    'POSH Act 2013',
    'Domestic Violence Act 2005',
    'BNS 2023',
    'IPC 354',
    'IT Act 66E',
    'Women Legal Rights India',
    'Nyaya Sahayak'
  ]
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
