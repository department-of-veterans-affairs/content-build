#!/bin/bash

# Build vets-website
set -e
cd ../vets-website && yarn install --production=false --prefer-offline && yarn build -- --buildtype=localhost --api=https://staging-api.va.gov --host="${CODESPACE_NAME}-3002.githubpreview.dev/" --port=3002

# Build content-build
cd ../content-build && yarn install --production=false --prefer-offline && yarn fetch-drupal-cache && yarn build -- --buildtype=localhost --api=https://staging-api.va.gov --host="${CODESPACE_NAME}-3002.githubpreview.dev/" --port=3002 --apps-directory-name=vets-website
