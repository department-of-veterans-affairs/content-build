const { readFile } = require('fs').promises;
const { fileURLToPath } = require('url');
const fetch = require('node-fetch');

const { Response } = fetch;

// Uses fetch to make a request to a non-file URL or reads a local file for file: URLs
// Returns a node-fetch response in all cases
async function fetchWrapper(url, options) {
  if (url.startsWith('file:')) {
    const data = await readFile(fileURLToPath(url));
    return new Response(data, { status: 200, statusText: 'OK', url });
  }
  return fetch(url, options);
}

function encodeCredentials({ user, password }) {
  const credentials = `${user}:${password}`;
  return Buffer.from(credentials).toString('base64');
}

function getCurlClient(buildOptions, _clientOptionsArg = { verbose: true }) {
  const buildArgs = {
    user: buildOptions['drupal-user'],
    password: buildOptions['drupal-password'],
    maxParallelRequests: buildOptions['drupal-max-parallel-requests'],
  };

  Object.keys(buildArgs).forEach(key => {
    if (!buildArgs[key]) delete buildArgs[key];
  });

  const { user, password } = buildArgs;

  const encodedCredentials = encodeCredentials({ user, password });
  const headers = {
    Authorization: `Basic ${encodedCredentials}`,
    'Content-Type': 'application/json',
  };
  return {
    async proxyFetch(url, options = { headers }) {
      return fetchWrapper(url, options);
    },
  };
}

module.exports = getCurlClient;
