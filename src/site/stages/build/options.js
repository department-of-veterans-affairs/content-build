/* eslint-disable no-param-reassign */
require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const commandLineArgs = require('command-line-args');

const ENVIRONMENTS = require('../../constants/environments');
const HOSTNAMES = require('../../constants/hostnames');
const assetSources = require('../../constants/assetSources');

const projectRoot = path.resolve(__dirname, '../../../../');

const defaultBuildtype = ENVIRONMENTS.LOCALHOST;
const defaultHost = HOSTNAMES[defaultBuildtype];
const defaultContentDir = path.join(projectRoot, '../vagov-content/pages');
const nextBuildDir = path.join(projectRoot, '../next-build/');

const getDrupalClient = require('./drupal/api');
const { shouldPullDrupal } = require('./drupal/metalsmith-drupal');
const { logDrupal } = require('./drupal/utilities-drupal');
const { useFlags } = require('./drupal/load-saved-flags');

const { runCommandSync } = require('../../../../script/utils');

const COMMAND_LINE_OPTIONS_DEFINITIONS = [
  { name: 'buildtype', type: String, defaultValue: defaultBuildtype },
  { name: 'host', type: String, defaultValue: defaultHost },
  { name: 'port', type: Number, defaultValue: 3002 },
  { name: 'api', type: String, defaultValue: null },
  { name: 'watch', type: Boolean, defaultValue: false },
  { name: 'entry', type: String, defaultValue: null },
  { name: 'analyzer', type: Boolean, defaultValue: false },
  { name: 'protocol', type: String, defaultValue: 'http' },
  { name: 'public', type: String, defaultValue: null },
  { name: 'destination', type: String, defaultValue: null },
  { name: 'asset-source', type: String, defaultValue: assetSources.LOCAL },
  { name: 'apps-directory-name', type: String, defaultValue: 'vets-website' },
  { name: 'content-directory', type: String, defaultValue: defaultContentDir },
  { name: 'pull-drupal', type: Boolean, defaultValue: false },
  { name: 'drupal-fail-fast', type: Boolean, defaultValue: false },
  { name: 'setPublicPath', type: Boolean, defaultValue: false },
  { name: 'run-next-build', type: Boolean, defaultValue: false },
  {
    name: 'next-build-directory',
    type: String,
    defaultValue: nextBuildDir,
  },
  {
    name: 'drupal-address',
    type: String,
    defaultValue: process.env.DRUPAL_ADDRESS,
  },
  {
    name: 'drupal-user',
    type: String,
    defaultValue: process.env.DRUPAL_USERNAME,
  },
  {
    name: 'drupal-password',
    type: String,
    defaultValue: process.env.DRUPAL_PASSWORD,
  },
  {
    name: 'drupal-max-parallel-requests',
    type: Number,
    defaultValue: process.env.DRUPAL_MAX_PARALLEL_REQUESTS,
  },
  {
    name: 'no-drupal-proxy',
    type: Boolean,
    defaultValue: process.env.NO_DRUPAL_PROXY === 'true',
  },
  { name: 'local-proxy-rewrite', type: Boolean, defaultValue: false },
  { name: 'local-css-sourcemaps', type: Boolean, defaultValue: false },
  { name: 'accessibility', type: Boolean, defaultValue: false },
  { name: 'lint-plain-language', type: Boolean, defaultValue: false },
  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false },
  { name: 'omitdebug', type: Boolean, defaultValue: false },

  // use the --nosymlink flag with a build to bypass symlink creation
  { name: 'nosymlink', type: Boolean, defaultValue: false },

  // HACK: The drupal-aws-cache script ends up here while trying to cache
  // the query for getting all pages. The 'fetch' option from that cache script
  // isn't actually a part of this list of options, but an error would be thrown
  // without it. Remove this when getOptions is decoupled from the cache script.
  { name: 'fetch', type: Boolean, defaultValue: false },

  // use the --use-cached-assets flag with a build to bypass re-downloading asset files
  { name: 'use-cached-assets', type: Boolean, defaultValue: false },

  // use the --gql-queries-only flag to only run graphql queries
  { name: 'gql-queries-only', type: Boolean, defaultValue: false },
];

function gatherFromCommandLine() {
  return commandLineArgs(COMMAND_LINE_OPTIONS_DEFINITIONS);
}

