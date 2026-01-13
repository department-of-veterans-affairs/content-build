const { postProcessVamcSystems } = require('./postProcessVamcSystem');

// URLs to fetch (even if they are local files)
let queryAddress =
  'http://prod.cms.va.gov/admin/content/exports/vamc-facilities-csv';
const nodeEnv = process.env.NODE_ENV;
const buildtypeArg = process.env.npm_config_argv?.match(
  /vagov(prod|staging|dev)/,
);

if (process.env.DRUPAL_ADDRESS) {
  queryAddress = `${process.env.DRUPAL_ADDRESS}/admin/content/exports/vamc-facilities-csv`;
} else if (nodeEnv === 'production') {
  if (buildtypeArg?.[1] === 'prod') {
    queryAddress =
      'https://prod.cms.va.gov/admin/content/exports/vamc-facilities-csv';
  } else {
    queryAddress =
      'https://staging.cms.va.gov/admin/content/exports/vamc-facilities-csv';
  }
}

const query = [queryAddress];

const postProcess = postProcessVamcSystems;

module.exports = {
  query,
  postProcess,
};
