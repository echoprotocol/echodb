FROM node:10.15.3-alpine as builder

LABEL maintainer="Pixelplex inc. <dev@pixelplex.io>"

RUN apk add --update-cache git python make gcc g++ bash

RUN git config --global http.sslverify "false"

RUN npm config set unsafe-perm true

WORKDIR /home/

ENV NODE_CONFIG_DIR "../config"

ADD package*.json ./

RUN npm install
ADD . .
RUN npm run build

WORKDIR /home/dist/

RUN git clone https://github.com/vishnubob/wait-for-it.git

CMD ["node", "server.js"]
