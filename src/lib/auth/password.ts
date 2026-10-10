import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Sin "server-only": lo usa también el script de creación de admins.

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;

const keyLength = 64;
const prefix = "scrypt";

// Formato: scrypt:<salt hex>:<hash hex>
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, keyLength);

  return `${prefix}:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, key] = storedHash.split(":");

  if (scheme !== prefix || !salt || !key) {
    return false;
  }

  const expected = Buffer.from(key, "hex");
  const actual = await scryptAsync(password, salt, keyLength);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

let dummyHash: Promise<string> | undefined;

// Hash válido de una contraseña aleatoria: se verifica contra él cuando el
// usuario no existe, para que la respuesta tarde lo mismo en ambos casos.
export function getDummyPasswordHash() {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));

  return dummyHash;
}
