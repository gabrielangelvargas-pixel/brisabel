"use server";

import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

// Suscripción que entrega el navegador (PushSubscription.toJSON()).
const suscripcionSchema = z.object({
  endpoint: z.url({ protocol: /^https$/ }).max(512),
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
});

// Guarda (o reasigna al usuario actual) la suscripción de este dispositivo.
export async function guardarSuscripcionAction(suscripcion: unknown) {
  const usuario = await requireUser();
  const parsed = suscripcionSchema.safeParse(suscripcion);

  if (!parsed.success) {
    return { ok: false };
  }

  const { endpoint, keys } = parsed.data;

  await getDb().suscripcionPush.upsert({
    where: { endpoint },
    create: { usuarioId: usuario.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { usuarioId: usuario.id, p256dh: keys.p256dh, auth: keys.auth },
  });

  return { ok: true };
}

export async function quitarSuscripcionAction(endpoint: unknown) {
  const usuario = await requireUser();

  if (typeof endpoint !== "string") return;

  await getDb().suscripcionPush.deleteMany({ where: { endpoint, usuarioId: usuario.id } });
}
