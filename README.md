# MIND-SPHERE

Simulador psicológico futurista premium con roles **Superadmin**, **Maestro** y **Estudiante** (Angular 21).

El asistente guía oficial del simulador es **GARY**.

## Credenciales demo

| Rol | Correo | Contrasena |
|-----|--------|------------|
| Superadmin | `superadmin@demo.edu` | `demo123` |
| Maestro | `maestro@demo.edu` | `demo123` |
| Estudiante | `estudiante@demo.edu` | Tarjeta: `1020304050` |

## Desarrollo local (sin Docker)

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:4200`.

### Panel administrador (Fase 1 — REQ-01 + Figma)

Tras iniciar sesión como Superadmin (`superadmin@demo.edu` / `demo123`):

| Ruta | Sección |
|------|---------|
| `/admin/resumen` | Dashboard plataforma (Figma Neo) |
| `/admin/usuarios` | Gestión de usuarios y flag *creador de casos* (REQ-01) |
| `/admin/licencias` | Control de licencias |
| `/admin/reportes` | Uso institucional |
| `/admin/logs` | System logs |

Documentación: `docs/admin/FASE-1-ESPECIFICACION.md`, requisitos en `docs/notion/export/`, diseño en `docs/figma/admin-dashboard-neo.png`.

## Docker

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose v2).

### Produccion

Construye la imagen y levanta la app con **nginx** (SPA con rutas de Angular) y el API de persistencia:

```bash
docker compose build
docker compose up -d
```

Abre **http://localhost:8080** (puerto configurable con `APP_PORT` en `.env`).

La informacion academica del simulador se guarda en el volumen Docker `psicologo_data`, mediante el servicio `psicologo-api`. El archivo persistente queda dentro del contenedor/volumen como `/data/academy-store.json`, no en `localStorage` del navegador.

Comandos utiles:

```bash
pnpm docker:build    # docker compose build
pnpm docker:up       # docker compose up -d
pnpm docker:down     # docker compose down
pnpm docker:logs     # ver logs
```

### Desarrollo con hot-reload en Docker

```bash
pnpm docker:dev:build
```

Abre **http://localhost:4200**. Los cambios en `src/` se recargan dentro del contenedor.

### Variables de entorno

Copia `.env.example` a `.env` si quieres cambiar puertos:

```bash
cp .env.example .env
```

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `APP_PORT` | `8080` | Puerto host para produccion |
| `DEV_PORT` | `4200` | Puerto host para desarrollo |
| `API_PORT` | `3000` | Puerto host del API de persistencia |
| `GEMINI_API_KEY` | — | Google AI (rúbrica, calificación, asistente) |
| `APP_PUBLIC_URL` | `http://localhost:4200` | Enlace en correos a estudiantes |
| `SMTP_HOST` | `smtp.gmail.com` | Servidor SMTP (Gmail) |
| `SMTP_PORT` | `587` | Puerto TLS |
| `SMTP_SECURE` | `false` | `true` solo si usas puerto 465 |
| `SMTP_USER` | — | Tu cuenta `@gmail.com` |
| `SMTP_PASS` | — | Contraseña de aplicación de Google (16 caracteres) |
| `SMTP_FROM` | — | Remitente visible (ej. `MIND-SPHERE <tu@gmail.com>`) |

### Notificaciones a estudiantes

Cuando el docente **agrega un estudiante a un grupo**, el estudiante recibe una notificación **dentro de MIND-SPHERE**:

1. El estudiante inicia sesión con correo universitario + tarjeta de identidad.
2. En su home pulsa **Notificaciones**.
3. Verá: *«Te agregaron al grupo …»*.

No hace falta configurar Gmail para la bandeja in-app.

### Agendar simulación (REQ-04) y credenciales por correo

En **Docente → Agendar simulación** el profesor:

1. Elige caso, escenarios y preguntas.
2. Registra espacio académico, fechas, tiempo estimado/máximo, ubicación y mensaje.
3. Selecciona estudiantes del grupo o invita nuevos (nombre + correo).
4. Pulsa **Agendar y notificar por correo**.

El sistema valida que el **tiempo máximo ≤ tiempo estimado**, guarda la simulación en estado **Sin iniciar** y envía un correo con la **URL de acceso**, el **correo** y la **tarjeta de identidad** del estudiante.

**Ingreso estudiante (REQ-07):** correo universitario + **tarjeta de identidad** (sin contraseña). Demo: `estudiante@demo.edu` / `1020304050`.

**Docente/admin:** correo + contraseña (demo: `maestro@demo.edu` / `demo123`).

Si el estudiante intenta entrar después del **50% del tiempo** contado desde el **inicio oficial**, el acceso se **bloquea definitivamente**.

#### Correo real (opcional SMTP)

Si además quieres que llegue un email a la bandeja de Gmail, configura SMTP en `.env` con una **contraseña de aplicación** de Google (no es tu contraseña normal; Google la exige para apps externas). Sin eso, solo funciona la bandeja in-app de arriba.

## Build manual

```bash
pnpm build
pnpm preview
```

## Tests

```bash
pnpm test
```

## Estructura Docker

```
Dockerfile           # Multi-stage: deps -> build -> production (nginx) / development / api
docker-compose.yml   # Servicios psicologo, psicologo-api y psicologo-dev (perfil dev)
docker/nginx.conf    # SPA fallback para rutas de Angular y proxy /api
docker/store-api.mjs # API Express que persiste el store academico en /data
```
