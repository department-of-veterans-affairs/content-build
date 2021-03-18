const {
  LOCALHOST,
  VAGOVDEV,
  VAGOVSTAGING,
  VAGOVPROD,
} = require('./environments');

const prodBucket = 'https://prod-va-gov-assets.s3-us-gov-west-1.amazonaws.com';
const stagingBucket =
  'https://staging-va-gov-assets.s3-us-gov-west-1.amazonaws.com';
const devBucket = 'https://s3-us-gov-west-1.amazonaws.com/content.dev.va.gov';

module.exports = {
  [VAGOVDEV]: devBucket,
  [VAGOVSTAGING]: stagingBucket,
  [VAGOVPROD]: prodBucket,
  [LOCALHOST]: devBucket,
};
