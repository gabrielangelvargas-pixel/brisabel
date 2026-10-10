// Genera una migración comparando la base configurada en DATABASE_URL con
// prisma/schema.prisma. Reemplaza a `prisma migrate dev`, que necesita una
// shadow database (Hostinger no permite crearla). No modifica la base:
// el SQL queda en prisma/migrations/ para revisarlo y aplicarlo con db:deploy.
//
// Uso: npm run db:migration -- nombre_de_la_migracion
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const name = process.argv[2];

if (!name || !/^[a-z0-9_]+$/.test(name)) {
  console.error("Uso: npm run db:migration -- nombre_en_snake_case");
  process.exit(1);
}

const prismaCli = createRequire(import.meta.url).resolve("prisma/build/index.js");

function prisma(args) {
  return spawnSync(process.execPath, [prismaCli, ...args], { stdio: "inherit" });
}

// La base tiene que estar al día antes de calcular la diferencia; si no,
// la migración nueva repetiría cambios de migraciones pendientes.
const status = prisma(["migrate", "status"]);

if (status.status !== 0) {
  console.error("\nHay migraciones pendientes o un problema de conexión. Corré `npm run db:deploy` primero.");
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const dir = path.join("prisma", "migrations", `${timestamp}_${name}`);
const file = path.join(dir, "migration.sql");

mkdirSync(dir, { recursive: true });

const diff = prisma([
  "migrate",
  "diff",
  "--from-config-datasource",
  "--to-schema",
  "prisma/schema.prisma",
  "--script",
  "--exit-code",
  "--output",
  file,
]);

// --exit-code: 0 = sin cambios, 2 = hay cambios, otro = error.
if (diff.status !== 2) {
  rmSync(dir, { recursive: true, force: true });
  console.error(diff.status === 0 ? "\nNo hay cambios en el schema." : "\nNo se pudo generar la migración.");
  process.exit(diff.status === 0 ? 0 : 1);
}

console.log(`\nMigración creada: ${file}\n`);
console.log(readFileSync(file, "utf8"));
console.log("Revisá el SQL y aplicalo con: npm run db:deploy");
