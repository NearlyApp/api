FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Use secret for npm install
RUN --mount=type=secret,id=npm_token,target=/root/.npmrc npm install

COPY . .
RUN npm run build

COPY . .
RUN npm run build
RUN rm -f .npmrc

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
