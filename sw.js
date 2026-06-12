// Service Worker para TECNI-YA
// Propósito: Forzar la actualización de la página cuando hay cambios
// Evita que el navegador muestre versiones antiguas en caché

const CACHE_NAME = 'tecniya-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/firebase-config.js'
];

// Al instalar, precargar archivos esenciales
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Al activar, limpiar cachés antiguas
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
  // Tomar control de todas las páginas abiertas inmediatamente
  self.clients.claim();
});

// Estrategia: siempre ir a la red primero, y solo usar caché si falla
self.addEventListener('fetch', (event) => {
  // Para el index.html y páginas HTML, SIEMPRE ir a la red
  if (event.request.mode === 'navigate' || 
      (event.request.url.includes('.html')) ||
      event.request.url === self.location.origin + '/' ||
      event.request.url === self.location.origin + '/index.html') {
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Actualizar la caché con la nueva versión
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si no hay red, mostrar la versión cacheada
          return caches.match(event.request);
        })
    );
    return;
  }

  // Para el resto de archivos (JS, CSS, imágenes), usar estrategia: red primero, caché como fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
