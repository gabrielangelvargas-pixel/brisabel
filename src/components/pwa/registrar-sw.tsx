"use client";

import { useEffect } from "react";

// Registra el service worker (public/sw.js) para que el sitio se pueda
// instalar como app. Solo en producción: en desarrollo interferiría con la
// recarga automática.
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Sin service worker el sitio funciona igual; solo no se puede instalar.
    });
  }, []);

  return null;
}
