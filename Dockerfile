FROM node:14.17-alpine
RUN apk add g++ make python
# Install chromium in container instead of letting puppeteer install because there is an issue in docker using puppeteer's chromium
# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker
RUN apk add chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN mkdir -p /home/node/app
RUN chown -R node: /home/node/app

WORKDIR /home/node/app

COPY package.json .
COPY package-lock.json .
RUN npm install --production
COPY .env.sample ./.env

USER node

COPY new-scrapers ./new-scrapers
COPY utils ./utils


