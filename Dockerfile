FROM node:6.3.0

MAINTAINER chrsdietz

EXPOSE 3000

WORKDIR /opt

RUN git clone https://github.com/bespoken/source-name-generator

WORKDIR /opt/source-name-generator

RUN npm install

RUN node ./node_modules/typings/dist/bin.js install

RUN ./node_modules/typescript/bin/tsc -p .

CMD [ "npm", "start" ]
