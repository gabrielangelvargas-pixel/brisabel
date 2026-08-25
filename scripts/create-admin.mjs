import "dotenv/config";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import mariadb from "mariadb";

const scrypt = promisify(scryptCallback);

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg?.slice(prefix.length);
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(key).toString("hex")}`;
}

const dni = (getArg("dni") ?? process.env.ADMIN_DNI)?.replace(/\D/g, "");
const email = getArg("email") ?? process.env.ADMIN_EMAIL ?? null;
const password = getArg("password") ?? process.env.ADMIN_PASSWORD;
const nombre = getArg("name") ?? process.env.ADMIN_NAME ?? "Administrador";

if (!dni || !password) {
  console.error("Uso: npm run admin:create -- --dni=12345678 --password=TU_PASSWORD --name=Administrador");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no esta configurada.");
  process.exit(1);
}

const pool = mariadb.createPool(process.env.DATABASE_URL.replace(/^mysql:/, "mariadb:"));
const conn = await pool.getConnection();
const passwordHash = await hashPassword(password);

await conn.query(
  `INSERT INTO Usuario (id, nombre, dni, email, passwordHash, rol, activo, createdAt, updatedAt)
   VALUES (UUID(), ?, ?, ?, ?, 'ADMIN', true, NOW(3), NOW(3))
   ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), email = VALUES(email), passwordHash = VALUES(passwordHash), rol = 'ADMIN', activo = true, updatedAt = NOW(3)`,
  [nombre, dni, email, passwordHash],
);

conn.release();
await pool.end();

console.log(`Usuario administrador listo para DNI: ${dni}`);