function applyDefaultOptions(options) {
  const contentPagesRoot = options['content-directory'];
  const nextBuildDirectory = options['next-build-directory'];
  const runNextBuild = options['run-next-build'];
  const contentRoot = path.join(contentPagesRoot, '../');

  const siteRoot = path.join(__dirname, '../../');
  const includes = path.join(siteRoot, 'includes');
  const components = path.join(siteRoot, 'components');
  const layouts = path.join(siteRoot, 'layouts');
  const paragraphs = path.join(siteRoot, 'paragraphs');
  const navigation = path.join(siteRoot, 'navigation');
  const facilities = path.join(siteRoot, 'facilities');
  const blocks = path.join(siteRoot, 'blocks');
  const teasers = path.join(siteRoot, 'teasers');
  const utilities = path.join(siteRoot, 'utilities');

  Object.assign(options, {
    contentRoot,
    contentPagesRoot,
    nextBuildDirectory,
    runNextBuild,
    contentFragments: path.join(contentRoot, 'fragments'),
    contentAssets: {
      source: path.join(contentRoot, 'assets'),
      destination: './',
    },
    destination: path.resolve(
      projectRoot,
      'build',
      options.destination || options.buildtype,
    ),
    appAssets: {
      source: '../../assets',
      destination: './',
    },
    layouts,
    collections: require('./data/collections.json'),
    watchPaths: [
      `${contentRoot}/**/*.{md,html,liquid}`,
      `${includes}/**/*.{md,html,liquid}`,
      `${components}/**/*.{md,html,liquid}`,
      `${layouts}/**/*.{md,html,liquid}`,
      `${paragraphs}/**/*.{md,html,liquid}`,
      `${navigation}/**/*.{md,html,liquid}`,
      `${facilities}/**/*.{md,html,liquid}`,
      `${blocks}/**/*.{md,html,liquid}`,
      `${teasers}/**/*.{md,html,liquid}`,
    ],
    cacheDirectory: path.join(projectRoot, '.cache', options.buildtype),
    paramsDirectory: path.join(utilities, 'query-params'),
    gqlQueriesOnly: !!options['gql-queries-only'],
  });
}

function applyEnvironmentOverrides(options) {
  if (options.buildtype === ENVIRONMENTS.LOCALHOST) return;

  const allBuildtypes = Object.keys(ENVIRONMENTS).map(key => ENVIRONMENTS[key]);
  const isBuildtypeValid = allBuildtypes.includes(options.buildtype);

  if (!isBuildtypeValid) {
    throw new Error(`Unknown buildtype: '${options.buildtype}'`);
  }

  const optimizedEnvs = new Set([
    ENVIRONMENTS.VAGOVPROD,
    ENVIRONMENTS.VAGOVSTAGING,
  ]);
  const isOptimizedBuild = optimizedEnvs.has(options.buildtype);

  if (isOptimizedBuild && process.env.NODE_ENV !== 'production') {
    throw new Error(
      'To build a production-like environment, the "NODE_ENV" environment variable must be set to "production".',
    );
  }
}

function deriveHostUrl(options) {
  const isHerokuBuild = !!process.env.HEROKU_APP_NAME;

  if (options.buildtype !== ENVIRONMENTS.LOCALHOST || isHerokuBuild) {
    options.port = 80;
    options.protocol = 'https';

    if (isHerokuBuild) {
      options.host = `${process.env.HEROKU_APP_NAME}.herokuapp.com`;
    } else {
      options.host = HOSTNAMES[options.buildtype];
    }
  }

  options.hostUrl = `${options.protocol}://${options.host}${
    options.port && options.port !== 80 ? `:${options.port}` : ''
  }`;

  options.domainReplacements = [
    { from: 'https://www\\.va\\.gov', to: options.hostUrl },
  ];
}

/**
 * Fetches Drupal cache when needed if the 'pull-drupal' and 'drupal-address'
 * flags aren't in use.
 */
function fetchDrupalCache(options) {
  const pullDrupalArg = 'pull-drupal';
  const drupalAddressArg = 'drupal-address';

  const cachePaths = [
    'drupal/downloads',
    'drupal/feature-flags.json',
    'drupal/pages.json',
  ];
  const cachePathMissing =
    !fs.existsSync(options.cacheDirectory) ||
    cachePaths.findIndex(
      cachePath => !fs.existsSync(path.join(options.cacheDirectory, cachePath)),
    ) > -1;

  if (
    !options[pullDrupalArg] &&
    !options[drupalAddressArg] &&
    cachePathMissing
  ) {
    logDrupal(`Attempting to fetch Drupal cache...`);
    runCommandSync('yarn fetch-drupal-cache');
  }
}

