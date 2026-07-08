FROM node:20-alpine

LABEL maintainer="Cartas a Desconocidos"
LABEL description="Intercambio Anónimo de Cartas Escritas a Mano"

# su-exec: para dejar privilegios de root tras ajustar permisos del volumen
RUN apk add --no-cache su-exec

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json* ./
RUN npm install --production && npm cache clean --force

# Copy app files
COPY server.js ./
COPY public/ ./public/
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create directories for runtime data
RUN mkdir -p uploads data

# Non-root user for security (el proceso node corre como 'cartas' vía entrypoint)
RUN addgroup -S cartas && adduser -S cartas -G cartas
RUN chown -R cartas:cartas /app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/api/config || exit 1

# El contenedor arranca como root para que el entrypoint pueda hacer chown
# del volumen montado (root en Railway) y luego baja a 'cartas' con su-exec.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
