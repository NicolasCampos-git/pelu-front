# Thomas del Arco - Turnos

App de gestión de turnos y clientes para peluquería. Construida con React 19 + Vite 7.

## Stack

- **React 19** con SWC para Fast Refresh
- **Vite 7** como bundler
- **Tailwind CSS 4** para estilos
- **FullCalendar** para el calendario de turnos
- **React Router DOM** para navegación
- **React Hook Form + Zod** para formularios y validación
- **Axios** para llamadas a la API
- **vite-plugin-pwa** para Progressive Web App

## Scripts

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run start     # Servidor estático de producción (usa PORT)
npm run lint      # Linter
```

## Deploy en Railway

El proyecto ya incluye configuracion para deploy automatico en Railway con [railway.json](railway.json):

- `build`: Railpack
- `buildCommand`: `npm install --include=optional && npm run build`
- `startCommand`: `npm run start`
- Healthcheck en `/`

Ademas se define [railpack.json](railpack.json) para fijar Node `22.12.0` y el start command de la imagen final.

### Requisito de Node

Vite 7 requiere Node `20.19+` o `22.12+`. Este proyecto estandariza Node `22.12.0`.
La version se fija en `engines` de [package.json](package.json) y en [railpack.json](railpack.json).

### Variables de entorno en Railway

- `VITE_URL_BACK`: URL publica del backend (por ejemplo `https://tu-backend.up.railway.app`)

Importante: las variables `VITE_*` se inyectan durante el build. Si cambias `VITE_URL_BACK`, hace falta redeploy.

## PWA

La app es instalable como Progressive Web App. La configuración se encuentra en `vite.config.js` usando `vite-plugin-pwa`.

**Características:**
- Instalable en dispositivos (Android, iOS, desktop)
- App shell cacheado para carga rápida
- Página offline (`public/offline.html`) cuando no hay conexión
- Auto-update del service worker (sin intervención del usuario)
- Cache de Google Fonts

**Iconos PWA:** se encuentran en `public/` y fueron generados a partir del logo en `assets/logos-thomi/`. Para regenerarlos:

```bash
convert "assets/logos-thomi/IDENTIDAD_Thomas del Arco_8 copia.png" -resize 192x192 public/pwa-192x192.png
convert "assets/logos-thomi/IDENTIDAD_Thomas del Arco_8 copia.png" -resize 512x512 public/pwa-512x512.png
```

**Verificar PWA:** después de `npm run build && npm run preview`, abrir Chrome DevTools > Application para comprobar el manifest y el service worker.
