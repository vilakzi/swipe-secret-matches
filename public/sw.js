
const CACHE_NAME = 'connect-pwa-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// Enhanced mobile-optimized service worker
self.addEventListener('install', (event) => {
  console.log('SW: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('SW: Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Enhanced fetch with proper method filtering for caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for caching
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Only cache successful GET responses
            if (response.status === 200 && event.request.method === 'GET') {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached version if available
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Handle regular requests (only GET)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            // Cache successful GET responses only
            if (response.status === 200 && response.type === 'basic' && event.request.method === 'GET') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html') || caches.match('/');
        }
      })
  );
});

// Enhanced activate event
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Connect',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: 'connect-notification'
  };

  event.waitUntil(
    self.registration.showNotification('Connect', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      Promise.resolve()
    );
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(
      Promise.resolve()
    );
  }
});
