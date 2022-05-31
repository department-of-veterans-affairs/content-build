/* eslint-disable no-param-reassign */
const { ENABLED_ENVIRONMENTS } = require('../../../../constants/drupals');
const getApiClient = require('../api');
const { logDrupal } = require('../utilities-drupal');
const { DATA_FILE_PATH, DATA_FILES } = require('./config');
const { PULL_DRUPAL_BUILD_ARG } = require('../metalsmith-drupal');

function generateStaticDataFilesFromDrupal(
  files,
  buildOptions,
  onlyPublishedContent = true,
) {
  if (!ENABLED_ENVIRONMENTS.has(buildOptions.buildtype)) {
    logDrupal(
      `Drupal integration disabled for buildtype ${buildOptions.buildtype}`,
    );
    return () => {};
  }

  if (!buildOptions[PULL_DRUPAL_BUILD_ARG]) {
    logDrupal(
      `Missing --${PULL_DRUPAL_BUILD_ARG} flag. Skipping static file generation from Drupal.`,
    );
    return () => {};
  }

  if (DATA_FILES.length === 0) {
    logDrupal('No static data files configured for Drupal.');
    return () => {};
  }

  const contentApi = getApiClient(buildOptions);

  return Promise.all(
    DATA_FILES.map(({ description, filename, query, postProcess }) => {
      return contentApi
        .query({
          query,
          variables: {
            onlyPublishedContent,
          },
        })
        .then(json => {
          let data = json;
          if (postProcess) {
            data = postProcess(data);
          }

          const fullFilename = `${DATA_FILE_PATH}/${filename}`;
          files[fullFilename] = {
            contents: Buffer.from(JSON.stringify(data)),
          };
          logDrupal(
            `${
              description ? `${description}: ` : ''
            }Generating static data file from Drupal at ${fullFilename}`,
          );
        });
    }),
  );
}

module.exports = generateStaticDataFilesFromDrupal;
