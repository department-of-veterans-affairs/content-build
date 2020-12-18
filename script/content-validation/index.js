const printBuildHelp = require('../content-build-help');
const getOptions = require('../../src/site/stages/build/options');
const build = require('../../src/site/stages/build/content-validation.js');

// If help, echo the options
if (process.argv[2] === 'help') {
  printBuildHelp();
  process.exit(0);
}

/**
 * async function to build the content with build options
 */
async function buildContent() {
  const buildOptions = await getOptions();
  build(buildOptions);
}

buildContent();
