FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 80

CMD ["node", "server.mjs"]

