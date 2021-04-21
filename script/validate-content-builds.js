const { runCommandSync } = require('./utils');

runCommandSync('cd ../vets-website/ && yarn build --pull-drupal --omitdebug');

// move vets-website .cache into content-build
// runCommandSync('cp -r ../vets-website/.cache ./');

// run content-build build
runCommandSync('yarn build --pull-drupal --omitdebug --port 3001');

// Compare the build outputs to see if they match
const exitCode = runCommandSync('yarn build:compare');
process.exit(exitCode);
