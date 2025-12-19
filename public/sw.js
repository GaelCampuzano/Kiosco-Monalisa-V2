// Service Worker optimizado para Kiosco Monalisa
const CACHE_NAME = 'monalisa-kiosco-v2'; // Incrementamos versión por cambios de lógica
const urlsToCache = [
  '/',
  '/manifest.json',
  '/bkg.jpg',
  '/logo-monalisa.svg',
];

// Instalación: Cachear activos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación: Limpiar cachés antiguos
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

// Estrategia de Red: Network First con fallback a Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // MEJORA: No interceptar peticiones que no sean GET (esto elimina el error de los POST)
  if (request.method !== 'GET') return;

  // MEJORA: Ignorar esquemas que no sean http/https (como chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // MEJORA: Ignorar llamadas de API o de Next.js internas para evitar conflictos
  if (url.pathname.includes('/api/') || url.pathname.includes('_next')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear si la respuesta es válida y del mismo origen (seguridad)
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red (offline), buscar en caché
        return caches.match(request);
      })
  );
});