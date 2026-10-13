"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { loginSchema, parseIdentifier, registroSchema } from "@/features/auth/schemas";
import { Prisma } from "@/generated/prisma/client";
import { getDummyPasswordHash, hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearAttempts, isRateLimited, registerAttempt } from "@/lib/auth/rate-limit";
import { ROLES } from "@/lib/auth/roles";
import { createSession, destroySession } from "@/lib/auth/session";
import { volverSeguro } from "@/lib/auth/volver";
import { getDb } from "@/lib/db";

const connectionError = "No pudimos conectar con el servidor. Probá de nuevo en unos minutos.";
const tooManyAttempts = "Demasiados intentos. Probá de nuevo en 15 minutos.";

async function getClientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

function homeFor(rol: string) {
  return rol === ROLES.ADMIN ? "/admin" : "/";
}

// ---------------------------------------------------------------- Ingresar

export type LoginState = {
  error?: string;
  identificador?: string;
};

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identificador: formData.get("identificador"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Completá usuario o DNI y contraseña." };
  }

  const { identificador, password } = parsed.data;
  const limitKeys = [`login:ip:${await getClientIp()}`, `login:id:${identificador.toLowerCase()}`];

  if (limitKeys.some(isRateLimited)) {
    return { error: tooManyAttempts, identificador };
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
    return { error: connectionError, identificador };
  }

  // Siempre se verifica un hash, exista o no el usuario, para no revelar
  // por el tiempo de respuesta qué usuarios existen.
  const isValid = await verifyPassword(
    password,
    usuario?.passwordHash ?? (await getDummyPasswordHash()),
  );

  if (!usuario || !usuario.activo || !isValid) {
    limitKeys.forEach(registerAttempt);
    return { error: "Usuario, DNI o contraseña incorrectos.", identificador };
  }

  limitKeys.forEach(clearAttempts);
  await createSession(usuario.id);
  redirect(volverSeguro(formData.get("volver")) ?? homeFor(usuario.rol.codigo));
}

// ------------------------------------------------------------ Crear cuenta

type RegistroField = "nombre" | "username" | "dni" | "password" | "confirmacion";

export type RegistroState = {
  error?: string;
  fieldErrors?: Partial<Record<RegistroField, string>>;
  values?: Partial<Record<"nombre" | "username" | "dni", string>>;
};

export async function registroAction(
  _prevState: RegistroState,
  formData: FormData,
): Promise<RegistroState> {
  const input = {
    nombre: String(formData.get("nombre") ?? ""),
    username: String(formData.get("username") ?? ""),
    dni: String(formData.get("dni") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmacion: String(formData.get("confirmacion") ?? ""),
  };
  const values = { nombre: input.nombre, username: input.username, dni: input.dni };
  const parsed = registroSchema.safeParse(input);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      values,
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]),
      ),
    };
  }

  // Limita cuentas nuevas por IP (cuenta cada intento válido, no solo fallos).
  const limitKey = `registro:ip:${await getClientIp()}`;

  if (isRateLimited(limitKey)) {
    return { error: tooManyAttempts, values };
  }

  registerAttempt(limitKey);

  const { nombre, username, dni, password } = parsed.data;
  let usuarioId: string;

  try {
    const usuario = await getDb().usuario.create({
      data: {
        nombre,
        username,
        dni: dni ?? null,
        passwordHash: await hashPassword(password),
        rol: { connect: { codigo: ROLES.CLIENTE } },
      },
      select: { id: true },
    });
    usuarioId = usuario.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Con driver adapters el campo puede venir en meta.target o anidado
      // (índice Usuario_dni_key): se busca en todo el detalle.
      const target = JSON.stringify(error.meta ?? {});
      return {
        values,
        fieldErrors: target.includes("dni")
          ? { dni: "Ya existe una cuenta con ese DNI." }
          : { username: "Ese nombre de usuario ya está en uso." },
      };
    }

    console.error("Registro: no se pudo crear el usuario", error);
    return { error: connectionError, values };
  }

  await createSession(usuarioId);
  redirect(volverSeguro(formData.get("volver")) ?? "/");
}

// ------------------------------------------------------------------- Salir

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
