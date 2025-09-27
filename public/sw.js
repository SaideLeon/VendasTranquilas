// public/sw.js

// Define a unique cache name, including a version number.
// Incrementing the version will trigger the 'activate' event and clear old caches.
const CACHE_NAME = 'sigef-cache-v1';

// List of essential files to cache for the app shell to work offline.
const APP_SHELL_URLS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Add paths to your core CSS and JS bundles if they have predictable names.
  // Next.js generates hashed filenames, so we will cache pages as they are visited.
];

// The 'install' event is fired when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // waitUntil() ensures that the service worker will not install until the code inside has successfully completed.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // Add all the app shell URLs to the cache.
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete.');
        // Activate the new service worker immediately.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// The 'activate' event is fired when the service worker is activated.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    // Get all the cache names.
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache's name is not the current version, delete it.
          if (cacheName !== CACHE_NAME) {
            console.log(`Service Worker: Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('Service Worker: Activated and old caches cleared.');
        // Take control of all open pages.
        return self.clients.claim();
    })
  );
});

// The 'fetch' event is fired for every network request the page makes.
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    // For navigation requests (i.e., for HTML documents), use a Network Falling Back to Cache strategy.
    // This ensures the user always gets the freshest content if online, but can still access the app offline.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If the network request is successful, cache a copy and return the response.
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // If the network request fails, try to serve the response from the cache.
                    return caches.match(event.request)
                        .then(cachedResponse => {
                            return cachedResponse || caches.match('/'); // Fallback to the root page if the specific page isn't cached.
                        });
                })
        );
        return;
    }


    // For non-navigation requests (assets like CSS, JS, images), use a Cache First, then Network strategy.
    // This is ideal for static assets that don't change often.
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // If the response is in the cache, return it.
                if (cachedResponse) {
                    return cachedResponse;
                }

                // If the response is not in the cache, fetch it from the network.
                return fetch(event.request).then((networkResponse) => {
                    // Cache the new response for future use.
                    return caches.open(CACHE_NAME).then((cache) => {
                        // Don't cache chrome-extension URLs
                        if (event.request.url.startsWith('chrome-extension://')) {
                            return networkResponse;
                        }
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker: Fetch failed', error);
                // Optionally, you could return a fallback offline image or data here.
            })
    );
});
