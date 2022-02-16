const moment = require('moment');
const fetch = require('node-fetch');
const pRetry = require('p-retry');
const chalk = require('chalk');
const SocksProxyAgent = require('socks-proxy-agent');

const { PUBLIC_URLS } = require('../../../constants/drupals');
const syswidecas = require('syswide-cas');
const { queries, getQuery } = require('./queries');
const {
  getIndividualizedQueries,
  CountEntityTypes,
} = require('./individual-queries');

const { getCurrentDayAsUnixTimestamp } = require('./utilities-drupal');

function encodeCredentials({ user, password }) {
  const credentials = `${user}:${password}`;
  return Buffer.from(credentials).toString('base64');
}

const defaultClientOptions = { verbose: true, maxParallelRequests: 15 };

function getDrupalClient(buildOptions, clientOptionsArg) {
  const buildArgs = {
    address: buildOptions['drupal-address'],
    user: buildOptions['drupal-user'],
    password: buildOptions['drupal-password'],
    maxParallelRequests: buildOptions['drupal-max-parallel-requests'],
  };

  const maxParallelRequests =
    buildArgs.maxParallelRequests ?? defaultClientOptions.maxParallelRequests;

  Object.keys(buildArgs).forEach(key => {
    if (!buildArgs[key]) delete buildArgs[key];
  });

  const clientOptions = { ...defaultClientOptions, ...clientOptionsArg };

  // Set up debug logging
  // eslint-disable-next-line no-console
  const say = clientOptions.verbose ? console.log : () => {};

  // Instead of using Drupal Constants for API Connections
  // simplify the default connection information by pointing
  // to the Tugboat content-build preview.
  if (buildOptions.buildtype !== 'vagovprod') {
    // eslint-disable-next-line no-unused-vars
    const envConfig = {
      address:
        'https://content-build-medc0xjkxm4jmpzxl3tfbcs7qcddsivh.ci.cms.va.gov',
      user: 'content_build_api',
      password: 'drupal8',
    };
  } else {
    // eslint-disable-next-line no-unused-vars
    const envConfig = {
      address: 'https://prod.cms.va.gov',
    };
  }

  // eslint-disable-next-line prefer-object-spread, no-undef
  const drupalConfig = Object.assign({}, envConfig, buildArgs);

  const { address, user, password } = drupalConfig;

  // Need to cover 2 cases for building content from prod.
  // 1. Specified buildtype as vagovprod but didn't supply credentials.
  // 2. Specified --drupal-address as prod.cms.va.gov but didn't supply credentials.
  if (
    !(user && password) ||
    (address.includes('prod') && !(buildArgs.user && buildArgs.password))
  ) {
    throw new Error(
      'Missing --drupal-user or --drupal-password command line arguments.\n Also check that DRUPAL_USERNAME and DRUPAL_PASSWORD environment variables are set if not using CLI arguments.\n If you do not have Drupal API credentials please request them from:\n #cms-support https://dsva.slack.com/archives/CDHBKAL9W ',
    );
  }

  const drupalUri = `${address}/graphql`;
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
      address.includes('cms.va.gov') && !buildOptions['no-drupal-proxy'],

    getSiteUri() {
      return address;
    },

    shouldReplaceAssetPath() {
      return !!PUBLIC_URLS[this.getSiteUri()];
    },

    async proxyFetch(url, options = {}) {
      if (this.usingProxy) {
        // addCAs() is here because VA uses self-signed certificates with a
        // non-globally trusted Root Certificate Authority and we need to
        // tell our code to trust it, otherwise we get self-signed certificate errors.
        syswidecas.addCAs('certs/VA-Internal-S2-RCA1-v1.pem');
      }

      return fetch(
        url,
        // eslint-disable-next-line prefer-object-spread
        Object.assign({}, options, {
          agent: this.usingProxy ? agent : undefined,
        }),
      );
    },

    async query(args) {
      const response = await this.proxyFetch(drupalUri, {
        headers,
        method: 'post',
        mode: 'cors',
        body: JSON.stringify(args),
      });

      if (response.ok) {
        return response.text().then(data => {
          try {
            return JSON.parse(data);
          } catch (error) {
            /* eslint-disable no-console */
            console.error(
              chalk.red(
                "There was an error parsing the response body, it isn't valid JSON. Here is the error:",
              ),
            );
            console.error(error);
            console.error();
            console.error(chalk.red('Response code:'), response.status);
            console.error(chalk.red('Start of body:'), data.slice(0, 100));
            console.error(chalk.red('End of body:'), data.slice(-100));
            /* eslint-enable */

            throw error;
          }
        });
      }

      throw new Error(`HTTP error: ${response.status}: ${response.statusText}`);
    },

    async getAllPagesViaIndividualGraphQlQueries(onlyPublishedContent = true) {
      /* eslint-disable no-console, no-await-in-loop */

      say('Pulling from Drupal via GraphQL...');

      const entityCounts = await this.query({
        query: CountEntityTypes,
      });

      say('Received node counts...');
      console.table(entityCounts.data);

      const result = {
        data: {
          nodeQuery: {
            entities: [],
          },
        },
      };

      const individualQueries = Object.entries(
        getIndividualizedQueries(entityCounts),
      );

      const totalQueries = individualQueries.length;

      const parallelQuery = async () => {
        if (individualQueries.length === 0) {
          // The only time this condition should occur is if
          // the parallelQueries executed before this
          // finish the entire array of requests before this
          // one has a chance to execute its first request.
          // This can happen is the CMS's cache is very hot.
          return true;
        }

        const [queryName, query] = individualQueries.pop();

        const startTime = moment();
        const allowedRetries = 3;
        const json = await pRetry(
          () =>
            this.query({
              query,
              variables: {
                today: getCurrentDayAsUnixTimestamp().toString(),
                onlyPublishedContent,
              },
            }),
          allowedRetries,
        );

        if (json.errors) {
          const formattedErrors = JSON.stringify(json.errors, null, 2);
          const pluralizedErrors =
            json.errors.length > 1 ? 'errors' : 'an error';
          throw new Error(
            `GraphQL query ${queryName} has ${pluralizedErrors}:\n${query}\n\n${chalk.red(
              `Error with ${queryName}. Scroll up for the GraphQL query that has ${pluralizedErrors}:\n\n${formattedErrors}`,
            )}`,
          );
        }

        if (json.data?.nodeQuery) {
          result.data.nodeQuery.entities.push(...json.data.nodeQuery.entities);
        } else {
          Object.assign(result.data, json.data);
        }

        let timeElapsed = moment().diff(startTime, 'seconds');
        let pageCount = json.data.nodeQuery
          ? json.data.nodeQuery.entities.length
          : '[n/a]';

        if (timeElapsed > 60) {
          timeElapsed = chalk.red(timeElapsed);
        }

        if (pageCount > 100) {
          pageCount = chalk.red(pageCount);
        }

        say(
          `| ${chalk.blue(queryName)} | ${timeElapsed}s | ${pageCount} pages |`,
        );

        if (individualQueries.length > 0) {
          return parallelQuery();
        }

        return true;
      };

      say(
        chalk.blue(
          `Beginning GraphQL queries with parallelization at ${maxParallelRequests} requests...`,
        ),
      );

      const overallStartTime = moment();
      const staggeredRequests = new Array(maxParallelRequests)
        .fill(null)
        .map((_, index) => {
          return new Promise(resolve => {
            const delay = index * 250;
            setTimeout(() => resolve(parallelQuery()), delay);
          });
        });

      await Promise.all(staggeredRequests);

      const overallTimeElapsed = moment().diff(overallStartTime, 'seconds');

      console.log(
        `Finished ${totalQueries} queries in ${overallTimeElapsed}s with ${result.data.nodeQuery.entities.length} pages`,
      );

      return result;
    },

    getAllPages(onlyPublishedContent = true) {
      return this.query({
        query: getQuery(queries.GET_ALL_PAGES),
        variables: {
          today: getCurrentDayAsUnixTimestamp().toString(),
          onlyPublishedContent,
        },
      });
    },

    getLatestPageById(nodeId) {
      return this.query({
        query: getQuery(queries.GET_LATEST_PAGE_BY_ID),
        variables: {
          id: nodeId,
          today: getCurrentDayAsUnixTimestamp().toString(),
          onlyPublishedContent: false,
        },
      });
    },
  };
}

module.exports = getDrupalClient;
