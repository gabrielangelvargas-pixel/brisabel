import "server-only";

// Límite de intentos por clave (ej. "login:ip:1.2.3.4"), en memoria del
// proceso. Alcanza para un único servidor (Hostinger); se reinicia si la app
// se reinicia.
const maxAttempts = 5;
const windowMs = 1000 * 60 * 15;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string) {
  const entry = attempts.get(key);

  if (!entry) {
    return false;
  }

  if (entry.resetAt <= Date.now()) {
    attempts.delete(key);
    return false;
  }

  return entry.count >= maxAttempts;
}

export function registerAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}
