/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    // ELIMINADA: La propiedad 'quality' que está causando el error "Unrecognized key(s)"
    // La calidad se manejará a nivel de prop en el componente <Image>.
  }
};

export default nextConfig;