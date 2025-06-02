# syntax=docker/dockerfile:1.4
FROM node:23-alpine AS base

RUN apk add --no-cache \
    bash tzdata openssl procps curl

FROM base AS builder

RUN apk add --no-cache --virtual .build-deps \
    build-base

WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY tsup.config.ts ./
COPY tsconfig.json ./
COPY src ./src

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile \
 && pnpm run build \
 && npm_config_ignore_scripts=true pnpm prune --prod \
 && pnpm store prune

FROM base AS runtime
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION

WORKDIR /app

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist/airdrop/index.js /app/airdrop.js
COPY --from=builder /app/dist/fleetbot/index.js /app/fleetbot.js
COPY --from=builder /app/dist/basedbot/index.js /app/basedbot.js
COPY --from=builder /app/dist/migrate/index.js /app/migrate.js
COPY src/db/db-data-source.ts /app/db/db-data-source.ts
COPY src/db/migrations /app/db/migrations
COPY docker/bin/* /usr/local/bin/

USER node
