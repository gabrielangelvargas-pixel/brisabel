// Service worker de Brisabel (app instalable).
// Criterio: la tienda siempre se ve con datos frescos (red primero). Solo se
// guarda una página "Sin conexión" para mostrar si no hay internet al navegar.
// No cachea páginas, el panel ni las acciones: nada puede quedar desactualizado.

const VERSION = "brisabel-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/pwa/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // Borra cachés de versiones anteriores.
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo navegaciones (abrir una página). Todo lo demás va directo a la red.
  if (request.mode !== "navigate") {
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(OFFLINE_URL).then((respuesta) => respuesta ?? Response.error())),
  );
});
