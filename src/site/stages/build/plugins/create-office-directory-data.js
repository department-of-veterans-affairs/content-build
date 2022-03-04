/* eslint-disable no-param-reassign */
const { ENTITY_BUNDLES } = require('../../../constants/content-modeling');
const { logDrupal } = require('../drupal/utilities-drupal');

function getOfficeDirectoryOfficeNodes(files) {
  return Object.entries(files)
    .filter(([_fileName, file]) => file.entityBundle === ENTITY_BUNDLES.OFFICE)
    .map(([_fileName, file]) => file);
}

function createDataFile(files) {
  const allOffices = getOfficeDirectoryOfficeNodes(files);
  const filePath = 'office-directory/offices.json';
  logDrupal(`Generating office-directory data file at: ${filePath}`);
  files[filePath] = {
    contents: Buffer.from(JSON.stringify(allOffices)),
  };
}

function createOfficeDirectoryData() {
  return files => {
    createDataFile(files);
  };
}

module.exports = createOfficeDirectoryData;
