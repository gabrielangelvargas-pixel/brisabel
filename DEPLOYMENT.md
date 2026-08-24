# Deploy en Hostinger

Esta app esta preparada para desplegarse como **Node.js Web App** desde GitHub.

## Configuracion recomendada

- Framework: Next.js
- Node.js: 24.x
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`
- Output directory: dejar vacio si Hostinger detecta Next.js automaticamente
- Branch: `main`

## Variables de entorno

Configura estas variables en Hostinger durante el despliegue:

```env
DATABASE_URL="mysql://u605057087_angel:TU_PASSWORD@HOST_MYSQL:3306/u605057087_brisabel?connection_limit=5"
NEXT_PUBLIC_APP_URL="https://TU_DOMINIO"
```

Notas:

- Para correr la app dentro de Hostinger, el host de MySQL puede ser `localhost` o `127.0.0.1` si Hostinger lo indica para esa base.
- Para migrar desde tu computadora, usa el host remoto de MySQL y habilita Remote MySQL en hPanel.
- No subas `.env` a GitHub. Usa `.env.example` como referencia.

## Migraciones

La migracion inicial ya existe en:

```text
prisma/migrations/20260824233000_init/migration.sql
```

Para aplicar migraciones en la base remota:

```bash
npm run prisma:deploy
```

## Flujo GitHub + Hostinger

1. Crear un repositorio en GitHub.
2. Subir este proyecto a ese repositorio.
3. En Hostinger, elegir **Anadir sitio web** y luego **Desplega app web**.
4. Elegir **Import Git Repository**.
5. Seleccionar el repositorio de Brisabel y la branch `main`.
6. Configurar los comandos y variables de entorno de este documento.
7. Ejecutar el deploy.
