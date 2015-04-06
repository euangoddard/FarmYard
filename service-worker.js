/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

'use strict';



var PrecacheConfig = [["/css/main.css","1ab25e82b4402ff31743c2833d8339b7"],["/img/cat.svg","add805ea789a66dbe2357f2fcf15283e"],["/img/chicken.svg","81986e6b09a3efbdc4516923f748e6cb"],["/img/cockerel.svg","04cd10c7649faaecb070f0ddd26ac0c7"],["/img/cow.svg","7f2fe122b2da5d38f3da2a9c174b9948"],["/img/dog.svg","842746b679c7cb13962a26484e717b5b"],["/img/donkey.svg","5fde2dfba43a3188ebdec4f9fa7f2d99"],["/img/elephant.svg","e3ac4c0771fa777cb8e6cb08837edcd7"],["/img/fox.svg","2c43627991eeb12159666bf5aeaa0c9c"],["/img/help/swipe.svg","3c805a97088daf35f428b080611b35e5"],["/img/help/tap.svg","31e7b3fdda4c7e305093779428c5a511"],["/img/horse.svg","3eda302bf423e06588c7d40e23194949"],["/img/leopard.svg","d916e9339c7256d6ff65afc8a0794748"],["/img/lion.svg","8d609a8f9d230ec428bcc6bb7ae0418c"],["/img/lioness.svg","5ca8640a7942ec530a646d3d914f2b43"],["/img/monkey.svg","5c492997ef0dea8bfda76ec6bf5920cc"],["/img/orangutan.svg","533734c0cd94350aad644bea735ea341"],["/img/owl.svg","d81808bb6cfa4829cc1f69f218328900"],["/img/panda.svg","07159a3df5cfcd9a47585c588000841b"],["/img/penguin.svg","11307b0e3d56b663c33cd6e218bd831e"],["/img/pig.svg","eeba5063cf33e2a1bc54753530db4559"],["/img/puma.svg","33b80812927efb653467861bf6d49231"],["/img/reindeer.svg","125aac2a9fb241bd2320c7e48d8f7c05"],["/img/sheep.svg","4105dcfb031f46c1b54c8a1ede2421dc"],["/img/tiger.svg","3d9670038e2e3f05d002f4a828ba229e"],["/img/zebra.svg","d11c04a247b726a8897d7c314622899d"],["/index.html","27de60e4d7c96e4ac3bf7df4b4cf2490"],["/js/app.js","1d1fed0b0475046071f3c5f647526616"],["/js/lib/angular-animate.min.js","7b6649d7458b30b79c85d316e0bd3d70"],["/js/lib/angular-touch.min.js","99752d5b05ed3ab2c7de354265b60f47"],["/js/lib/angular.min.js","fa01f26d0b1419bb939f5d6401517f3e"],["/js/lib/lodash.js","06d28202bf48e22a9d90673c8498c0d5"],["/js/lib/modernizr.audio.js","85f01d976e321464a00fbe62e04f1a2b"],["/js/lib/service-worker-registration.js","a3859c235652df5cb8dd551726beea3e"],["/partials/animal.html","532b52c4a6994966378e60b6e08d7f8d"],["/service-worker.js","d96360d58b25ebb909bec47bd9c9fbc0"],["/sounds/cat.ogg","a22471dd39828a02a8bef58c6ba82bc2"],["/sounds/chicken.ogg","98646f7f8abcebccbab50365070ccba1"],["/sounds/cockerel.ogg","54fece8a7104bca594fb03123874694a"],["/sounds/cow.ogg","43e378d86488aab6cdb40a8ec58cc903"],["/sounds/dog.ogg","eaf3fcaaff690effdb1836219915fb60"],["/sounds/donkey.ogg","068267a400496e4a668088bdb4cfd363"],["/sounds/elephant.ogg","32194956b108317730816b4f2cc31c36"],["/sounds/fox.ogg","b91913513c772e4b9e793f0b5018f398"],["/sounds/goat.ogg","525e594911154d347cb49efc08c22939"],["/sounds/horse.ogg","6b2554670040552014e1d21a80f9dbd9"],["/sounds/leopard.ogg","04695bc15a5c93edbd3b322741cdc670"],["/sounds/lion.ogg","23dcfab1a5458f2e02e682ad780de9a4"],["/sounds/lioness.ogg","6816c3111b2c748a37c1ce736d8ed0d6"],["/sounds/monkey.ogg","b0815705726e45213870aa1ee7fe79cc"],["/sounds/orangutan.ogg","335dbd40497bf5f7d062dd35fb7e9226"],["/sounds/owl.ogg","71a0505d2ed6405a634c991800c1b853"],["/sounds/panda.ogg","5475c57efe2568830f5b0d94192733d0"],["/sounds/penguin.ogg","665211979f7410ae1f9e32a6c946825a"],["/sounds/pig.ogg","3d90c644481db5c46acf1610bd28b803"],["/sounds/puma.ogg","a67fdf1100ee2cc59fae0a6724a41a59"],["/sounds/reindeer.ogg","fe2557f39e6f5ede2ae8355b115d9f98"],["/sounds/sheep.ogg","cf80073ff8ec9d37a19b17adb3742403"],["/sounds/tiger.ogg","8bc03c27cfd3803e3a75e32e24956808"],["/sounds/zebra.ogg","405e1cfc215882ff9067f0b59bba3c33"]];
var CacheNamePrefix = 'sw-precache-v1--' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var populateCurrentCacheNames = function (precacheConfig, cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl, ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  var now = Date.now();

  event.waitUntil(
    caches.keys().then(function(allCacheNames) {
      return Promise.all(
        Object.keys(CurrentCacheNamesToAbsoluteUrl).filter(function(cacheName) {
          return allCacheNames.indexOf(cacheName) == -1;
        }).map(function(cacheName) {
          var url = new URL(CurrentCacheNamesToAbsoluteUrl[cacheName]);
          // Put in a cache-busting parameter to ensure we're caching a fresh response.
          if (url.search) {
            url.search += '&';
          }
          url.search += 'sw-precache=' + now;
          var urlWithCacheBusting = url.toString();

          console.log('Adding URL "%s" to cache named "%s"', urlWithCacheBusting, cacheName);
          return caches.open(cacheName).then(function(cache) {
            var request = new Request(urlWithCacheBusting, {credentials: 'same-origin'});
            return fetch(request.clone()).then(function(response) {
              if (response.status == 200) {
                return cache.put(request, response);
              } else {
                console.error('Request for %s returned a response with status %d, so not attempting to cache it.',
                  urlWithCacheBusting, response.status);
                // Get rid of the empty cache if we can't add a successful response to it.
                return caches.delete(cacheName);
              }
            });
          });
        })
      ).then(function() {
        return Promise.all(
          allCacheNames.filter(function(cacheName) {
            return cacheName.indexOf(CacheNamePrefix) == 0 &&
                   !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            console.log('Deleting out-of-date cache "%s"', cacheName);
            return caches.delete(cacheName);
          })
        )
      });
    }).then(function() {
      if (typeof self.skipWaiting == 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim == 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command == 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


self.addEventListener('fetch', function(event) {
  if (event.request.method == 'GET') {
    var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
      IgnoreUrlParametersMatching);

    var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    if (cacheName) {
      event.respondWith(
        // We can't call cache.match(event.request) since the entry in the cache will contain the
        // cache-busting parameter. Instead, rely on the fact that each cache should only have one
        // entry, and return that.
        caches.open(cacheName).then(function(cache) {
          return cache.keys().then(function(keys) {
            return cache.match(keys[0]).then(function(response) {
              return response || fetch(event.request).catch(function(e) {
                console.error('Fetch for "%s" failed: %O', urlWithoutIgnoredParameters, e);
              });
            });
          });
        }).catch(function(e) {
          console.error('Couldn\'t serve response for "%s" from cache: %O', urlWithoutIgnoredParameters, e);
          return fetch(event.request);
        })
      );
    }
  }
});

