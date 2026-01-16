import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 100],
    // Permite imágenes sin optimización para evitar problemas en desarrollo y modo dispositivo

    remotePatterns: [],
  },
  // Silencia el error de conflicto entre PWA (Webpack) y Turbopack
  turbopack: {},
  // Permite acceso desde la red local
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        ...(process.env.SERVER_IP ? [`${process.env.SERVER_IP}:3000`] : []),
        '192.168.9.195:3000',
        '192.168.9.195:3001',
      ],
    },
  },
};

// @ts-expect-error - allowedDevOrigins might not be in the type definition yet for some versions
nextConfig.allowedDevOrigins = [
  'localhost:3000',
  '192.168.9.195:3000',
  'localhost:3001',
  '192.168.9.195:3001',
];

export default withPWA(nextConfig);
