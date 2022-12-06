/* eslint-disable no-param-reassign */
const fs = require('fs-extra');
const { ENABLED_ENVIRONMENTS } = require('../../../../constants/drupals');
const getApiClient = require('../api');
const { logDrupal } = require('../utilities-drupal');
const { DATA_FILE_PATH, DATA_FILES } = require('./config');
const {
  // shouldPullDrupal,
  PULL_DRUPAL_BUILD_ARG,
  getDrupalCachePath,
} = require('../metalsmith-drupal');

const DRUPAL_CACHE_STATIC_DATA_FILEPATH = 'drupal/static-data-files';
const DRUPAL_CACHE_CONFIG_FILENAME = 'config.json';

const isQueryTypeGraphQL = ({ queryType }) =>
  queryType === 'graphql' || queryType === undefined; // if undefined, default to graphql

const writeProcessedDataFileToBuild = (
  files,
  filenameWithPath,
  description,
  from,
  data,
) => {
  files[filenameWithPath] = {
    contents: Buffer.from(JSON.stringify(data, null, 2)),
  };
  logDrupal(
    `${
      description ? `${description}: ` : ''
    }Writing static data file from ${from} to ${filenameWithPath}`,
  );
};

const writeProcessedDataFilesToBuild = (
  files,
  outputDataFilepath,
  processedJsonDataFiles,
) => {
  processedJsonDataFiles.forEach(
    ({ description, filename, error, from, data }) => {
      const filenameWithPath = `${outputDataFilepath}/${filename}`;

      if (error !== undefined) {
        logDrupal(
          `${
            description ? `${description}: ` : ''
          }ERROR Generating static data file from ${from} -- ${error}`,
        );
        return;
      }

      writeProcessedDataFileToBuild(
        files,
        filenameWithPath,
        description,
        from,
        data,
      );
    },
  );
};

const writeProcessedDataFileToCache = async (path, filename, data) => {
  const filenameWithPath = `${path}/${filename}`;
  fs.outputJSON(filenameWithPath, data, {
    spaces: 2,
  });
};

const writeProcessedDataFilesToCache = (
  buildOptions,
  cacheFilepath,
  cacheConfigFilename,
  processedDataFiles,
) => {
  const fullCacheFilepath = getDrupalCachePath(buildOptions, cacheFilepath);
  fs.rmSync(fullCacheFilepath, { recursive: true, force: true });

  const successfulDataFiles = processedDataFiles.filter(
    ({ error }) => error === undefined,
  );

  if (successfulDataFiles.length === 0) {
    return;
  }

  const configCacheFilenameWithPath = `${fullCacheFilepath}/${cacheConfigFilename}`;
  fs.outputJSON(
    configCacheFilenameWithPath,
    successfulDataFiles.map(({ description, filename }) => ({
      description,
      filename,
    })),
    {
      spaces: 2,
    },
  );

  successfulDataFiles.forEach(({ filename, data }) => {
    writeProcessedDataFileToCache(fullCacheFilepath, filename, data);
  });
};

const processGraphQLDataFile = async (
  graphQLApiClient,
  onlyPublishedContent,
  dataFile,
) => {
  const { description, filename, query, postProcess } = dataFile;

  const baseResult = {
    description,
    filename,
    from: 'Drupal',
  };

  if (!filename) {
    return Promise.resolve({
      ...baseResult,
      error: 'A filename must be provided.',
    });
  }

  return graphQLApiClient
    .query({
      query,
      variables: {
        onlyPublishedContent,
      },
    })
    .then(json => {
      if (json.error) {
        return {
          ...baseResult,
          error: json.error,
        };
      }

      return {
        ...baseResult,
        data: postProcess ? postProcess(json) : json,
      };
    })
    .catch(error => {
      return {
        ...baseResult,
        error,
      };
    });
};

const pullGraphQLDataFileContentFromDrupal = async (
  dataFiles,
  buildOptions,
  onlyPublishedContent,
) => {
  const graphQLDataFiles = DATA_FILES.filter(isQueryTypeGraphQL);
  const graphQLApiClient = getApiClient(buildOptions);
  return Promise.all(
    graphQLDataFiles.map(dataFile =>
      processGraphQLDataFile(graphQLApiClient, onlyPublishedContent, dataFile),
    ),
  );
};

const pullDataFileContentFromDrupal = async (
  dataFiles,
  buildOptions,
  onlyPublishedContent,
) => {
  // Currently, only supports GraphQL. In future, possibly JSON:API
  return pullGraphQLDataFileContentFromDrupal(
    dataFiles,
    buildOptions,
    onlyPublishedContent,
  );
};

