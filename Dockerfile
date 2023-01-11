##### DEPENDENCIES

FROM --platform=linux/amd64 node:16-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install Prisma Client - remove if not using Prisma
COPY prisma ./

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### BUILDER

FROM --platform=linux/amd64 node:16-alpine AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### RUNNER

FROM --platform=linux/amd64 node:16-alpine AS runner
WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG PUSHER_APP_ID
ENV PUSHER_APP_ID=$PUSHER_APP_ID

ARG NEXT_PUBLIC_PUSHER_APP_KEY
ENV NEXT_PUBLIC_PUSHER_APP_KEY=$NEXT_PUBLIC_PUSHER_APP_KEY
ARG PUSHER_APP_SECRET
ENV PUSHER_APP_SECRET=$PUSHER_APP_SECRET
ARG NEXT_PUBLIC_PUSHER_SERVER_TLS
ENV NEXT_PUBLIC_PUSHER_SERVER_TLS=$NEXT_PUBLIC_PUSHER_SERVER_TLS
ARG NEXT_PUBLIC_PUSHER_SERVER_HOST
ENV NEXT_PUBLIC_PUSHER_SERVER_HOST=$NEXT_PUBLIC_PUSHER_SERVER_HOST
ARG NEXT_PUBLIC_PUSHER_SERVER_PORT
ENV NEXT_PUBLIC_PUSHER_SERVER_PORT=$NEXT_PUBLIC_PUSHER_SERVER_PORT
ARG NEXT_PUBLIC_PUSHER_SERVER_CLUSTER
ENV NEXT_PUBLIC_PUSHER_SERVER_CLUSTER=$NEXT_PUBLIC_PUSHER_SERVER_CLUSTER

ARG APP_DOMAIN
ENV APP_DOMAIN=$APP_DOMAIN

COPY --from=deps /app/node_modules ./node_modules
RUN yarn build


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]