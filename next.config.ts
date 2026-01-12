const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 100],
    // Permite imágenes sin optimización para evitar problemas en desarrollo y modo dispositivo
    unoptimized: true,
    remotePatterns: [],
  },
  // Silencia el error de conflicto entre PWA (Webpack) y Turbopack
  turbopack: {},
};

export default withPWA(nextConfig);