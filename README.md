# Psicologo

Simulador academico de casos con roles **Superadmin**, **Maestro** y **Estudiante** (Angular 21).

## Credenciales demo

| Rol | Correo | Contrasena |
|-----|--------|------------|
| Superadmin | `superadmin@demo.edu` | `demo123` |
| Maestro | `maestro@demo.edu` | `demo123` |
| Estudiante | `estudiante@demo.edu` | `demo123` |

## Desarrollo local (sin Docker)

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:4200`.

## Docker

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose v2).

### Produccion

Construye la imagen y levanta la app con **nginx** (SPA con rutas de Angular):

```bash
docker compose build
docker compose up -d
```

Abre **http://localhost:8080** (puerto configurable con `APP_PORT` en `.env`).

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
Dockerfile           # Multi-stage: deps → build → production (nginx) / development
docker-compose.yml   # Servicios psicologo (prod) y psicologo-dev (perfil dev)
docker/nginx.conf    # SPA fallback para rutas de Angular
```
