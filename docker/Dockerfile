FROM node:6.3.0

MAINTAINER jpkbst

EXPOSE 443 9250

WORKDIR /opt

RUN mkdir source-api

WORKDIR /opt/source-api

COPY src/ ./src/

COPY scripts/ ./scripts/

COPY *.json ./

COPY *.sh ./

RUN npm install

RUN node ./node_modules/typings/dist/bin.js install

RUN ./node_modules/typescript/bin/tsc -p .

CMD npm start
