# Brisabel

Aplicacion web creada con Next.js, TypeScript, Tailwind CSS y Prisma.

## Stack inicial

- Next.js con App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL para Hostinger

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate
```

## Variables de entorno

Copia `.env.example` a `.env` y reemplaza `DATABASE_URL` con los datos de MySQL de Hostinger.
Para produccion, `NEXT_PUBLIC_APP_URL` debe apuntar a la URL publica de la app.
`BRISABEL_UPLOADS_DIR` define una carpeta persistente para imagenes subidas desde el panel. Si se omite en local, la app usa una carpeta hermana del proyecto: `../BrisaBel-uploads`.

Formato de Hostinger:

```env
DATABASE_URL="mysql://USUARIO:CONTRASENA@HOST:3306/BASE_DE_DATOS?connection_limit=5"
```

En este proyecto:

```env
DATABASE_URL="mysql://u605057087_angel:TU_PASSWORD@TU_HOST_MYSQL:3306/u605057087_brisabel?connection_limit=5"
NEXT_PUBLIC_APP_URL="https://brisabel.com.ar"
BRISABEL_UPLOADS_DIR="/home/u605057087/domains/brisabel.com.ar/imagenes"
```

Si la app corre dentro de Hostinger, el host puede ser `localhost` o `127.0.0.1`.
Para correr migraciones desde tu computadora, habilita Remote MySQL en Hostinger y usa el hostname remoto que aparece en hPanel.

Las imagenes de categorias se guardan como `.webp` en:

```text
BRISABEL_UPLOADS_DIR/categorias
```

La app las publica desde URLs como:

```text
/media/categorias/electronica.webp
```
