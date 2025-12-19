'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Solo registrar si el navegador lo soporta y estamos en producción (opcional)
    if ('serviceWorker' in navigator) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado correctamente:', registration.scope);
          })
          .catch((error) => {
            console.error('Error al registrar el Service Worker:', error);
          });
      };

      // Registrar después de que cargue la página para no interferir con el preload de Next.js
      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, []);

  return null;
}