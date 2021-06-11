/* eslint-disable no-console */

const S3 = require('aws-sdk/clients/s3'); // eslint-disable-line import/no-unresolved
const fetch = require('node-fetch').default;

const s3 = new S3();
const S3_BUCKET = process.env.INCREMENTAL_BUCKET;
const PREVIEW_SERVER_BASE_URL = process.env.PREVIEW_SERVER_BASE_URL;

async function processSinglePage(nid, path) {
  const previewServerUrl = PREVIEW_SERVER_BASE_URL + nid;
  const response = await fetch(previewServerUrl);
  const fullPath = `${path}/index.html`;

  if (!response.ok) {
    throw new Error(`unexpected response ${response.statusText}`);
  }

  console.log(`Uploading nid: ${nid} path: ${path} to fullpath: ${fullPath}`);

  const uploadResponse = s3
    .upload({
      ACL: 'public-read',
      Bucket: S3_BUCKET,
      Key: fullPath,
      Body: response.body,
      CacheControl: 'public, no-cache',
      ContentType: 'text/html',
    })
    .promise();

  try {
    const uploadRes = await uploadResponse;
    console.log('upload completed', uploadRes);
  } catch (error) {
    console.log('upload failed.', error.message);
  }
}

/**
 * Handler for the SQS Lambda job
 *
 * @param event
 * @param context
 */
exports.handler = async function(event, context) {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const processPromises = [];
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    if (body.nid && body.path) {
      try {
        let cleanPath = body.path;
        // Drupal sends the path with a leading / which break aws.
        if (cleanPath.startsWith('/')) {
          cleanPath = body.path.slice(1);
        }
        processPromises.push(processSinglePage(body.nid, cleanPath));
      } catch (e) {
        console.log('Error creating upload promise', e.message);
      }
    } else {
      console.log('Body is not correctly formatted', body);
    }
  }

  await Promise.all(processPromises);
};
