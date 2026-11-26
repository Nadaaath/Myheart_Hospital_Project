FROM node:22-trixie-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5006
CMD ["npm", "start"]