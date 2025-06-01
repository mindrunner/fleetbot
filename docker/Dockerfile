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
COPY .swcrc ./
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

COPY --from=builder /app/dist ./
COPY --from=builder /app/node_modules ./node_modules
COPY docker/bin/* /usr/local/bin/

USER node










#FROM node:23-alpine
#
#ARG APP_VERSION=dev
#ENV APP_VERSION=$APP_VERSION
#
## DL3018: Pin versions in apk add
## hadolint ignore=DL3018
#RUN apk add --no-cache bash tzdata openssl
#
#WORKDIR /app
#
#EXPOSE 3003
#
#COPY docker/scripts/* /usr/local/bin/
#ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/
#RUN chmod +x /usr/local/bin/wait-for-it.sh
#COPY node_modules node_modules
#COPY build/app .
