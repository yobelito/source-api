#!/bin/bash

# Check that the environment variable has been set correctly
if [ -z "$SECRETS_BUCKET_NAME" ]; then
  echo >&2 'error: missing SECRETS_BUCKET_NAME environment variable'
  exit 1
fi

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  echo >&2 'error: missing AWS_ACCESS_KEY_ID environment variable'
  exit 1
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo >&2 'error: missing AWS_SECRET_ACCESS_KEY environment variable'
  exit 1
fi

if [ -z "$API_TOKEN" ]; then
  echo >&2 'error: missing API_TOKEN environment variable'
  exit 1
fi

# # Load the S3 secrets file contents into the environment variables
eval $(aws s3 cp s3://${SECRETS_BUCKET_NAME}/bespoken-tools-firebase-adminsdk-vwdeq-1b1098346f.json - | python json2env.py)

npm start