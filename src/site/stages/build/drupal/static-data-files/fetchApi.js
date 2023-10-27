const fetch = require('node-fetch');
const fs = require('fs');
const { fileURLToPath } = require('url');
const chalk = require('chalk');
const SocksProxyAgent = require('socks-proxy-agent');
const syswidecas = require('syswide-cas');

const { blobFrom, Response } = fetch;

export default async function fetchWrapper(url, options) {
  if (url.startsWith('file:')) {
    const filePath = fileURLToPath(url);

    if (!fs.existsSync(filePath)) {
      return new Response(null, { status: 404, statusText: 'NOT FOUND' });
    }
    const blob = await blobFrom(filePath, { type: 'application/octet-stream' });
    return new Response(blob, { status: 200, statusText: 'OK', url });
  }
  return fetch(url, options);
}

function encodeCredentials({ user, password }) {
  const credentials = `${user}:${password}`;
  return Buffer.from(credentials).toString('base64');
}

const defaultClientOptions = { verbose: true, maxParallelRequests: 15 };

function getCurlClient(buildOptions, clientOptionsArg) {
  const buildArgs = {
    address: buildOptions['drupal-address'],
    user: buildOptions['drupal-user'],
    password: buildOptions['drupal-password'],
    maxParallelRequests: buildOptions['drupal-max-parallel-requests'],
  };

  Object.keys(buildArgs).forEach(key => {
    if (!buildArgs[key]) delete buildArgs[key];
  });

  const clientOptions = { ...defaultClientOptions, ...clientOptionsArg };

  // Set up debug logging
  // eslint-disable-next-line no-console
  const say = clientOptions.verbose ? console.log : () => {};

  // eslint-disable-next-line prefer-object-spread, no-undef
  const drupalConfig = Object.assign({}, buildArgs);
  const { address, user, password } = drupalConfig;

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
    usingProxy:
      /^https?:\/\/.*\.cms\.va\.gov$/.test(address) &&
      !buildOptions['no-drupal-proxy'],

    async proxyFetch(url, options = {}) {
      if (this.usingProxy) {
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
          agent: this.usingProxy ? agent : undefined,
        }),
      );
    },

    async query(qargs) {
      const { method, url, args } = qargs;
      say(chalk.green(`Fetching ${url}`));
      const response = await this.proxyFetch(url, {
        headers,
        method: method || 'GET',
        mode: 'cors',
        body: JSON.stringify(args),
      });

      if (response.ok) {
        return response.text();
      }

      throw new Error(`HTTP error: ${response.status}: ${response.statusText}`);
    },
  };
}

module.exports = getCurlClient;
