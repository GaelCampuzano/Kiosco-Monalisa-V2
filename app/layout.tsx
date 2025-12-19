import type { Metadata, Viewport } from "next"; //
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Evita zoom accidental en iPad
  themeColor: "#162B46",
};

export const metadata: Metadata = {
  title: "Kiosco Monalisa",
  description: "Sistema de propinas Sunset Monalisa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Monalisa Tips",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${lato.variable}`}>
      <body className="antialiased bg-[#162B46] text-[#B2B2B2]">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}