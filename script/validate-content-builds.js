const { runCommandSync } = require('./utils');

// Run the vets-website content build
runCommandSync('npm run build:content --pull-drupal');

// Copy the drupal cache from content-build into the vets-website repo
runCommandSync('cp -r .cache ../vets-website/.cache');

// Run the standalone content build using the same cache
runCommandSync('cd ../vets-website && npm run build:content');

// Compare the build outputs to see if they match
const exitCode = runCommandSync('npm run build:compare');
process.exit(exitCode);
