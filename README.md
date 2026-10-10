# Brisabel

Tienda online de Brisabel. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.

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
| `npm run build`     | Build de producción                       |
| `npm run start`     | Sirve el build de producción              |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | Genera tipos de rutas y corre TypeScript  |
| `npm run check`     | Lint + typecheck (correr antes de commit) |

GitHub Actions corre lint, typecheck y build en cada push y pull request (`.github/workflows/ci.yml`).

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

## Hoja de ruta

1. ~~Base del proyecto~~
2. Base de datos (Prisma + MySQL)
3. Autenticación de administradores
4. Categorías (ABM + catálogo público)
5. Productos
6. Carrito y pedidos
7. Deploy en Hostinger
