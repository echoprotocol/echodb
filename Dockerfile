FROM node:12.18.4-alpine3.9 as builder

LABEL maintainer="Pixelplex inc. <dev@pixelplex.io>"

RUN apk add --update-cache git python make gcc g++ bash

RUN git config --global http.sslverify "false"

RUN npm config set unsafe-perm true

WORKDIR /home/

ENV NODE_CONFIG_DIR "../config"
ENV NODE_ENV "production"

ADD package*.json ./

RUN NODE_ENV=development npm install
ADD . .
RUN npm run build

WORKDIR /home/dist/

RUN git clone https://github.com/vishnubob/wait-for-it.git

CMD ["node", "server.js"]
