FROM bespoken/source-api:latest

MAINTAINER John Kelvie "jpk@bespoken.tools"

ARG version

ARG env

ENV env ${env}

WORKDIR /opt/source-api

EXPOSE 9250 443

RUN git pull

RUN git checkout ${version}

RUN npm install

RUN npm run build

CMD npm start
