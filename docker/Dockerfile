FROM node:22-alpine

ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION

# DL3018: Pin versions in apk add
# hadolint ignore=DL3018
RUN apk add --no-cache bash tzdata openssl

WORKDIR /app

EXPOSE 3003

COPY docker/scripts/* /usr/local/bin/
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-it.sh
COPY node_modules node_modules
COPY build/app .
