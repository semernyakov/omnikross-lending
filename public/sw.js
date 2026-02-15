/**
 * OMNIKROSS v4.0 — Service Worker
 * Strategy: Cache First for Static Assets
 */

const CACHE_NAME = "omnikross-v4.0";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/css/core.css",
  "/js/config.js",
  "/js/AppCore.js",
  "/assets/kross-node.svg",
  // 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap'
];

// Установка: Кэшируем всё необходимое
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// Активация: Чистим старые кэши
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

// Перехват запросов
self.addEventListener("fetch", (event) => {
  // Не кэшируем запросы к API
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Кэшируем новые статические ресурсы на лету
        if (networkResponse.ok && event.request.method === "GET") {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }),
  );
});
