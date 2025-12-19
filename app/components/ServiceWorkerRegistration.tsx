'use client'

import { useEffect } from 'react'

// Usamos export default para que el layout lo encuentre correctamente
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado con éxito:', registration.scope);
          })
          .catch((error) => {
            console.error('Error en el registro del SW:', error);
          });
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, []);

  return null; // Este componente no renderiza nada visual
}