const readProcessedDataFileFromCache = async (path, filename) => {
  const filenameWithPath = `${path}/${filename}`;
  return fs.readJSON(filenameWithPath);
};

const processCachedDataFile = async (path, dataFile) => {
  const { filename, description } = dataFile;
  const baseResult = {
    description,
    filename,
    from: 'cache',
  };

  let data;
  try {
    data = await readProcessedDataFileFromCache(path, filename);
    return {
      ...baseResult,
      data,
    };
  } catch (error) {
    return {
      ...baseResult,
      error: `Error reading from cache -- ${error}`,
    };
  }
};

const pullDataFileContentFromCache = async (
  buildOptions,
  cacheFilepath,
  cacheConfigFilename,
) => {
  const fullCacheFilepath = getDrupalCachePath(buildOptions, cacheFilepath);

  const cacheConfigFilepath = `${fullCacheFilepath}/${cacheConfigFilename}`;
  let cacheConfig;
  try {
    cacheConfig = await fs.readJSON(cacheConfigFilepath);
    if (!Array.isArray(cacheConfig)) {
      throw new Error();
    }
  } catch (err) {
    logDrupal('Error reading static-data-file cache config.');
    logDrupal('Static data files cannot be generated.');
    return Promise.resolve([]);
  }

  return Promise.all(
    cacheConfig.map(dataFile =>
      processCachedDataFile(fullCacheFilepath, dataFile),
    ),
  );
};

/**
 * Generates static data files defined at ../config.js
 *
 * Pulls these previously generated files from cache unless:
 *  --pull-drupal is used
 *  Cache cannot be found
 */
const generateStaticDataFilesFromDrupal = async (
  files,
  buildOptions,
  onlyPublishedContent = true,
) => {
  if (!ENABLED_ENVIRONMENTS.has(buildOptions.buildtype)) {
    logDrupal(
      `Drupal integration disabled for buildtype ${buildOptions.buildtype}`,
    );
    return;
  }

  let processedJsonDataFiles = [];

  // Pull static-data-file content from Drupal

  // Until this is merged to prod and a build is run, the cache directory will not be present.
  // We cannot use `shouldPullDrupal` - which checks for the existence of the cache directory - until it exists.
  // So, we'll implement this change in two phases:
  //  1. First, we'll push a change that pulls from Drupal only with an explicit `--pull-drupal`.
  //     When this is merged and a build is run, the resulting files will be saved in the newly created cache directory.
  //  2. After the cache is created, we'll change the check to `shouldPullDrupal`, which considers the existence of
  //     the cache directory in determing whether to pull from Drupal or read from cache.

  // if (shouldPullDrupal(buildOptions, DRUPAL_CACHE_STATIC_DATA_FILEPATH)) {
  if (buildOptions[PULL_DRUPAL_BUILD_ARG]) {
    logDrupal(
      `Generating static data files from Drupal at ${buildOptions['drupal-address']}.`,
    );

    if (!Array.isArray(DATA_FILES)) {
      logDrupal(
        'Malformed static-data-file configuration at src/site/stages/build/drupal/static-data-files/config.js.',
      );
      logDrupal('Static data files cannot be generated.');
      return;
    }

    if (DATA_FILES.length === 0) {
      logDrupal('No static data files configured for Drupal.');
      logDrupal('Static data files cannot be generated.');
      return;
    }

    processedJsonDataFiles = await pullDataFileContentFromDrupal(
      DATA_FILES,
      buildOptions,
      onlyPublishedContent,
    );

    writeProcessedDataFilesToCache(
      buildOptions,
      DRUPAL_CACHE_STATIC_DATA_FILEPATH,
      DRUPAL_CACHE_CONFIG_FILENAME,
      processedJsonDataFiles,
    );
  }

  // Read static-data-file content from cache
  else {
    logDrupal('Generating static data files from cache.');
    logDrupal(`To pull latest, run with "--${PULL_DRUPAL_BUILD_ARG}" flag.`);

    processedJsonDataFiles = await pullDataFileContentFromCache(
      buildOptions,
      DRUPAL_CACHE_STATIC_DATA_FILEPATH,
      DRUPAL_CACHE_CONFIG_FILENAME,
    );
  }

  // Write processed data files to build output
  writeProcessedDataFilesToBuild(files, DATA_FILE_PATH, processedJsonDataFiles);
};

module.exports = generateStaticDataFilesFromDrupal;
