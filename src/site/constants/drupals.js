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

module.exports.ENABLED_ENVIRONMENTS = ENABLED_ENVIRONMENTS;
module.exports.PREFIXED_ENVIRONMENTS = PREFIXED_ENVIRONMENTS;
