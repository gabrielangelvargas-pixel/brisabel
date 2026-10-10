import "server-only";

// Límite de intentos de login fallidos, en memoria del proceso. Alcanza para
// un único servidor (Hostinger); se reinicia si la app se reinicia.
const maxFailures = 5;
const windowMs = 1000 * 60 * 15;

const failures = new Map<string, { count: number; resetAt: number }>();

export function isLoginBlocked(key: string) {
  const entry = failures.get(key);

  if (!entry) {
    return false;
  }

  if (entry.resetAt <= Date.now()) {
    failures.delete(key);
    return false;
  }

  return entry.count >= maxFailures;
}

export function registerLoginFailure(key: string) {
  const now = Date.now();
  const entry = failures.get(key);

  if (!entry || entry.resetAt <= now) {
    failures.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;
}

export function clearLoginFailures(key: string) {
  failures.delete(key);
}
