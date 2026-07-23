const CACHE_NAME = "momentum-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/storage.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const buscaDaRede = fetch(event.request)
        .then((resposta) => {
          if (resposta && resposta.ok) {
            const copia = resposta.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          }
          return resposta;
        })
        .catch(() => cached);
      return cached || buscaDaRede;
    })
  );
});
