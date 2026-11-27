# =============================================================
# TaskFlow API · Dockerfile multi-stage (Clase 2 · se usa igual en la Clase 3)
# Uso:  docker build -t taskflow-api:1.0.0 .
# =============================================================

# ---------- Etapa 1: dependencias de producción ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Primero solo los manifiestos: esta capa se reutiliza (caché)
# mientras package.json / package-lock.json no cambien.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Etapa 2: imagen final ----------
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

# node_modules ya instalado en la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Código de la API (respeta .dockerignore: sin node_modules ni .env)
COPY --chown=node:node . .

# La imagen oficial de Node trae el usuario "node": no corremos como root
USER node

# Clase 7: el commit desplegado. El CD lo pasa con --build-arg APP_VERSION=<sha>
# y la API lo devuelve en GET /health (así el smoke test sabe qué versión está en línea).
ARG APP_VERSION=local
ENV APP_VERSION=$APP_VERSION

EXPOSE 3000

# Clase 7: health check de la imagen (docker ps → "healthy"). Usa /health (liveness):
# si Mongo cae, reiniciar la API no lo arregla. wget viene en node:22-alpine (BusyBox).
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-3000}/health" > /dev/null || exit 1

# Forma exec (JSON): node es el PID 1 y recibe SIGTERM directamente → apagado graceful
CMD ["node", "src/server.js"]
