// Service worker de Brisabel (app instalable).
// Criterio: la tienda siempre se ve con datos frescos (red primero). Solo se
// guarda una página "Sin conexión" para mostrar si no hay internet al navegar.
// No cachea páginas, el panel ni las acciones: nada puede quedar desactualizado.
// También muestra las notificaciones push (ver src/lib/push.ts).

const VERSION = "brisabel-v2";
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

// ---------------------------------------------------------- Notificaciones

// Llega un aviso del servidor: { titulo, cuerpo, url, etiqueta }.
self.addEventListener("push", (event) => {
  let aviso = {};

  try {
    aviso = event.data ? event.data.json() : {};
  } catch {
    aviso = { cuerpo: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(aviso.titulo || "Brisabel", {
      body: aviso.cuerpo || "",
      icon: "/pwa/icon-192.png",
      badge: "/pwa/icon-192.png",
      tag: aviso.etiqueta,
      data: { url: aviso.url || "/" },
    }),
  );
});

// Al tocar el aviso: si el sitio ya está abierto, lo trae al frente y navega;
// si no, abre una ventana nueva.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      const abierta = ventanas.find((ventana) => new URL(ventana.url).origin === self.location.origin);

      if (abierta) {
        return abierta.focus().then((ventana) => ventana.navigate(url));
      }

      return self.clients.openWindow(url);
    }),
  );
});
