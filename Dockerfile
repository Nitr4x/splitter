FROM node:10.16-alpine

RUN apk add -U git python make g++

RUN npm install -g truffle@5.0.8 ganache-cli

WORKDIR /app

CMD tail -f /dev/null
