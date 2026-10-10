"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { loginSchema, parseIdentifier } from "@/features/auth/schemas";
import { getDb } from "@/lib/db";
import { getDummyPasswordHash, verifyPassword } from "@/lib/auth/password";
import { ROLES } from "@/lib/auth/roles";
import {
  clearLoginFailures,
  isLoginBlocked,
  registerLoginFailure,
} from "@/lib/auth/rate-limit";
import { createSession, destroySession } from "@/lib/auth/session";

export type LoginState = {
  error?: string;
  identificador?: string;
};

const invalidCredentials = "Usuario, DNI o contraseña incorrectos.";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identificador: formData.get("identificador"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Completá usuario o DNI y contraseña." };
  }

  const { identificador, password } = parsed.data;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limitKeys = [`ip:${ip}`, `id:${identificador.toLowerCase()}`];

  if (limitKeys.some(isLoginBlocked)) {
    return {
      error: "Demasiados intentos fallidos. Probá de nuevo en 15 minutos.",
      identificador,
    };
  }

  let usuario;

  try {
    usuario = await getDb().usuario.findUnique({
      where: parseIdentifier(identificador),
      select: {
        id: true,
        passwordHash: true,
        activo: true,
        rol: { select: { codigo: true } },
      },
    });
  } catch (error) {
    console.error("Login: no se pudo consultar la base", error);
    return { error: "No pudimos conectar con el servidor. Probá de nuevo en unos minutos.", identificador };
  }

  // Siempre se verifica un hash, exista o no el usuario, para no revelar
  // por el tiempo de respuesta qué usuarios existen.
  const isValid = await verifyPassword(
    password,
    usuario?.passwordHash ?? (await getDummyPasswordHash()),
  );

  // Por ahora solo ingresan administradores; las cuentas de cliente vendrán después.
  if (!usuario || !usuario.activo || usuario.rol.codigo !== ROLES.ADMIN || !isValid) {
    limitKeys.forEach(registerLoginFailure);
    return { error: invalidCredentials, identificador };
  }

  limitKeys.forEach(clearLoginFailures);
  await createSession(usuario.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
