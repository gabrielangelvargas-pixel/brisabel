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

const email = getArg("email") ?? process.env.ADMIN_EMAIL;
const password = getArg("password") ?? process.env.ADMIN_PASSWORD;
const nombre = getArg("name") ?? process.env.ADMIN_NAME ?? "Administrador";

if (!email || !password) {
  console.error("Uso: npm run admin:create -- --email=admin@brisabel.com --password=TU_PASSWORD --name=Administrador");
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
  `INSERT INTO Usuario (id, nombre, email, passwordHash, rol, activo, createdAt, updatedAt)
   VALUES (UUID(), ?, ?, ?, 'ADMIN', true, NOW(3), NOW(3))
   ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), passwordHash = VALUES(passwordHash), rol = 'ADMIN', activo = true, updatedAt = NOW(3)`,
  [nombre, email, passwordHash],
);

conn.release();
await pool.end();

console.log(`Usuario administrador listo: ${email}`);
