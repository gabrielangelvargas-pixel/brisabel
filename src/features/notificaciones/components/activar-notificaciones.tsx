"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

import { guardarSuscripcionAction, quitarSuscripcionAction } from "@/features/notificaciones/actions";
import { cn } from "@/lib/cn";

type Estado = "cargando" | "no-soportado" | "instalar-ios" | "bloqueado" | "inactivo" | "activo";

// La clave VAPID pública viene en base64url; PushManager la pide en bytes.
function claveEnBytes(base64url: string) {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function estadoActual(): Promise<Estado> {
  const esIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalada = window.matchMedia("(display-mode: standalone)").matches;

  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    // En iPhone los avisos solo existen con la app instalada (iOS 16.4+).
    return esIos && !instalada ? "instalar-ios" : "no-soportado";
  }

  if (Notification.permission === "denied") return "bloqueado";

  const registro = await navigator.serviceWorker.getRegistration();
  const suscripcion = await registro?.pushManager.getSubscription();

  return suscripcion && Notification.permission === "granted" ? "activo" : "inactivo";
}

type ActivarNotificacionesProps = {
  publicKey: string;
  // Texto del botón para activar (ej. "Avisame cuando avance mi pedido").
  textoActivar?: string;
  className?: string;
};

// Botón para activar o desactivar los avisos en este dispositivo.
export function ActivarNotificaciones({ publicKey, textoActivar = "Activar avisos", className }: ActivarNotificacionesProps) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    estadoActual().then(setEstado, () => setEstado("no-soportado"));
  }, []);

  async function activar() {
    setOcupado(true);

    try {
      const permiso = await Notification.requestPermission();

      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "bloqueado" : "inactivo");
        return;
      }

      const registro = await navigator.serviceWorker.ready;
      const suscripcion =
        (await registro.pushManager.getSubscription()) ??
        (await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: claveEnBytes(publicKey) }));
      const { ok } = await guardarSuscripcionAction(suscripcion.toJSON());

      setEstado(ok ? "activo" : "inactivo");
    } catch (error) {
      console.error("No se pudieron activar los avisos", error);
      setEstado("inactivo");
    } finally {
      setOcupado(false);
    }
  }

  async function desactivar() {
    setOcupado(true);

    try {
      const registro = await navigator.serviceWorker.getRegistration();
      const suscripcion = await registro?.pushManager.getSubscription();

      if (suscripcion) {
        await quitarSuscripcionAction(suscripcion.endpoint);
        await suscripcion.unsubscribe();
      }

      setEstado("inactivo");
    } finally {
      setOcupado(false);
    }
  }

  if (estado === "cargando" || estado === "no-soportado") {
    return null;
  }

  if (estado === "instalar-ios") {
    return (
      <p className={cn("text-sm text-muted", className)}>
        Para recibir avisos en iPhone, instalá la app: tocá Compartir y luego “Agregar a inicio”.
      </p>
    );
  }

  if (estado === "bloqueado") {
    return (
      <p className={cn("flex items-start gap-2 text-sm text-muted", className)}>
        <BellOff className="mt-0.5 size-4 shrink-0" />
        Los avisos están bloqueados en este navegador. Podés habilitarlos desde la configuración del sitio (ícono a la
        izquierda de la dirección).
      </p>
    );
  }

  if (estado === "activo") {
    return (
      <div className={cn("flex flex-wrap items-center gap-3 text-sm", className)}>
        <span className="inline-flex items-center gap-2 font-semibold text-brand">
          <BellRing className="size-4" />
          Avisos activados en este dispositivo
        </span>
        <button
          className="font-semibold text-muted underline-offset-4 hover:text-accent hover:underline disabled:opacity-60"
          disabled={ocupado}
          onClick={desactivar}
          type="button"
        >
          Desactivar
        </button>
      </div>
    );
  }

  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-orange px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-strong disabled:opacity-60",
        className,
      )}
      disabled={ocupado}
      onClick={activar}
      type="button"
    >
      <Bell className="size-4" />
      {ocupado ? "Activando..." : textoActivar}
    </button>
  );
}
