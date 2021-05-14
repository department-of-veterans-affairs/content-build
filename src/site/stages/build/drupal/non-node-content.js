/* eslint-disable no-console */

const {
  nonNodeQueries,
} = require('individual-queries');

const S3_BUCKET = 'vetsgov-website-builds-s3-upload';
const S3_KEY = 'non-node-content-cache/master/non-node-content.json';

/**
 * Pulls all of the non-node content from Drupal.
 *
 * @returns {Promise<{data: {}}>}
 */
async function getNonNodeContent(drupalClient, refreshProgress = 0) {
  const freshNonNodeContent = { data: {} };
  const queries = Object.entries(nonNodeQueries());

  console.time('Node-node queries');
  for (const [queryName, query] of queries) {
    console.time(queryName);

    // eslint-disable-next-line no-await-in-loop
    const json = await drupalClient.query({ query });
    Object.assign(freshNonNodeContent.data, json.data);
    console.timeEnd(queryName);

    refreshProgress += 1 / queries.length;
  }

  console.timeEnd('Node-node queries');
  return freshNonNodeContent;
}

module.exports = {
  getNonNodeContent,
  S3_KEY,
  S3_BUCKET
};