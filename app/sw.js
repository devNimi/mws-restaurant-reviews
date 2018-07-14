(function() {
  'use strict';
    const filesToCache = [
      '.',
      'css/main.css',
      'css/404-or-offline.css',
      'https://fonts.googleapis.com/css?family=Raleway:300,400,500,700',
      'js/lib/idb.js',
      'js/dbhelper.js',
      'js/main.js',
      'js/restaurant_info.js',
      'img/1.jpg',
      'img/2.jpg',
      'img/3.jpg',
      'img/4.jpg',
      'img/5.jpg',
      'img/6.jpg',
      'img/7.jpg',
      'img/8.jpg',
      'img/9.jpg',
      'img/10.jpg',
      'img/icons-192.png',
      'img/icons-512.png',
      'manifest.json',
      'index.html',
      // 'restaurant.html', //no need to cache
      // it is later cached in fetch event
      'offline.html',
      '404.html',
    ];

    const staticCacheName = 'restaurant-app-v4';

    self.addEventListener('install', function(event) {
      console.log('Attempting to install service worker and cache static assets');
      event.waitUntil(
        caches.open(staticCacheName)
        .then(function(cache) {
          return cache.addAll(filesToCache);
        })
      );
    });

    self.addEventListener('fetch', function(event) {
      let requestUrl = new URL(event.request.url);
      if (requestUrl.origin === location.origin) {
        // since right now we are serving single html page, for any requests
        // we'll be caching restaurant.html page only once
        if (requestUrl.pathname.startsWith('/restaurant.html')) {
          event.respondWith(serveRestaurantHTML(event.request));
          return;
        };
        // Don't cache PUT/POST requests
        if (event.request.method !== 'GET') return;
        event.respondWith(
          caches.match(event.request).then(function(response) {
            if (response) {
              return response;
            }
            return fetch(event.request).then(function(response) {
              if (response.status === 404) {
                /*
                Note: When intercepting a network request and serving a custom
                response, the service worker does not redirect the user to the
                address of the new response. The response is served at the address
                of the original request. For example, if the user requests a
                nonexistent file at www.example.com/non-existent.html and the
                service worker responds with a custom 404 page, 404.html,
                the custom page will display at www.example.com/non-existent.html,
                not www.example.com/404.html
                */
                return caches.match('404.html');
              }
              return caches.open(staticCacheName).then(function(cache) {
                cache.put(event.request.url, response.clone());
                return response;
              });
            });
          }).catch(function(error) {
            // If fetch cannot reach the network, it throws an error and sends it
            // to .catch.
            return caches.match('offline.html');
          })
        );
      };
    });

    //  delete unused caches
    self.addEventListener('activate', function(event) {
      console.log('Activating new service worker...');

      let cacheWhitelist = [staticCacheName];

      event.waitUntil(
        caches.keys().then(function(cacheNames) {
          return Promise.all(
            cacheNames.map(function(cacheName) {
              if (cacheWhitelist.indexOf(cacheName) === -1) {
                return caches.delete(cacheName);
              }
            })
          );
        })
      );
    });

    self.addEventListener('sync', function(event) {
      console.log(`Connectivity is stable again :) Let's put data online `);
      if (event.tag == 'reviewSync') {
        console.log('sync event fired for reviews that user added while offline');
        event.waitUntil(sendMessageToClient({message: 'post-offline-reviews-to-server'}));
      }
    });
    // https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
    function sendMessageToClient(message) {
        // Send a message to the client.
        self.clients.matchAll().then(function(clients) {
          clients.forEach(function(client) {
            client.postMessage(message);
          });
        });
    }

    // serves restaurants.html page
    function serveRestaurantHTML(request) {
      console.log(request);
      // Use this url to store & match retaurants.hmtl in the cache.
      // This means you only store one copy of restaurants.html
      const storageUrl = request.url.split('?')[0];

      return caches.open(staticCacheName).then(function(cache) {
         return cache.match(storageUrl).then(function(response) {
           if (response) return response;

           return fetch(request).then(function(networkResponse) {
             cache.put(storageUrl, networkResponse.clone());
             return networkResponse;
           });
         });
       });
    }
})();
