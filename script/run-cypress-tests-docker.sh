if [ "$(find src -name '*.cypress.spec.js' | wc -l)" -eq 0 ]; then
  echo "No Cypress tests found."
  exit 0
else
  export CYPRESS_BASE_URL=http://content-build:3001
  yarn cy:run --env buildtype=vagovprod
fi
