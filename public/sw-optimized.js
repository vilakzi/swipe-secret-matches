
const CACHE_NAME = 'connect-pwa-v2';
const API_CACHE = 'connect-api-v2';
const IMAGE_CACHE = 'connect-images-v2';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/auth',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      caches.open(API_CACHE),
      caches.open(IMAGE_CACHE)
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes('-v2')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests (Network First strategy)
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
    return;
  }

  // Handle images (Cache First strategy)
  if (request.destination === 'image' || url.pathname.includes('/storage/v1/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            return response;
          }
          
          return fetch(request).then(fetchResponse => {
            // Cache the image for future use
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Handle app shell (Cache First strategy)
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }

      return fetch(request).then(fetchResponse => {
        // Cache the response for static assets
        if (fetchResponse.ok && (
          request.destination === 'script' ||
          request.destination === 'style' ||
          request.destination === 'document'
        )) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Fallback to offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions here
      console.log('Background sync triggered')
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New activity on Connect',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Connect', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
