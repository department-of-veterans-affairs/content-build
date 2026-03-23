const { postProcessVamcSystems } = require('./postProcessVamcSystem');

const normalizeAddress = address =>
  address?.endsWith('/') ? address.slice(0, -1) : address;

const getAddress = buildOptions =>
  normalizeAddress(buildOptions?.['drupal-address']) ||
  normalizeAddress(process.env.DRUPAL_ADDRESS) ||
  'https://prod.cms.va.gov';

// URLs to fetch (even if they are local files)
const query = buildOptions => [
  `${getAddress(buildOptions)}/admin/content/exports/vamc-facilities-csv`,
];

const postProcess = postProcessVamcSystems;

module.exports = {
  query,
  postProcess,
};
