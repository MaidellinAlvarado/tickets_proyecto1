# ---  Compilar el código ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos el proyecto para producción
RUN npm run build

# ---  Servir la aplicación web ---
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Encendemos el servidor Nginx
CMD ["nginx", "-g", "daemon off;"]