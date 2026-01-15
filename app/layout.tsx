import type { Metadata, Viewport } from 'next'; //
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const lato = Lato({
  variable: '--font-lato',
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Evita zoom accidental en dispositivos táctiles como iPad
  themeColor: '#162B46',
};

export const metadata: Metadata = {
  title: {
    default: 'Kiosco Monalisa',
    template: '%s | Monalisa Tips',
  },
  description: 'Sistema de gestión de propinas para Sunset Monalisa.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Monalisa Tips',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://propinas.sunsetmonalisa.com',
    title: 'Kiosco Monalisa',
    description: 'Sistema de gestión de propinas.',
    siteName: 'Sunset Monalisa',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${lato.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-[#162B46] text-[#B2B2B2]">
        <ServiceWorkerRegistration />
        <Toaster position="top-center" richColors theme="dark" />
        {children}
      </body>
    </html>
  );
}
