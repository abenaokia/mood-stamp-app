// 気分スタンプ帳 - オフライン対応用サービスワーカー
// ※ file:// で直接開いた場合、ブラウザの制限によりサービスワーカーは登録されません。
//    http/https でホスティングした場合にオフラインキャッシュが有効になります。

var CACHE_NAME = "mood-stamp-cache-v1";
var ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.svg",
  "./icon-512.svg"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  event.respondWith(
    caches.match(event.request).then(function(cached){
      var fetchPromise = fetch(event.request).then(function(res){
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, res.clone());
        });
        return res;
      }).catch(function(){ return cached; });
      return cached || fetchPromise;
    })
  );
});
