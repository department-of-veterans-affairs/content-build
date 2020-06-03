const {
  LOCALHOST,
  DEVELOPMENT,
  PRODUCTION,
  STAGING,
  VAGOVDEV,
  VAGOVSTAGING,
  VAGOVPROD,
} = require('./environments');

const hostnames = require('./hostnames');

const bucket = 'https://s3-us-gov-west-1.amazonaws.com';

const prodBucket = 'https://prod-va-gov-assets.s3-us-gov-west-1.amazonaws.com';
const devBucket = 'https://dev-va-gov-assets.s3-us-gov-west-1.amazonaws.com';

module.exports = {
  [DEVELOPMENT]: `${bucket}/${hostnames[DEVELOPMENT]}`,
  [PRODUCTION]: `${bucket}/${hostnames[PRODUCTION]}`,
  [STAGING]: `${bucket}/${hostnames[STAGING]}`,
  [VAGOVDEV]: devBucket,
  [VAGOVSTAGING]:
    'https://staging-va-gov-assets.s3-us-gov-west-1.amazonaws.com',
  [VAGOVPROD]: prodBucket,
  [LOCALHOST]: devBucket,
};
