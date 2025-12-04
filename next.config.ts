/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 100],
    // Permite imágenes sin optimización para evitar problemas en desarrollo y modo dispositivo
    unoptimized: true,
    remotePatterns: [],
  }
};

export default nextConfig;