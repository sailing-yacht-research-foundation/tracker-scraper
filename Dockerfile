FROM node:14.17-alpine
RUN apk add g++ make python

USER node
RUN mkdir -p /home/node/app
RUN chown -R node: /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package.json .
COPY --chown=node:node package-lock.json .
RUN npm install --production
COPY tracker-schema ./tracker-schema
COPY .env.sample ./.env
COPY tracker-schema/.env.sample ./tracker-schema/.env

COPY normalization-runner ./normalization-runner
COPY scrapers ./scrapers
COPY utils ./utils


