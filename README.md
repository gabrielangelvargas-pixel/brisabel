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
| `npm run admin:create` | Crea o actualiza un administrador (pide los datos) |
| `npm run admin:create -- --sql` | Igual, pero imprime el INSERT para phpMyAdmin sin conectarse |
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
    (site)/             Tienda pública: comparte el navbar (SiteHeader).
    (admin)/            Panel de administración (/admin): mismo navbar, páginas solo para admins.
  components/layout/    Navbar, menú lateral y logo.
  components/ui/        Field, Button, FormAlert y otros componentes reutilizables.
  features/<dominio>/   Lógica por dominio: queries, actions, schemas, components.
  components/ui/        Componentes visuales reutilizables.
  lib/                  Utilidades transversales (db, auth, storage).
  config/               Configuración del sitio y variables de entorno validadas.
```

Otros:

- `public/brand/logo.png`: logo optimizado para la web (800 px). El original en alta está en `assets/brand/` (no se publica).
- `public/og.png`: imagen para compartir en redes (1200x630).
- `src/assets/home/`: imágenes fijas de la Home (portada y bloque de regalos), importadas estáticamente para que Next las optimice. La foto original está en `assets/images/`.
- Las categorías de la Home y del catálogo salen de la base (ver *Categorías*).

Las convenciones completas están en [AGENTS.md](AGENTS.md).

## Variables de entorno

| Variable              | Descripción                       |
| --------------------- | --------------------------------- |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app, sin barra final |
| `DATABASE_URL`        | Conexión MySQL: `mysql://USUARIO:PASSWORD@HOST:3306/BASE?connection_limit=5` |
| `BRISABEL_UPLOADS_DIR` | Carpeta persistente de imágenes subidas. En Hostinger: `/home/u605057087/domains/brisabel.com.ar/imagenes`. En local se puede omitir (usa `../BrisaBel-uploads`). |

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

## Autenticación

- Roles en la tabla `Rol`: `ADMIN` (Administrador) y `CLIENTE` (Cliente), creados por la migración `roles`.
- `/ingresar` tiene dos fichas: **Ingresar** (usuario o DNI + contraseña) y **Crear cuenta** (crea un usuario con rol `CLIENTE` y deja la sesión iniciada).
- Al ingresar, el admin va a `/admin` y el cliente al inicio. En el navbar, el ícono de perfil lleva a `/perfil` para todos; el admin ve además un ícono de panel que lleva a `/admin`.
- Sesiones guardadas en la tabla `Sesion` (solo el hash del token); cookie `httpOnly` de 7 días.
- Límites: 5 logins fallidos cada 15 minutos por IP y por usuario; 5 cuentas nuevas cada 15 minutos por IP.
- Crear el primer admin: `npm run db:deploy` (si faltan las tablas) y luego `npm run admin:create`.
  Sin acceso remoto a MySQL: `npm run admin:create -- --sql` y ejecutar el INSERT en phpMyAdmin.
- Si una migración se aplica a mano en phpMyAdmin, hay que registrarla en `_prisma_migrations`; si no, `db:deploy` la intentará aplicar de nuevo.

## Categorías

- Árbol de hasta **3 niveles** (categoría › subcategoría › sub-subcategoría), administrado en `/admin/categorias`.
- `parentId` es la fuente de verdad; `ruta` (`/1/4/9/`) y `nivel` se derivan y los mantiene la app al crear o mover (en una transacción, junto con todo el subárbol).
- "Todo lo que hay debajo de X": `ruta LIKE '<ruta de X>%'` en una sola consulta.
- Slug único global → URLs cortas (`/catalogo/aros-de-plata`).
- No se puede eliminar una categoría con subcategorías. Los productos irán solo en categorías sin hijas (se aplicará al crear la tabla de productos).
- Lógica pura del árbol en `src/features/categorias/tree.ts`.
- Público: `/catalogo` (principales) y `/catalogo/<slug>` (migas de pan, subcategorías y metadatos Open Graph para compartir). Una categoría oculta oculta también su subárbol.
- Las lecturas públicas se cachean con la etiqueta `categorias` (`public-queries.ts`); las acciones del panel la invalidan con `updateTag`, así los cambios se ven al instante. Se leen por request, nunca durante el build.
- Imagen opcional: se recorta a **1200×630 WebP** (medidas en `src/features/categorias/imagen-size.ts`) (tarjetas y vista previa al compartir en redes) y se guarda en `BRISABEL_UPLOADS_DIR/categorias` con nombre único por versión. Se sirve en `/media/categorias/<archivo>` con caché de un año.

## Productos

- Tabla `Producto`: SKU y slug únicos, precio de costo (solo panel) y de venta, categoría, activo, destacado, imagen cuadrada 1000×1000 WebP (`BRISABEL_UPLOADS_DIR/productos`).
- Solo van en categorías **sin subcategorías**: el panel solo ofrece esas, y una categoría con productos no puede recibir subcategorías ni eliminarse.
- Panel en `/admin/productos` (buscar por nombre o SKU, filtrar por categoría). Los precios se escriben como en Argentina: `12.500` o `12.500,50`.
- En la tienda, la página de una categoría sin subcategorías muestra sus productos activos (caché con etiqueta `productos`).

## Hoja de ruta

1. ~~Base del proyecto~~
2. Base de datos (Prisma + MySQL)
3. ~~Autenticación de administradores~~
4. ~~Categorías (panel, imágenes y catálogo público)~~
5. Productos (~~tabla y panel~~, página de detalle pendiente)
6. Carrito y pedidos
7. Deploy en Hostinger
