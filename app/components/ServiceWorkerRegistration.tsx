'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(() => {
            console.log('Service Worker registrado correctamente');
          })
          .catch(() => {
            // Silenciar errores de registro del service worker
          });
      });
    }
  }, []);

  return null;
}

