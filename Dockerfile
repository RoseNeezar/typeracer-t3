# Install dependencies only when needed
FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


# Rebuild the source code only when needed
FROM node:alpine AS builder
WORKDIR /app
COPY . .

RUN npx prisma generate
COPY prisma ./prisma/

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

# Production image, copy all the files and run next
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 4040

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]