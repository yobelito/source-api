FROM node:6.3.0

# Install the AWS CLI
RUN apt-get update &&
    apt-get -y install unzip && cd /tmp &&
    apt-get -y install python-dev &&
    apt-get -y install python3-dev &&
    curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip"
    -o "awscli-bundle.zip" &&
    unzip awscli-bundle.zip &&
    ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws &&
    rm awscli-bundle.zip && rm -rf awscli-bundle