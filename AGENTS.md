<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Convenciones de Brisabel

- **Idioma:** UI y dominio en español (modelos, rutas públicas, textos). Código de infraestructura y nombres de funciones genéricas en inglés.
- **Estructura:**
  - `src/app/` solo rutas: páginas, layouts y route handlers delgados. Sin consultas a la base ni lógica de negocio directa.
  - `src/features/<dominio>/` todo lo de un dominio: `queries.ts` (lecturas), `actions.ts` (server actions), `schemas.ts` (zod), `components/`.
  - `src/components/ui/` componentes visuales genéricos y reutilizables (Button, Input, Field...).
  - `src/lib/` utilidades transversales sin dominio (db, auth, storage).
  - `src/config/` configuración y variables de entorno validadas.
- **Estilos:** usar los tokens de `src/app/globals.css` (`bg-canvas`, `text-muted`, `border-line`, `bg-brand`...). No hardcodear colores hex en componentes.
- **Variables de entorno:** leerlas desde `src/config/env.ts` (validadas con zod), nunca `process.env` suelto en el resto del código.
- **Validación:** toda entrada de usuario se valida con zod en el servidor.
- **Seguridad:** cada server action que modifica datos verifica permisos por sí misma, aunque la página ya esté protegida.
- **Base de datos:** una única base MySQL (Hostinger), sin shadow database. No usar `prisma migrate dev` ni `db push`. Cambios de schema: `npm run db:migration -- nombre`, revisar el SQL, `npm run db:deploy` (aplicar solo con confirmación del usuario).
- **Build:** producción compila con `next build --webpack`. Turbopack falla en el entorno de build de Hostinger (no puede lanzar el proceso Node auxiliar que procesa el CSS). En desarrollo se usa Turbopack. No quitar `--webpack` sin probar un deploy en Hostinger.
- **Antes de commitear:** `npm run check` tiene que pasar.
