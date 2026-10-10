# Brisabel

Tienda online de Brisabel. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma 7 + MySQL.

## Requisitos

- Node.js 24 (ver `.nvmrc`)

## Primeros pasos

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda en http://localhost:3000.

## Comandos

| Comando             | Qué hace                                  |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                    |
| `npm run build`     | Build de producción (con webpack, ver nota) |
| `npm run start`     | Sirve el build de producción              |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | Genera tipos de rutas y corre TypeScript  |
| `npm run check`     | Lint + typecheck (correr antes de commit) |
| `npm run db:check`  | Verifica la conexión a la base            |
| `npm run db:migration -- nombre` | Genera el SQL de una migración (no toca la base) |
| `npm run db:deploy` | Aplica las migraciones pendientes         |
| `npm run db:studio` | Explorador visual de la base              |

GitHub Actions corre lint, typecheck y build en cada push y pull request (`.github/workflows/ci.yml`).

> **Nota:** el build de producción usa webpack (`next build --webpack`) porque Turbopack falla en el entorno de build de Hostinger. En desarrollo se usa Turbopack.

## Estructura

```text
src/
  app/                  Rutas (páginas, layouts, route handlers). Delgadas.
  features/<dominio>/   Lógica por dominio: queries, actions, schemas, components.
  components/ui/        Componentes visuales reutilizables.
  lib/                  Utilidades transversales (db, auth, storage).
  config/               Configuración del sitio y variables de entorno validadas.
```

Las convenciones completas están en [AGENTS.md](AGENTS.md).

## Variables de entorno

| Variable              | Descripción                       |
| --------------------- | --------------------------------- |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app, sin barra final |
| `DATABASE_URL`        | Conexión MySQL: `mysql://USUARIO:PASSWORD@HOST:3306/BASE?connection_limit=5` |

## Base de datos

- Schema en `prisma/schema.prisma`; el cliente se genera en `src/generated/prisma` (no se versiona, lo crea `npm install`).
- Acceso a datos solo desde el servidor, con `getDb()` de `src/lib/db.ts`.
- Se trabaja contra una única base (`u605057087_brisabel` en Hostinger), sin shadow database.
  Por eso no se usa `prisma migrate dev`. Flujo para cambiar el schema:
  1. Editar `prisma/schema.prisma`.
  2. `npm run db:migration -- descripcion_del_cambio` → genera `prisma/migrations/<fecha>_<nombre>/migration.sql` comparando la base real con el schema.
  3. Revisar el SQL generado.
  4. `npm run db:deploy` → lo aplica a la base.
  5. Commitear schema + migración juntos.
- Nunca editar la base a mano ni modificar migraciones ya aplicadas.
- Para conectarte desde tu PC a Hostinger, habilitá **Remote MySQL** en hPanel para tu IP.

## Hoja de ruta

1. ~~Base del proyecto~~
2. Base de datos (Prisma + MySQL)
3. Autenticación de administradores
4. Categorías (ABM + catálogo público)
5. Productos
6. Carrito y pedidos
7. Deploy en Hostinger
