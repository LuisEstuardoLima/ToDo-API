# ---------- Etapa 1: instalación de dependencias ----------
# Aquí sí necesitamos npm, pero esta etapa nunca llega a la imagen final.
FROM node:20-alpine AS deps

WORKDIR /app

# Copiamos solo los manifiestos primero para aprovechar la cache de capas de Docker
# (nombres explícitos, sin patrones glob, para evitar copiar archivos no deseados)
COPY package.json package-lock.json ./

# Instalamos únicamente dependencias de producción.
# npm ci respeta exactamente las versiones fijadas en package-lock.json (a diferencia
# de npm install, que puede resolver versiones nuevas dentro de los rangos del semver),
# y --ignore-scripts evita que dependencias de terceros ejecuten scripts arbitrarios
# durante la instalación (mitiga ataques de supply chain).
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# ---------- Etapa 2: imagen final de ejecución ----------
FROM node:20-alpine AS runtime

WORKDIR /app

# Aplicamos los parches de seguridad más recientes del sistema operativo base
# (corrige CVEs de OpenSSL ya resueltos en versiones más nuevas de los paquetes Alpine).
RUN apk update && apk upgrade --no-cache

# La app corre con "node src/index.js", nunca con npm, así que no necesitamos
# el CLI de npm (ni sus propias dependencias internas, como node-tar, glob o
# minimatch) dentro de la imagen final. Eliminarlo reduce superficie de ataque
# y quita varios CVEs HIGH/CRITICAL que no pertenecen a nuestro código.
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm /usr/local/bin/npx \
    /opt/yarn-v1.22.22 2>/dev/null || true

# Copiamos solo lo ya instalado en la etapa anterior y el código fuente.
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src

# Puerto en el que escucha la aplicación (documentativo)
EXPOSE 8080

# Buenas prácticas de seguridad: no correr como root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "src/index.js"]
