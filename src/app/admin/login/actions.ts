"use server";

import { redirect } from "next/navigation";

import { getPrisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { verifyPassword } from "@/lib/password";

export async function loginAction(formData: FormData) {
  const dni = String(formData.get("dni") ?? "").replace(/\D/g, "");
  const password = String(formData.get("password") ?? "");

  if (!dni || !password) {
    redirect("/admin/login?error=missing");
  }

  const usuario = await getPrisma().usuario.findUnique({
    where: {
      dni,
    },
  });

  if (!usuario || !usuario.activo) {
    redirect("/admin/login?error=invalid");
  }

  const isValidPassword = await verifyPassword(password, usuario.passwordHash);

  if (!isValidPassword) {
    redirect("/admin/login?error=invalid");
  }

  await createSession(usuario.id);
  redirect("/admin");
}
