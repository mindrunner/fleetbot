FROM node:18-alpine

ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION

# DL3018: Pin versions in apk add
# hadolint ignore=DL3018
RUN apk add --no-cache bash tzdata openssl

WORKDIR /app

EXPOSE 3003

COPY docker/app/scripts/* /usr/local/bin/
COPY node_modules node_modules
COPY build/app .
