FROM node:22-alpine

WORKDIR /app

# Agregamos OpenSSL para que Prisma funcione sin advertencias
RUN apk add --no-cache openssl

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos la carpeta de Prisma y generamos el cliente 
COPY prisma ./prisma/
RUN npx prisma generate

# Copiamos todo el resto de tu código fuente 
COPY . .

# Compilamos el TypeScript a JavaScript
RUN npm run build

# Exponemos el puerto 
EXPOSE 3000

# Comando final: Ejecuta las migraciones en la DB y luego enciende la API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/Infrastructure/seed.js && node dist/API/index.js"]