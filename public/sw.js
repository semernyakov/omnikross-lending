const CACHE_VERSION = 'omnikross-v3.0'
const ASSETS = [
  '/ru/solo.html',
  '/ru/agency.html',
  '/en/solo.html',
  '/en/agency.html',
  '/index.html',
  '/css/index.css',
  '/css/core.css',
  '/css/components.css',
  '/css/conversions.css',
  '/js/app.js',
  '/js/config.js',
  '/js/index.js',
  '/js/pages.js',
  '/js/validation.js',
  '/js/performance-a11y.js',
  '/js/responsive.js',
  '/js/router.js',
  '/manifest.json',
  '/manifest.en.json',
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)))
})
