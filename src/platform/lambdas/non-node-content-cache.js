/* eslint-disable no-console */

const S3 = require('aws-sdk/clients/s3'); // eslint-disable-line import/no-unresolved

const getOptions = require('../../site/stages/build/options');
const getDrupalClient = require('../../site/stages/build/drupal/api');

const nonNodeContent = require('../../site/stages/build/drupal/non-node-content');

const DRUPAL_ADDRESS =
  'http://internal-dsva-vagov-prod-cms-2000800896.us-gov-west-1.elb.amazonaws.com';

/* eslint-enable no-await-in-loop */

exports.handler = async function(event, context) {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const options = await getOptions({
    'drupal-address': DRUPAL_ADDRESS,
    'no-drupal-proxy': true,
    'pull-drupal': true,
  });

  let content = { data: {} };

  try {
    console.log('Initializing Drupal client...');
    const contentApi = getDrupalClient(options);
    console.log('Fetching Non-Node Drupal content...');
    content = await nonNodeContent.getNonNodeContent(contentApi);
    console.log('Successfully fetched Non-Node Drupal content!');
  } catch (error) {
    console.error('Failed to fetch Drupal content.');
    throw new Error(error);
  }

  if (content.errors && content.errors.length) {
    console.log(JSON.stringify(content.errors, null, 2));
    throw new Error('Drupal query returned with errors');
  }

  console.log('Stringifying the data...');
  const pagesString = JSON.stringify(content, null, 2);

  console.log('Uploading the cache...');
  const s3 = new S3();
  const request = s3.upload({
    Body: pagesString,
    Bucket: nonNodeContent.S3_BUCKET,
    Key: nonNodeContent.S3_KEY,
  });

  let response = null;

  try {
    response = await request.promise();
    console.log('Successfully uploaded the cache!');
  } catch (error) {
    console.error('Failed to upload the cache.');
    throw new Error(error);
  }

  return response;
};