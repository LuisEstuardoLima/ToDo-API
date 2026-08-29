# Imagen base ligera y con parches de seguridad recientes (Alpine, Node 20 LTS)
FROM node:20-alpine AS base

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los manifiestos primero para aprovechar la cache de capas de Docker
COPY package.json package-lock.json* ./

# Instalamos únicamente dependencias de producción
RUN npm install --omit=dev --no-audit --no-fund

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
