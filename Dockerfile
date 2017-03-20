FROM node-with-aws

MAINTAINER chrsdietz

# Install the new entry-point script
COPY secrets-entrypoint.sh /secrets-entrypoint.sh

RUN chmod 755 ./secrets-entrypoint.sh

RUN aws --version

# Overwrite the entry-point script
# ENTRYPOINT ["/secrets-entrypoint.sh"]

EXPOSE 3000

WORKDIR /opt

RUN git clone https://github.com/bespoken/source-name-generator

WORKDIR /opt/source-name-generator

# --------- Temporary ---------------
# Temporary measure until the download script is put in place.  You must put in your own firebase credentials to access.
COPY ./creds/<FIREBASE_CREDS>.json /opt/source-name-generator/<FIREBASE_CREDS>.json

COPY ./json2env.py /opt/source-name-generator/json2env.py

RUN chmod 755 ./json2env.py

RUN python json2env.py < /opt/source-name-generator/creds/<FIREBASE_CREDS>.json

RUN eval "$(python json2env.py < /opt/source-name-generator/creds/<FIREBASE_CREDS>.json"

RUN echo private_key_id = $private_key_id

RUN echo client_email = $client_email

RUN rm json2env.py && rm -rf /opt/source-name-generator/creds/

# --------- End Temporary -------------

RUN npm install

RUN node ./node_modules/typings/dist/bin.js install

RUN ./node_modules/typescript/bin/tsc -p .

CMD [ "npm", "start" ]
