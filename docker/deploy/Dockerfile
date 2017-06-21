FROM bespoken/source-api:latest

MAINTAINER John Kelvie "jpk@bespoken.tools"

ARG version

ARG env

ENV env ${env}

WORKDIR /opt/source-name-generator

EXPOSE 9250 443

COPY src/ ./src/

COPY scripts/ ./scripts/

COPY *.json ./

RUN npm install

RUN npm run build

CMD npm start
