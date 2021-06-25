/* eslint-disable no-param-reassign, no-console */
const ENVIRONMENTS = require('../../../constants/environments');
const {
  BLOCKLIST_ENTITY_BUNDLES,
  BLOCKLIST_ENTITY_IDS,
} = require('../../../constants/blocklistedEntities');

function createEnvironmentFilter(options) {
  const environmentName = options.buildtype;

  return (files, metalsmith, done) => {
    for (const fileName of Object.keys(files)) {
      const file = files[fileName];

      // Derive if the file is blocklisted.
      const isBlocklisted =
        BLOCKLIST_ENTITY_BUNDLES.includes(file.entityBundle) ||
        BLOCKLIST_ENTITY_IDS.includes(file.entityId);

      // Do not include blocklisted pages on production (except for the preview server).
      if (
        !options.isPreviewServer &&
        environmentName === ENVIRONMENTS.VAGOVPROD &&
        isBlocklisted
      ) {
        delete files[fileName];
      }

      // Do not include draft pages (except locally).
      if (
        environmentName !== ENVIRONMENTS.LOCALHOST &&
        file.status === 'draft'
      ) {
        delete files[fileName];
      }

      // Do not include file if it is excluded from the current environment.
      if (file[environmentName] === false) {
        console.log(`File excluded from current buildtype: ${fileName}`);
        delete files[fileName];
      }
    }

    done();
  };
}

module.exports = createEnvironmentFilter;
