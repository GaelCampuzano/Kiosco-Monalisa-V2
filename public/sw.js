// Service Worker básico para Kiosco Monalisa
// Evita el error 404 cuando el navegador busca un service worker

const CACHE_NAME = 'monalisa-kiosco-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/bkg.jpg',
  '/logo-monalisa.svg',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch(() => {
        // Ignorar errores de caché
      })
  );
  self.skipWaiting(); // Activar inmediatamente
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia de caché: Network First, luego Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en caché
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde caché
        return caches.match(event.request);
      })
  );
});

