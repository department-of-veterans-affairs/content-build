const { runCommandSync } = require('./utils');

// run vets-website build
runCommandSync('cd ../vets-website/ && yarn build --omitdebug --pull-drupal');

// run content-build build
runCommandSync('yarn build --omitdebug --port 3001 --pull-drupal');

// Compare the build outputs to see if they match
const exitCode = runCommandSync('yarn build:compare');
process.exit(exitCode);
