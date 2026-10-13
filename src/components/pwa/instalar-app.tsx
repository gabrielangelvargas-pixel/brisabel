"use client";

import { Download, Share, SquarePlus } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

// Botón "Instalar app" del menú.
// - Android / Chrome / Edge: el navegador avisa que se puede instalar
//   (beforeinstallprompt) y el botón abre su diálogo de instalación.
// - iPhone / iPad: Safari no tiene ese diálogo; se muestran los pasos.
// - Ya instalada (abierta como app) o sin soporte: no se muestra.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Estado = "oculto" | "disponible" | "ios";

let aviso: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notificar = () => listeners.forEach((listener) => listener());

// Se escucha al cargar el módulo: el aviso puede llegar antes de hidratar.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // sin el cartel automático: se instala desde el menú
    aviso = event as BeforeInstallPromptEvent;
    notificar();
  });
  window.addEventListener("appinstalled", () => {
    aviso = null;
    notificar();
  });
}

function getEstado(): Estado {
  const instalada =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  if (instalada) return "oculto";
  if (aviso) return "disponible";

  const esIos =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return esIos ? "ios" : "oculto";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const botonClass =
  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-base font-medium text-brand transition hover:bg-brand-soft";

export function InstalarApp() {
  const estado = useSyncExternalStore(
    subscribe,
    getEstado,
    () => "oculto" as Estado,
  );
  const [verPasos, setVerPasos] = useState(false);

  if (estado === "oculto") {
    return null;
  }

  if (estado === "disponible") {
    return (
      <div className="border-t border-line p-3">
        <button
          className={botonClass}
          onClick={async () => {
            await aviso?.prompt();
            const { outcome } = (await aviso?.userChoice) ?? {};
            if (outcome === "accepted") {
              aviso = null; // el aviso se usa una sola vez
              notificar();
            }
          }}
          type="button"
        >
          <Download className="size-5" />
          Instalar app
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-line p-3">
      <button
        aria-expanded={verPasos}
        className={botonClass}
        onClick={() => setVerPasos((v) => !v)}
        type="button"
      >
        <Download className="size-5" />
        Instalar app
      </button>
      {verPasos ? (
        <ol className="mx-3 mt-1 grid gap-2 rounded-md bg-brand-soft p-3 text-sm text-ink">
          <li className="flex items-center gap-2">
            <span className="font-semibold">1.</span> Tocá{" "}
            <Share aria-label="Compartir" className="size-4 text-brand" /> en la
            barra de Safari.
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold">2.</span> Elegí{" "}
            <SquarePlus aria-hidden className="size-4 text-brand" />
            <span className="font-semibold">Agregar a inicio</span>.
          </li>
        </ol>
      ) : null}
    </div>
  );
}
