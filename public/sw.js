// Service Worker optimizado para Kiosco Monalisa V2
const CACHE_NAME = 'monalisa-resilience-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/bkg.jpg',
  '/logo-monalisa.svg',
  '/favicon.ico',
  '/fonts/GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf',
];

// Instalación: Cachear activos estáticos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-cacheando activos estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Limpieza de versiones previas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia de Fetch: Stale-While-Revalidate para mayor fluidez
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo procesar GET
  if (request.method !== 'GET') return;
  // Solo protocolos http/https
  if (!url.protocol.startsWith('http')) return;

  // No cachear API ni imágenes dinámicas externas (si las hubiera)
  if (url.pathname.includes('/api/') || url.pathname.includes('/_next/image')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Intentar fetch en paralelo para actualizar caché (Stale-While-Revalidate)
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si estamos offline y es una navegación, devolver el fallback de la raíz
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });

      // Devolver del caché inmediatamente si existe, si no, esperar al fetch
      return cachedResponse || fetchPromise;
    })
  );
});
