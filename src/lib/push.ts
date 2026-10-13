import "server-only";

import webpush from "web-push";

import { getServerEnv } from "@/config/server-env";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

// Notificaciones push (Web Push estándar con claves VAPID). El servidor envía
// el aviso al servicio de push del navegador (Google, Apple, Mozilla) y el
// service worker (public/sw.js) lo muestra.

export type AvisoPush = {
  titulo: string;
  cuerpo: string;
  // Página que se abre al tocar el aviso.
  url: string;
  // Avisos con la misma etiqueta se reemplazan en vez de acumularse.
  etiqueta?: string;
};

// Clave pública para suscribirse desde el navegador; null si no hay claves
// configuradas (el sitio funciona igual, sin ofrecer avisos).
export function getPushPublicKey() {
  return getServerEnv().push?.VAPID_PUBLIC_KEY ?? null;
}

let configurado = false;

function configurar() {
  const push = getServerEnv().push;

  if (!push) {
    return false;
  }

  if (!configurado) {
    try {
      webpush.setVapidDetails(push.VAPID_SUBJECT, push.VAPID_PUBLIC_KEY, push.VAPID_PRIVATE_KEY);
      configurado = true;
    } catch (error) {
      console.error("Push: claves VAPID inválidas", error);
      return false;
    }
  }

  return true;
}

// Envía el aviso a todos los dispositivos suscriptos de los usuarios que
// cumplan el filtro. Nunca lanza error: un aviso fallido no debe romper la
// acción que lo dispara. Las suscripciones vencidas se borran.
export async function enviarPush(usuarios: Prisma.UsuarioWhereInput, aviso: AvisoPush) {
  if (!configurar()) return;

  try {
    const db = getDb();
    const suscripciones = await db.suscripcionPush.findMany({
      where: { usuario: { ...usuarios, activo: true } },
      select: { id: true, endpoint: true, p256dh: true, auth: true },
    });
    const payload = JSON.stringify(aviso);
    const vencidas: number[] = [];

    await Promise.all(
      suscripciones.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
            TTL: 60 * 60 * 24, // si el dispositivo está apagado, se entrega dentro de las 24 h
          });
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          // 404/410: el usuario quitó el permiso o desinstaló; no sirve más.
          if (status === 404 || status === 410) vencidas.push(s.id);
          else console.error("Push: no se pudo enviar", status ?? error);
        }
      }),
    );

    if (vencidas.length > 0) {
      await db.suscripcionPush.deleteMany({ where: { id: { in: vencidas } } });
    }
  } catch (error) {
    console.error("Push: error al enviar avisos", error);
  }
}
