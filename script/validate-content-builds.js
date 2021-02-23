const { runCommandSync } = require('./utils');

const useVetsWebsite = true;

if (useVetsWebsite) {
  runCommandSync('cd ../vets-website && yarn build'); // run vets-website build
  runCommandSync('cp -r ../vets-website/.cache ./'); // move vets-website cache into content-build
  runCommandSync('yarn && yarn build --port 3001'); // run content-build build
} else {
  runCommandSync('yarn && yarn build --port 3001 --pull-drupal'); // run content-build build
  // runCommandSync('cp -r  ./cache ../vets-website/'); // move content-build cache into vets-website
  runCommandSync('cd ../vets-website && yarn build'); // run vets-website build
}
// Compare the build outputs to see if they match
const exitCode = runCommandSync('yarn build:compare');
process.exit(exitCode);