function checkDrupalConnectionOptions(options) {
  const pullDrupalArg = 'pull-drupal';
  const drupalAddressArg = 'drupal-address';
  const drupalUserArg = 'drupal-user';
  const drupalPasswordArg = 'drupal-password';

  const errorMessageCollection = [];
  let throwError = false;

  if (options[pullDrupalArg] || options[drupalAddressArg]) {
    if (!options[drupalUserArg]) {
      errorMessageCollection.push(
        '\nMissing --drupal-user CLI argument or DRUPAL_USERNAME environment variable not set.\nIf you do not have Drupal API credentials please request them from:\n#cms-support https://dsva.slack.com/archives/CDHBKAL9W\n',
      );
      throwError = true;
    }

    if (!options[drupalPasswordArg]) {
      errorMessageCollection.push(
        '\nMissing --drupal-password CLI argument or DRUPAL_PASSWORD environment variable not set.\nIf you do not have Drupal API credentials please request them from:\n#cms-support https://dsva.slack.com/archives/CDHBKAL9W\n',
      );
      throwError = true;
    }

    if (!options[drupalAddressArg]) {
      errorMessageCollection.push(
        '\nMissing --drupal-address CLI argument or DRUPAL_ADDRESS environment variable not set.\n',
      );
      throwError = true;
    }

    if (throwError) {
      errorMessageCollection.push(
        '\nDoes the .env file exist? Run this command to create default environment variables file:\ncp .env.example .env\n',
      );

      throw new Error(errorMessageCollection.join(''));
    }
  }
}

/**
 * Sets up the CMS feature flags by either querying the CMS for them
 * or using ../../utilities/featureFlags. If we pull from Drupal, it'll
 * also ensure the cache directory exists.
 */
async function setUpFeatureFlags(options) {
  global.buildtype = options.buildtype;
  let rawFlags;

  const featureFlagFile = path.join(
    options.cacheDirectory,
    'drupal',
    'feature-flags.json',
  );

  if (shouldPullDrupal(options)) {
    logDrupal('Pulling feature flags from Drupal...');
    const apiClient = getDrupalClient(options);
    const result = await apiClient.proxyFetch(
      `${apiClient.getSiteUri()}/flags_list`,
    );

    const responseBody = await result.text();
    try {
      rawFlags = JSON.parse(responseBody).data;
    } catch (e) {
      throw new TypeError(
        `Could not parse Drupal build flags. Response:\n${responseBody}`,
      );
    }

    // Write them to .cache/{buildtype}/drupal/feature-flags.json
    fs.ensureDirSync(path.dirname(featureFlagFile));
    fs.writeJsonSync(featureFlagFile, rawFlags, { spaces: 2 });
  } else {
    logDrupal('Using cached feature flags');
    rawFlags = fs.existsSync(featureFlagFile)
      ? fs.readJsonSync(featureFlagFile)
      : {};
  }

  if (global.verbose) {
    logDrupal(`Drupal feature flags:\n${JSON.stringify(rawFlags, null, 2)}`);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const proxiedFlags = useFlags(rawFlags);

  Object.assign(options, {
    cmsFeatureFlags: proxiedFlags,
  });
}

/**
 * If we pull from Drupal, this ensures the cache downloads directory is empty.
 * Can be overridden with the --use-cached-assets flag.
 */
function clearDrupalCacheDirectory(options) {
  const useCachedAssetsArg = 'use-cached-assets';
  if (shouldPullDrupal(options) && !options[useCachedAssetsArg]) {
    const drupalCacheDirectory = path.join(
      options.cacheDirectory,
      'drupal/downloads',
    );
    fs.emptyDirSync(drupalCacheDirectory);
  }
}

async function getOptions(commandLineOptions) {
  const options = commandLineOptions || gatherFromCommandLine();

  applyDefaultOptions(options);
  applyEnvironmentOverrides(options);
  deriveHostUrl(options);
  fetchDrupalCache(options);
  checkDrupalConnectionOptions(options);
  await setUpFeatureFlags(options);
  clearDrupalCacheDirectory(options);

  // Setting verbosity for the whole content build process as global so we don't
  // have to pass the buildOptions around for just that.
  global.verbose = options.verbose;
  global.isPreviewServer = options.isPreviewServer;

  return options;
}

module.exports = getOptions;
