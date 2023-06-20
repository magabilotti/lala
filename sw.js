// Declaro variables para el nombre del caché y array con recursos para almacenar en el precache
const cacheName = 'pwa-cache-files';
const assets = [' ',
                'index.html',
                'error.html',
                'personajes.html',
                'favorito.html',
                'manifest.json',
                'css/main.css',
                'js/main.js',
                'js/favorito.js',
                'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css',
                'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js'
                ];

// Instalación
self.addEventListener('install', (e) => {
  // Saltamos la espera de forma automática
  self.skipWaiting();
  //console.log('Service Worker Instalado', e);

  // Hacemos el precaching, guardando en caché los recursos para la carga inicial del index
  e.waitUntil(
    // cache.open > si existe, lo abre y no lo crea; si no, lo crea
    caches.open(cacheName)
      .then(cache => {
        cache.addAll(assets);
      })
  );
});

// Activación
self.addEventListener('activate', (e) => {
  //console.log('Service Worker Activo', e);
});

// Capturamos las peticiones de la interfaz
self.addEventListener('fetch', (e) => {
  console.log('Request', e);
  e.respondWith(
    caches.match(e.request) // Buscamos el recurso si está en el caché del Service Worker
      .then(response => {
        if (response) { // Si el recurso se encuentra en caché
          return response; // Devolvemos el recurso desde el caché
        }

        //si llego a este punto, es porque no se encontro cache
        // implementacion de estrategia cache dinamico
        
        //paso 1: clonamos la peticion 
        let requestToCache = e.request.clone();

        //paso 2: peticion al servidor 
        return fetch(requestToCache) 
              .then(res =>{
              //si no tenemos respuesta 
              if(!res || res.status !== 200 && e.request.destination!='image'){ // su estatus distinto a 200
                //no podemos obtener el recurso 
                // respuesta amigable para el usuario 
                console.log("responder error amigable ", res);
                return res; 
                }

              //si no llega, tenemos una respuesta 
              //paso 3: clonamos la respuesta
              let responseToCache = res.clone();

              //paso 4 : guardamos respuesta en cache
              caches.open(cacheName)
                  .then (cache => {
                    cache.put(requestToCache, responseToCache);
                  })
                  return res;
            })
            
          .catch(error => {
            //console.log("responder error amigable", error);
            //return new Response("la app esta offline y no podemos ir a buscar el recurso al servidor");
              fetch ('http://localhost:8888/pw1/error.html')
                .then(res => {
                    return res;
                }) 
          })
      })
  );
});