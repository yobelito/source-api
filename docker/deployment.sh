echo "FIP: $1"
echo "Branch/Tag: $2"
echo "Service: $3"
echo "Env: $4"
echo "Email: $5"

docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS
docker build -f docker/deploy/Dockerfile -t bespoken/source-api:$2 .
docker push bespoken/source-api:$2
./hyper config --accesskey $HYPER_KEY --secretkey $HYPER_SECRET
./hyper login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS
./hyper pull bespoken/source-api:$2
./hyper rm -f $3 || true
./hyper run -d -e env=$4 \
    -e SSL_KEY="$SSL_KEY" \
    -e SSL_CERT="$SSL_CERT" \
    -e API_TOKEN=$API_TOKEN \
    -e FIREBASE_EMAIL=$5 \
    -e FIREBASE_KEY=$6 \
    --name $3 \
    --size s4 \
    --restart always \
    -P bespoken/source-api:$2

./hyper fip attach -f $1 $3
