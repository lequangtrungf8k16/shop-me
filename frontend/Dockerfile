FROM node:20-alpine AS base
WORKDIR /app

# ── STAGE 1: DEPENDENCIES
FROM base AS deps

RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci

# ── STAGE 2: BUILDER 
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── STAGE 3: RUNNER
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]