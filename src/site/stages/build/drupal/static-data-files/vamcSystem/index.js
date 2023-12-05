const { postProcessVamcSystems } = require('./postProcessVamcSystem');

// URLs to fetch (even if they are local files)
const query = [
  'http://staging.cms.va.gov/admin/content/exports/vamc-facilities-csv',
];

const postProcess = postProcessVamcSystems;

module.exports = {
  query,
  postProcess,
};
