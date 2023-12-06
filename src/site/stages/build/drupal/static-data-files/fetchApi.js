const fetch = require('node-fetch');
const SocksProxyAgent = require('socks-proxy-agent');
const syswidecas = require('syswide-cas');
const { curly } = require('node-libcurl');

const { Response } = fetch;

// Uses fetch to make a request to a non-file URL or uses node-libcurl to make a request to a file URL
// Returns a node-fetch response in all cases
async function fetchWrapper(url, options) {
  if (url.startsWith('file:')) {
    const { data } = await curly.get(url);
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
  const agent = new SocksProxyAgent('socks://127.0.0.1:2001');
  return {
    // We have to point to aws urls on Jenkins, so the only
    // time we'll be using cms.va.gov addresses is locally,
    // when we need a proxy

    async proxyFetch(url, options = { headers }) {
      const usingProxy =
        /^https?:\/\/.*\.cms\.va\.gov\//.test(url) &&
        !buildOptions['no-drupal-proxy'];

      if (usingProxy) {
        // addCAs() is here because VA uses self-signed certificates with a
        // non-globally trusted Root Certificate Authority and we need to
        // tell our code to trust it, otherwise we get self-signed certificate errors.
        syswidecas.addCAs([
          'certs/VA-Internal-S2-RCA1-v1.pem',
          'certs/VA-Internal-S2-RCA2.pem',
        ]);
      }
      
      return fetchWrapper(
        url,
        // eslint-disable-next-line prefer-object-spread
        Object.assign({}, options, {
          agent: usingProxy ? agent : undefined,
        }),
      );
    },
  };
}

module.exports = getCurlClient;
