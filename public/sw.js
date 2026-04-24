// PaketShop Service Worker v1.2
const CACHE_NAME = 'paketshop-v1.2';
const OFFLINE_URL = '/';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/logo-light.png',
  '/logo.png',
  '/manifest.json'
];

// Domains to cache images from
const IMAGE_DOMAINS = [
  'images.unsplash.com',
  'picsum.photos',
  'supabase.co',
  'paketshop.uz'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Skip API calls
  if (url.pathname.startsWith('/api/')) return;

  // Logic for caching images (even from other origins)
  const isImageRequest = 
    event.request.destination === 'image' || 
    IMAGE_DOMAINS.some(domain => url.hostname.includes(domain));

  if (isImageRequest) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networked = fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const cacheCopy = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, cacheCopy);
              });
            }
            return response;
          })
          .catch(() => cached);

        return cached || networked;
      })
    );
    return;
  }

  // Logic for internal pages / assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
  }
});
