#!/bin/bash

# configure NVM
printf "\n\n#####" Configuring Node, NPM, and Yarn #####\n""
source $NVM_DIR/nvm.sh
nvm install || true # ignore exit code due to npm prefix
nvm use --delete-prefix

# check versions
printf "Node version: "
node --version

printf "Yarn version: "
yarn --version

# download content repo
printf "\n\n##### Downloading content repo #####\n"
yarn install-repos

yarn install --production=false

cd ../vets-website && yarn install --production=false && yarn build
