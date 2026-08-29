# Imagen base ligera y con parches de seguridad recientes (Alpine, Node 20 LTS)
FROM node:20-alpine AS base

# Directorio de trabajo dentro del contenedor
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

# Copiamos el resto del código fuente
COPY src ./src

# Puerto en el que escucha la aplicación (documentativo)
EXPOSE 8080

# Buenas prácticas de seguridad: no correr como root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "src/index.js"]
