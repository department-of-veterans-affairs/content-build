#!/usr/bin/env bash
if [ ! -d ../vets-website ]; then
  git clone --filter=tree:0 https://github.com/department-of-veterans-affairs/vets-website.git ../vets-website
else
  echo "Repo vets-website already cloned."
fi

if [ ! -d ../vets-api ]; then
  git clone --filter=tree:0 https://github.com/department-of-veterans-affairs/vets-api.git ../vets-api
else
  echo "Repo vets-api already cloned."
fi
