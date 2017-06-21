FROM bespoken/nodejs-aws:latest

MAINTAINER jpkbst

# Install the new entry-point script
COPY secrets-entrypoint.sh /secrets-entrypoint.sh

RUN chmod 755 ./secrets-entrypoint.sh

RUN aws --version

EXPOSE 3000

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

ENTRYPOINT ["/secrets-entrypoint.sh"]
