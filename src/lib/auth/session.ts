import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { ROLES, type RolCodigo } from "@/lib/auth/roles";
import { getDb } from "@/lib/db";

const cookieName = "brisabel_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

export type CurrentUser = {
  id: string;
  nombre: string;
  username: string;
  rol: RolCodigo;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(usuarioId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  const db = getDb();

  // Aprovecha el login para limpiar sesiones vencidas del usuario.
  await db.sesion.deleteMany({
    where: { usuarioId, expiresAt: { lte: new Date() } },
  });
  await db.sesion.create({
    data: { tokenHash: hashToken(token), usuarioId, expiresAt },
  });

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (token) {
    await getDb().sesion.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(cookieName);
}

// Usuario de la sesión actual, o null. Lee cookies: quien la use en un
// componente tiene que estar dentro de <Suspense>.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(cookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await getDb().sesion.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      expiresAt: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          username: true,
          activo: true,
          rol: { select: { codigo: true } },
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date() || !session.usuario.activo) {
    return null;
  }

  const { id, nombre, username, rol } = session.usuario;

  return { id, nombre, username, rol: rol.codigo as RolCodigo };
});

// Para páginas y server actions que requieren sesión: si no hay, al login.
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/ingresar");
  }

  return user;
}

// Para páginas y server actions del panel: sin sesión redirige al login;
// con sesión de otro rol, al inicio.
export async function requireAdmin() {
  const user = await requireUser();

  if (user.rol !== ROLES.ADMIN) {
    redirect("/");
  }

  return user;
}
