// Service Worker optimizado para Kiosco Monalisa
const CACHE_NAME = 'monalisa-kiosco-v2';
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

// Estrategia: Network First con filtrado de métodos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CORRECCIÓN: El Cache API no soporta 'POST'. Solo procesamos 'GET'.
  if (request.method !== 'GET') return;

  // MEJORA: Ignorar peticiones que no sean http/https (como extensiones de Chrome)
  if (!url.protocol.startsWith('http')) return;

  // MEJORA: No cachear rutas de API ni archivos internos de Next.js
  if (url.pathname.includes('/api/') || url.pathname.includes('_next')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Solo cachear respuestas exitosas de origen local
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback al caché si no hay internet
        return caches.match(request);
      })
  );
});