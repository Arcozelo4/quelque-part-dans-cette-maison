const CACHE_NAME =
  "quelque-part-maison-v3";

const FICHIERS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener(
  "install",
  event => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(cache =>
          cache.addAll(FICHIERS)
        )
    );

    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  event => {
    event.waitUntil(
      caches
        .keys()
        .then(noms =>
          Promise.all(
            noms
              .filter(
                nom =>
                  nom !== CACHE_NAME
              )
              .map(
                nom =>
                  caches.delete(nom)
              )
          )
        )
    );

    self.clients.claim();
  }
);

self.addEventListener(
  "fetch",
  event => {
    if (
      event.request.method !== "GET"
    ) {
      return;
    }

    event.respondWith(
      caches
        .match(event.request)
        .then(
          reponseCache => {
            if (reponseCache) {
              return reponseCache;
            }

            return fetch(
              event.request
            )
              .then(
                reponse => {
                  const copie =
                    reponse.clone();

                  caches
                    .open(CACHE_NAME)
                    .then(
                      cache =>
                        cache.put(
                          event.request,
                          copie
                        )
                    );

                  return reponse;
                }
              )
              .catch(
                () =>
                  caches.match(
                    "./index.html"
                  )
              );
          }
        )
    );
  }
);
