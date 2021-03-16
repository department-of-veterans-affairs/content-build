const {
  LOCALHOST,
  VAGOVDEV,
  VAGOVSTAGING,
  VAGOVPROD,
} = require('./environments');

const prodBucket = 'https://prod-va-gov-assets.s3-us-gov-west-1.amazonaws.com';
const stagingBucket =
  'https://staging-va-gov-assets.s3-us-gov-west-1.amazonaws.com';
const devBucket = 'http://apps.dev.va.gov.s3-website-us-gov-west-1.amazonaws.com';

module.exports = {
  [VAGOVDEV]: devBucket,
  [VAGOVSTAGING]: stagingBucket,
  [VAGOVPROD]: prodBucket,
  [LOCALHOST]: devBucket,
};
