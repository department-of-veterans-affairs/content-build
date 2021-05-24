/* eslint-disable no-console */

const s3 = require('aws-sdk/client/s3'); // eslint-disable-line import/no-unresolved
const fetch = require('node-fetch');

const S3_BUCKET = process.env.INCREMENTAL_BUCKET;
const PREVIEW_SERVER_BASE_URL = process.env.PREVIEW_SERVER_BASE_URL;

async function processSinglePage(nid, path) {
  const previewServerUrl = PREVIEW_SERVER_BASE_URL + nid;
  const response = await fetch(previewServerUrl);

  if (!response.ok) {
    throw new Error(`unexpected response ${response.statusText}`);
  }

  const uploadResponse = s3
    .upload({ Bucket: S3_BUCKET, Key: path, Body: response.body })
    .promise();

  try {
    await uploadResponse;
    console.log('upload completed successfully');
  } catch (error) {
    console.log('upload failed.', error.message);
  }
}

/**
 * Handler for the SQS Lambda job
 *
 * @param event
 * @param context
 * @returns {Promise<*>}
 */
exports.handler = async function(event, context) {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  for (const record of event.Records) {
    const { body } = record;
    if (body.nid && body.path) {
      // eslint-disable-next-line no-await-in-loop
      await processSinglePage(body.nid, body.path);
    }
  }
};
