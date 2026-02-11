const CACHE_NAME = "omnikross-v2.1";
const ASSETS = [
  "/index_ru.html",
  "/index_en.html",
  "/index.html",
  "/css/styles.css",
  "/css/animations.css",
  "/css/roi-calculator.css",
  "/js/simulator.js",
  "/js/forms.js",
  "/js/theme.js",
  "/js/roi-calculator.js",
  "/manifest.json",
  "/manifest.en.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)),
  );
});
