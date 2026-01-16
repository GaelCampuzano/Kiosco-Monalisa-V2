import { useEffect } from 'react';

export function useImageCache(isOffline: boolean) {
  useEffect(() => {
    if (!isOffline && typeof window !== 'undefined' && 'caches' in window) {
      const cacheImages = async () => {
        try {
          const cache = await caches.open('monalisa-images-v1');
          const imagesToCache = ['/bkg.jpg', '/logo-monalisa.svg'];

          await Promise.allSettled(
            imagesToCache.map(async (url) => {
              const cached = await cache.match(url);
              if (!cached) {
                const response = await fetch(url, { cache: 'force-cache' });
                if (response.ok) {
                  await cache.put(url, response);
                }
              }
            })
          );
        } catch {
          // Fallo silencioso si la API de caché falla
        }
      };
      cacheImages();
    }
  }, [isOffline]);
}
