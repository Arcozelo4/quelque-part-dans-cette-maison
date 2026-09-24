const CACHE_NAME =
"quelque-part-maison-v5";

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

// ==========================================================
// INSTALLATION
// ==========================================================

self.addEventListener(
  "install",
  event => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(
          cache =>
            cache.addAll(
              FICHIERS
            )
        )
    );

    self.skipWaiting();
  }
);

// ==========================================================
// ACTIVATION
// ==========================================================

self.addEventListener(
  "activate",
  event => {
    event.waitUntil(
      caches
        .keys()
        .then(
          noms =>
            Promise.all(
              noms
                .filter(
                  nom =>
                    nom !==
                    CACHE_NAME
                )
                .map(
                  nom =>
                    caches.delete(
                      nom
                    )
                )
            )
        )
    );

    self.clients.claim();
  }
);

// ==========================================================
// REQUÊTES
// ==========================================================

self.addEventListener(
  "fetch",
  event => {
    const requete =
      event.request;

    if (
      requete.method !==
      "GET"
    ) {
      return;
    }

    const url =
      new URL(
        requete.url
      );

    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    event.respondWith(
      fetch(requete)
        .then(
          reponse => {
            const copie =
              reponse.clone();

            caches
              .open(
                CACHE_NAME
              )
              .then(
                cache =>
                  cache.put(
                    requete,
                    copie
                  )
              );

            return reponse;
          }
        )
        .catch(
          async () => {
            const cache =
              await caches.match(
                requete
              );

            if (cache) {
              return cache;
            }

            if (
              requete.mode ===
              "navigate"
            ) {
              return caches.match(
                "./index.html"
              );
            }

            throw new Error(
              "Ressource indisponible"
            );
          }
        )
    );
  }
);
