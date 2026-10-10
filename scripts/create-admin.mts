// Crea un administrador, o actualiza nombre/DNI/contraseña si el usuario ya existe.
// Uso: npm run admin:create (pregunta los datos; la contraseña no se muestra).
//      npm run admin:create -- --sql  → no se conecta: imprime el INSERT para
//      ejecutarlo en phpMyAdmin, con la contraseña ya hasheada.
import { randomBytes } from "node:crypto";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";

import nextEnv from "@next/env";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { dniSchema, passwordSchema, usernameSchema } from "../src/features/auth/schemas";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { toPoolConfig } from "../src/lib/db-config";
import { ROLES } from "../src/lib/auth/roles";

nextEnv.loadEnvConfig(process.cwd());

const rl = createInterface({ input: stdin, output: stdout, terminal: Boolean(stdin.isTTY) });
const lines = rl[Symbol.asyncIterator]();

// Eco de la terminal; se silencia mientras se escribe una contraseña.
const echo = rl as unknown as { _writeToOutput: (text: string) => void };
const writeEcho = echo._writeToOutput.bind(rl);

async function ask(question: string, { hidden = false } = {}) {
  stdout.write(question);

  if (hidden) echo._writeToOutput = () => {};
  const { value = "" } = await lines.next();
  if (hidden) {
    echo._writeToOutput = writeEcho;
    stdout.write("\n");
  }

  return hidden ? value : value.trim();
}

function fail(message: string): never {
  console.error(`\n${message}`);
  process.exit(1);
}

const sqlOnly = process.argv.includes("--sql");
const databaseUrl = process.env.DATABASE_URL;

if (!sqlOnly && !databaseUrl) {
  fail("DATABASE_URL no está configurada en .env");
}

const nombre = await ask("Nombre para mostrar: ");
const username = usernameSchema.safeParse(await ask("Nombre de usuario: "));
const dniInput = await ask("DNI (opcional, Enter para omitir): ");
const dni = dniInput ? dniSchema.safeParse(dniInput) : null;
const password = passwordSchema.safeParse(await ask("Contraseña: ", { hidden: true }));
const confirmation = await ask("Repetir contraseña: ", { hidden: true });

rl.close();

if (nombre.length < 2) fail("El nombre es obligatorio.");
if (!username.success) fail(`Usuario inválido: ${username.error.issues[0]?.message}`);
if (dni && !dni.success) fail("DNI inválido.");
if (!password.success) fail(`Contraseña inválida: ${password.error.issues[0]?.message}`);
if (password.data !== confirmation) fail("Las contraseñas no coinciden.");

const passwordHash = await hashPassword(password.data);

if (sqlOnly) {
  printInsertSql();
  process.exit(0);
}

const db = new PrismaClient({
  adapter: new PrismaMariaDb(toPoolConfig(databaseUrl!)),
});

try {
  const data = {
    nombre,
    dni: dni?.data ?? null,
    passwordHash,
    activo: true,
    rol: { connect: { codigo: ROLES.ADMIN } },
  };

  await db.usuario.upsert({
    where: { username: username.data },
    create: { username: username.data, ...data },
    update: data,
  });

  console.log(`\nAdministrador "${username.data}" listo.`);
} catch (error) {
  fail(`No se pudo guardar: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  await db.$disconnect();
}

function printInsertSql() {
  const quote = (value: string | null) =>
    value === null ? "NULL" : `'${value.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
  const id = `c${randomBytes(12).toString("hex")}`;
  const values = [
    quote(id),
    quote(nombre),
    quote(username.data!),
    quote(dni?.data ?? null),
    quote(passwordHash),
  ].join(", ");

  console.log(`
-- Ejecutar en phpMyAdmin sobre la base de la app:
INSERT INTO \`Usuario\` (\`id\`, \`nombre\`, \`username\`, \`dni\`, \`passwordHash\`, \`activo\`, \`rolId\`, \`createdAt\`, \`updatedAt\`)
SELECT ${values}, true, \`id\`, NOW(3), NOW(3)
FROM \`Rol\` WHERE \`codigo\` = '${ROLES.ADMIN}';
`);
}
