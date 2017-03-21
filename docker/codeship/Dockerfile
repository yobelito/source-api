FROM bespoken/nodejs-aws:latest

MAINTAINER chrsdietz

# Install the new entry-point script
COPY secrets-entrypoint.sh /secrets-entrypoint.sh

RUN chmod 755 ./secrets-entrypoint.sh

RUN aws --version

EXPOSE 3000

WORKDIR /opt

RUN git clone https://github.com/bespoken/source-name-generator

WORKDIR /opt/source-name-generator

RUN npm install

RUN node ./node_modules/typings/dist/bin.js install

RUN ./node_modules/typescript/bin/tsc -p .