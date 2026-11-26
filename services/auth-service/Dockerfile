FROM node:22-trixie-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/placeholder" npx prisma generate

EXPOSE 5001

CMD ["npm", "start"]