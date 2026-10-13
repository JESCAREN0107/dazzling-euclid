import type { Metadata, Viewport } from 'next';
import { poppins, fraunces } from '@/lib/fonts';
import { env } from '@/lib/env';
import './globals.css';

const siteUrl = env.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lumière Skin & Spa — Clínica Dermoestética & Spa en Río Bravo / Reynosa',
    template: '%s · Lumière Skin & Spa',
  },
  description:
    'Clínica dermoestética facial, hidrodermoabrasión, lifting sin cirugía y rituales botánicos en Río Bravo / Reynosa, Tamaulipas. Reserva tu cita en línea con confirmación inmediata.',
  keywords: [
    'Lumière Skin & Spa',
    'spa en Río Bravo',
    'spa en Reynosa',
    'faciales Tamaulipas',
    'hidrafacial',
    'dermaplaning',
    'clínica dermoestética Tamaulipas',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: siteUrl,
    siteName: 'Lumière Skin & Spa',
    title: 'Lumière Skin & Spa — Clínica Dermoestética & Spa',
    description:
      'Tratamientos faciales clínicos, hidrodermoabrasión y rituales de relajación en Tamaulipas. Reserva en línea.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumière Skin & Spa — Tamaulipas',
    description: 'Clínica dermoestética facial y rituales de spa. Reserva en línea.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF8F3' },
    { media: '(prefers-color-scheme: dark)', color: '#14110F' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const themeBootstrap = `
(function(){
  try {
    var stored = localStorage.getItem('lumiere-theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${poppins.variable} ${fraunces.variable}`}>{children}</body>
    </html>
  );
}
