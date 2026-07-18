const CACHE_NAME = 'msme-manager-v1'
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell')
      return cache.addAll(URLS_TO_CACHE.filter((url) => url !== '/'))
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - Network first strategy for API calls, Cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests - Network first
  if (request.url.includes('/api/') || request.url.includes('/_next/data/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || new Response('Offline - Content not available', { status: 503 })
          })
        })
    )
  } else {
    // Handle static assets - Cache first
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response
        }

        return fetch(request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }

          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
      })
    )
  }
})

// Background sync (optional - for future use)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag)
  if (event.tag === 'sync-inventory') {
    event.waitUntil(
      // Add your background sync logic here
      Promise.resolve()
    )
  }
})
