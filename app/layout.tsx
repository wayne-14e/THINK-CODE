import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { FirebaseProvider } from '@/components/providers/firebase-provider';
import { I18nProvider } from '@/lib/i18n';
import { AcademyErrorBoundary } from '@/components/error-boundary';

// Keep a font manifest in the standalone build without relying on network font downloads.
const buildFallback = localFont({
  src: '../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2',
  variable: '--font-build-fallback',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'THINK//CODE Academy',
  description:
    'Serious algorithmic thinking, a competitive programming sandbox, and live academy workshops — Think. Code. Repeat.',
  openGraph: {
    title: 'THINK//CODE Academy',
    description:
      'Serious algorithmic thinking, a competitive programming sandbox, and live academy workshops — Think. Code. Repeat.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THINK//CODE Academy',
    description:
      'Serious algorithmic thinking, a competitive programming sandbox, and live academy workshops — Think. Code. Repeat.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={buildFallback.variable}>
      <body className="min-h-screen antialiased">
        <AcademyErrorBoundary>
          <I18nProvider>
            <FirebaseProvider>{children}</FirebaseProvider>
          </I18nProvider>
        </AcademyErrorBoundary>
      </body>
    </html>
  );
}
