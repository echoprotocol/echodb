FROM node:10.15.3-alpine as builder

LABEL maintainer="Pixelplex inc. <dev@pixelplex.io>"

RUN apk add --update-cache git python make gcc g++ bash
RUN git config --global http.sslverify "false"
WORKDIR /home/
COPY . /home

RUN npm config set unsafe-perm true
RUN npm install
RUN npm run build

ENV NODE_CONFIG_DIR "../config"
WORKDIR /home/dist/

RUN git clone https://github.com/vishnubob/wait-for-it.git

CMD ["node", "server.js"]
