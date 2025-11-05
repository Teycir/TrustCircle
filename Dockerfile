FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
ENV NEXT_PUBLIC_PINATA_JWT=placeholder-jwt
ENV NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
ENV NEXT_PUBLIC_PINATA_VAULT_JWT=placeholder-vault-jwt

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.cjs ./next.config.cjs

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
