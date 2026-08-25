import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getPrisma } from "@/lib/prisma";

const sessionCookieName = "brisabel_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(usuarioId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  const prisma = getPrisma();

  await prisma.sesionUsuario.create({
    data: {
      tokenHash,
      usuarioId,
      expiresAt,
    },
  });

  (await cookies()).set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await getPrisma().sesionUsuario.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUsuario() {
  const token = (await cookies()).get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await getPrisma().sesionUsuario.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      usuario: true,
    },
  });

  if (!session || session.expiresAt <= new Date() || !session.usuario.activo) {
    return null;
  }

  return session.usuario;
}

export async function requireAdmin() {
  const usuario = await getCurrentUsuario();

  if (!usuario || usuario.rol !== "ADMIN") {
    redirect("/admin/login");
  }

  return usuario;
}
