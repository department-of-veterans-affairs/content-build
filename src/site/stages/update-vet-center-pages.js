const { logDrupal: log } = require('./build/drupal/utilities-drupal');

function updateVetCenterPages(drupalData) {
  const mediaQuery = drupalData.data.mediaQuery.entities[0];
  for (let i = 0; i < drupalData.data.nodeQuery.entities.length; i += 1) {
    if (drupalData.data.nodeQuery.entities[i].entityBundle === 'vet_center') {
      // Insert the media query into the Vet Center object
      // We have to do this because we cannot search for the
      // media query inside the Vet Center graphQL query
      // eslint-disable-next-line no-param-reassign
      drupalData.data.nodeQuery.entities[i].banner = mediaQuery;
    }
  }
  log('Updated Vet Center pages with media query data');
}

module.exports = {
  updateVetCenterPages,
};
