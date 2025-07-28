# Etapa de construcción
FROM node:18-alpine AS build
WORKDIR /app

# Copiar backend y public
COPY backend ./backend
COPY public ./public

# Instalar dependencias del backend
WORKDIR /app/backend
RUN npm install

# Etapa final
FROM node:18-alpine
WORKDIR /app

# Copiar backend y public desde build
COPY --from=build /app/backend ./backend
COPY --from=build /app/public ./public

WORKDIR /app/backend

EXPOSE 4000
CMD ["node", "index.js"]
