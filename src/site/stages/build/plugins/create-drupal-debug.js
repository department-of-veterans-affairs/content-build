/* eslint-disable no-param-reassign */

const ENVIRONMENTS = require('../../../constants/environments');
const { ENABLED_ENVIRONMENTS } = require('../../../constants/drupals');
const { logDrupal: log } = require('../drupal/utilities-drupal');

function createErrorPage(drupalError) {
  return `
    <!doctype html>
    <html>
    <body>
      <h1>An error occurred while executing the Metalsmith-Drupal plugin</h1>
      <pre>${JSON.stringify(drupalError)}</pre>
    </body>
    </html>
  `;
}

function createIndexPage(files) {
  const orderedObject = Object.keys(files)
    .sort()
    .reduce((obj, key) => {
      obj[key] = files[key];
      return obj;
    }, {});

  const drupalPages = Object.keys(orderedObject)
    .filter(fileName => orderedObject[fileName].isDrupalPage)
    .map(fileName => `<li><a href="/${fileName}">${fileName}</a></li>\n`)
    .join('');

  return `
    <h1>The following pages were provided by Drupal:</h1>
    <ol>${drupalPages}</ol>
  `;
}

function createDrupalDebugPage(buildOptions) {
  // Disable this page if Drupal is not promoted to this environment, or if we're in production, because
  // a debug page should never be built there.
  if (
    !ENABLED_ENVIRONMENTS.has(buildOptions.buildtype) ||
    buildOptions.buildtype === ENVIRONMENTS.VAGOVPROD
  ) {
    return () => {};
  }

  return (files, smith, done) => {
    if (global.verbose) {
      log('Drupal debug page written to /drupal/debug.');
    }

    const { drupalError } = buildOptions;
    const drupalDebugPage = drupalError
      ? createErrorPage(drupalError)
      : createIndexPage(files);

    files['drupal/debug/index.html'] = {
      contents: Buffer.from(drupalDebugPage),
      path: '/drupal/debug/',
      isDrupalPage: true,
      private: true,
    };

    done();
  };
}

module.exports = createDrupalDebugPage;
