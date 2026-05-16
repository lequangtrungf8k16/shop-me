FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl mariadb-connector-c

# ── STAGE 1: BUILDER 
FROM base AS builder
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm ci
COPY . .

RUN npm run build

# ── STAGE 2: RUNNER 
FROM base AS runner
ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
