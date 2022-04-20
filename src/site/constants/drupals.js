const ENVIRONMENTS = require('./environments');

/**
 * The decoupled-Drupal API locations by environment
 * These should be considered very temporary, because their locations will definitely change as
 * the Drupal integration continues.
 * @module site/constants/drupals
 */

const ENABLED_ENVIRONMENTS = new Set([
  ENVIRONMENTS.LOCALHOST,
  ENVIRONMENTS.VAGOVDEV,
  ENVIRONMENTS.VAGOVSTAGING,
  ENVIRONMENTS.VAGOVPROD,
]);

const PREFIXED_ENVIRONMENTS = new Set([
  // ENVIRONMENTS.LOCALHOST,
  // ENVIRONMENTS.VAGOVSTAGING,
  // ENVIRONMENTS.VAGOVPROD,
]);

const PUBLIC_URLS = {
  'http://internal-dsva-vagov-dev-cms-812329399.us-gov-west-1.elb.amazonaws.com':
    'http://dev.cms.va.gov',
  'http://internal-dsva-vagov-staging-cms-1188006.us-gov-west-1.elb.amazonaws.com':
    'http://staging.cms.va.gov',
  'http://internal-dsva-vagov-prod-cms-2000800896.us-gov-west-1.elb.amazonaws.com':
    'http://prod.cms.va.gov',
};

module.exports.ENABLED_ENVIRONMENTS = ENABLED_ENVIRONMENTS;
module.exports.PREFIXED_ENVIRONMENTS = PREFIXED_ENVIRONMENTS;
module.exports.PUBLIC_URLS = PUBLIC_URLS;
