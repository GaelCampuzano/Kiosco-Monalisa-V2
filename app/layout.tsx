import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from 'sonner';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';

const googleSans = localFont({
  src: '../fonts/GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf',
  variable: '--font-google-sans',
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
    <html lang="es" className={googleSans.variable} suppressHydrationWarning>
      <body className="antialiased bg-[#162B46] text-[#B2B2B2]">
        <ServiceWorkerRegistration />
        <Toaster position="top-center" richColors theme="dark" />
        {children}
      </body>
    </html>
  );
}
