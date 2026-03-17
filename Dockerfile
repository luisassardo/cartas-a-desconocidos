FROM node:20-alpine

LABEL maintainer="Cartas a Desconocidos"
LABEL description="Intercambio Anónimo de Cartas Escritas a Mano"

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json* ./
RUN npm install --production && npm cache clean --force

# Copy app files
COPY server.js ./
COPY public/ ./public/

# Create directories for runtime data
RUN mkdir -p uploads data

# Non-root user for security
RUN addgroup -S cartas && adduser -S cartas -G cartas
RUN chown -R cartas:cartas /app
USER cartas

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/api/config || exit 1

CMD ["node", "server.js"]
