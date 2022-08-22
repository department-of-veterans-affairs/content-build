/* eslint-disable no-param-reassign, no-continue, no-console */

const fs = require('fs-extra');
const path = require('path');
const recursiveRead = require('recursive-readdir');
const JSONStream = require('JSONStream');
const cloneDeep = require('lodash/cloneDeep');

const ENVIRONMENTS = require('../../../constants/environments');
const { ENABLED_ENVIRONMENTS } = require('../../../constants/drupals');
const { logDrupal: log } = require('./utilities-drupal');
const getApiClient = require('./api');
const convertDrupalFilesToLocal = require('./assets');
const { compilePage, createFileObj } = require('./page');
const {
  createHealthCareRegionListPages,
  createPastEventListPages,
  addGetUpdatesFields,
  addPager,
} = require('./health-care-region');
const createReactPages = require('../plugins/create-react-pages');

const { addHubIconField } = require('./benefit-hub');
const { addHomeContent } = require('./home');

const { camelize } = require('../../../utilities/stringHelpers');

const DRUPAL_CACHE_FILENAME = 'drupal/pages.json';
const DRUPAL_HUB_NAV_FILENAME = 'hubNavNames.json';

// If "--pull-drupal" is passed into the build args, then the build
// should pull the latest Drupal data.
const PULL_DRUPAL_BUILD_ARG = 'pull-drupal';

// If "--use-cached-assets" is passed into the build args, then the
// build should use the assets saved in cache instead of downloading new ones.
const USE_CACHED_ASSETS_BUILD_ARG = 'use-cached-assets';

const getDrupalCachePath = buildOptions => {
  return path.join(buildOptions.cacheDirectory, DRUPAL_CACHE_FILENAME);
};

// We need to pull the Drupal content if we have --pull-drupal, OR if
// the content is not available in the cache.
const shouldPullDrupal = buildOptions =>
  buildOptions[PULL_DRUPAL_BUILD_ARG] ||
  !fs.existsSync(getDrupalCachePath(buildOptions));

function pipeDrupalPagesIntoMetalsmith(contentData, files) {
  const pages = contentData.data.nodeQuery.entities.filter(
    e => e && Object.keys(e).length,
  );

  for (const page of pages) {
    const {
      entityUrl: { path: drupalUrl },
      entityBundle,
    } = page;

    const pageCompiled = compilePage(page, contentData);

    if (page.entityBundle === 'person_profile' && !pageCompiled) {
      continue;
    }

    const drupalPageDir = path.join('.', drupalUrl);
    const drupalFileName = path.join(drupalPageDir, 'index.html');

    switch (page.entityBundle) {
      case 'health_care_local_facility':
        addGetUpdatesFields(pageCompiled, pages);
        break;
      case 'health_care_region_detail_page':
      case 'vamc_system_policies_page':
      case 'vamc_system_billing_insurance':
      case 'vamc_system_register_for_care':
      case 'vamc_system_medical_records_offi':
        addGetUpdatesFields(pageCompiled, pages);
        break;
      case 'event_listing':
        pageCompiled.pastEventTeasers = pageCompiled.pastEvents;
        pageCompiled.allEventTeasers = pageCompiled.reverseFieldListingNode;
        addPager(
          pageCompiled,
          files,
          pageCompiled.allEventTeasers,
          'event_listing.drupal.liquid',
          'event',
        );
        break;
      case 'story_listing':
        pageCompiled.allNewsStoryTeasers = page.reverseFieldListingNode;
        addPager(
          pageCompiled,
          files,
          pageCompiled.allNewsStoryTeasers,
          'story_listing.drupal.liquid',
          'story',
        );
        break;
      case 'press_releases_listing':
        pageCompiled.allPressReleaseTeasers = page.reverseFieldListingNode;
        addPager(
          pageCompiled,
          files,
          pageCompiled.allPressReleaseTeasers,
          'press_releases_listing.drupal.liquid',
          'press_release',
        );
        break;
      case 'leadership_listing':
        pageCompiled.allStaffProfiles = page.fieldLeadership;
        addPager(
          pageCompiled,
          files,
          pageCompiled.allStaffProfiles,
          'leadership_listing.drupal.liquid',
          'bio',
        );
        break;
      case 'page':
        addHubIconField(pageCompiled, pages);
        break;
      default:
    }

    files[drupalFileName] = createFileObj(
      pageCompiled,
      `${entityBundle}.drupal.liquid`,
    );

    if (page.entityBundle === 'health_care_region_page') {
      createHealthCareRegionListPages(pageCompiled, drupalPageDir, files);
    }
    if (page.entityBundle === 'event_listing') {
      createPastEventListPages(pageCompiled, drupalPageDir, files);
    }
  }
}

/**
 * Read GraphQL cache file and return a promise containing cached queries.
 * Stream data to avoid V8's 500mb string length limit.
 *
 * @param {String} cacheFilePath - path of cache file to read
 * @return {Promise} - resolves with object containing cached query results
 */
function readGraphQLCacheFile(cacheFilePath) {
  return new Promise(resolve => {
    const stream = fs.createReadStream(cacheFilePath, { encoding: 'utf8' });
    const parser = JSONStream.parse('*').on('data', data => {
      resolve({ data });
    });
    stream.pipe(parser);
  });
}

/**
 * Save the provided GraphQL query results to a JSON cache file.
 * Stream page objects to avoid V8's 500mb string length limit.
 *
 * @param {String} cacheFilePath - path of cache file to create
 * @param {Object} graphQLData - object containing query results
 */
function writeGraphQLCacheFile(cacheFilePath, graphQLData) {
  const outputStream = fs.createWriteStream(cacheFilePath);
  outputStream.write('{\n  "data": {\n');

  const queries = Object.keys(graphQLData.data);
  queries.forEach((queryName, queryIndex) => {
    const props = graphQLData.data[queryName];
    outputStream.write(`"${queryName}": `);

    if (queryName === 'nodeQuery') {
      // For the pages query, write each page (entity) separately
      outputStream.write('{\n"entities": [\n');
      props.entities.forEach((entity, entityIndex) => {
        outputStream.write(JSON.stringify(entity, null, 2));
        if (entityIndex < props.entities.length - 1) outputStream.write(',');
        outputStream.write('\n');
      });
      outputStream.write(']\n},\n');
    } else {
      // The other queries are smaller, so write the whole query at once
      outputStream.write(JSON.stringify(props, null, 2));
      if (queryIndex < queries.length - 1) outputStream.write(',');
      outputStream.write('\n');
    }
  });

  outputStream.write('}\n}\n');
  outputStream.end();
}

/**
 * Uses Drupal content via a new GraphQL query or the cached result of a
 * previous query. This is where the cache is saved.
 *
 * @param {Object} buildOptions
 * @return {Object} - The result of the GraphQL query
 */
async function getContentViaGraphQL(buildOptions) {
  const contentApi = getApiClient(buildOptions);
  const drupalCache = getDrupalCachePath(buildOptions);
  const drupalHubMenuNames = path.join(
    buildOptions.paramsDirectory,
    DRUPAL_HUB_NAV_FILENAME,
  );

  let drupalPages = null;

  if (shouldPullDrupal(buildOptions)) {
    log(
      `Attempting to load Drupal content from API at ${contentApi.getSiteUri()}`,
    );

    const drupalTimer = `${contentApi.getSiteUri()} response time: `;

    console.time(drupalTimer);

    drupalPages = await contentApi.getAllPagesViaIndividualGraphQlQueries();

    console.timeEnd(drupalTimer);

    // Error handling
    if (drupalPages.errors && drupalPages.errors.length) {
      log(JSON.stringify(drupalPages.errors, null, 2));
      throw new Error('Drupal query returned with errors');
    }

    // Save new cache
    writeGraphQLCacheFile(drupalCache, drupalPages);

    if (drupalPages.data.allSideNavMachineNamesQuery) {
      fs.outputJsonSync(
        drupalHubMenuNames,
        drupalPages.data.allSideNavMachineNamesQuery,
        { spaces: 2 },
      );
    }
  } else {
    log('Attempting to load Drupal content from cache...');
    log(`To pull latest, run with "--${PULL_DRUPAL_BUILD_ARG}" flag.`);

    drupalPages = await readGraphQLCacheFile(drupalCache);
  }

  return drupalPages;
}

async function loadDrupal(buildOptions) {
  const drupalCache = getDrupalCachePath(buildOptions);

  if (!fs.existsSync(drupalCache)) {
    log(`Drupal content unavailable in local cache: ${drupalCache}`);
  } else {
    log(`Drupal content cache found: ${drupalCache}`);
  }

  const contentTimer = 'Total time to load content from GraphQL';

  console.time(contentTimer);

  const drupalPages = await getContentViaGraphQL(buildOptions);

  console.timeEnd(contentTimer);

  log('Drupal successfully loaded!');
  return drupalPages;
}

async function loadCachedDrupalFiles(buildOptions, files) {
  const cachedFilesPath = path.join(
    buildOptions.cacheDirectory,
    'drupal/downloads',
  );
  if (
    (!buildOptions[PULL_DRUPAL_BUILD_ARG] ||
      buildOptions[USE_CACHED_ASSETS_BUILD_ARG]) &&
    fs.existsSync(cachedFilesPath)
  ) {
    const cachedDrupalFiles = await recursiveRead(cachedFilesPath);
    cachedDrupalFiles.forEach(file => {
      const relativePath = path.relative(
        path.join(buildOptions.cacheDirectory, 'drupal/downloads'),
        file,
      );
      if (global.verbose) {
        log(`Loaded Drupal asset from cache: ${relativePath}`);
      }
      files[relativePath] = {
        path: relativePath,
        isDrupalAsset: true,
        // No need to store Drupal file contents when we can
        // directly store on disk and save memory
        contents: '',
      };

      // Copy Drupal file to build directory
      const buildOutputPath = path.join(
        'build',
        buildOptions.buildtype,
        relativePath,
      );
      fs.copySync(file, buildOutputPath);
    });
  }
}

function isLovellClonePage(page) {
  // Pages that should be cloned have the value of 347
  if (page.fieldAdministration) {
    return page.fieldAdministration.entity.entityId === '347';
  }
  return false;
}

function appendDrupalDataWithLovellTricarePages(drupalData, lovellClonePages) {
  // Deep clone with lodash
  const clonedPages = cloneDeep(lovellClonePages);

  // Modify the clones
  const modifiedLovellPages = clonedPages.map(page => {
    page.entityUrl.path = page.entityUrl.path.replace(
      '/lovell-federal-health-care',
      '/lovell-federal-tricare-health-care',
    );

    page.title = page.title.replace('Federal', 'Federal Tricare');

    //! !! Need to modify the value that is used to get the menu !!!
    if (page.fieldOffice) {
      page.fieldOffice.entity.entityLabel = page.fieldOffice.entity.entityLabel.replace(
        'Federal',
        'Federal Tricare',
      );
    }

    return page;
  });

  // Modify the original pages
  lovellClonePages.forEach(page => {
    page.entityUrl.path = page.entityUrl.path.replace(
      '/lovell-federal-health-care',
      '/lovell-federal-va-health-care',
    );

    page.title = page.title.replace('Federal', 'Federal VA');

    if (page.fieldOffice) {
      page.fieldOffice.entity.entityLabel = page.fieldOffice.entity.entityLabel.replace(
        'Federal',
        'Federal VA',
      );
    }
  });

  // Add the cloned pages to the drupal data
  drupalData.data.nodeQuery.entities.push(...modifiedLovellPages);

  return drupalData;
}

function lovellMenusReplacePaths(links, variation) {
  links.forEach(link => {
    // if link are not these return to next iteration
    // if (link.label === "NEWS AND EVENTS"){
    //   return;
    // }

    const titleVar = variation === 'va' ? 'VA' : 'Tricare';
    const linkVar = variation === 'va' ? 'va' : 'tricare';

    link.label = link.label.replace('Federal', `Federal ${titleVar}`);

    link.url.path = link.url.path.replace(
      '/lovell-federal-health-care',
      `/lovell-federal-${linkVar}-health-care`,
    );

    if (link.links.length > 0) {
      lovellMenusReplacePaths(link.links, variation);
    }
  });
}

function appendDrupalDataWithLovellTricareMenus(drupalData) {
  // Get the lovell menu
  const lovellMenu = 'lovellFederalHealthCareFacilitySidebarQuery';

  // Since all the menus are the same in the section I'm just cloning one for both new menus.
  const lovellTricareMenu = cloneDeep(drupalData.data[lovellMenu]);
  const lovellVaMenu = cloneDeep(drupalData.data[lovellMenu]);

  // Rename the name so our new clones can find the cloned menus
  lovellTricareMenu.name = lovellTricareMenu.name.replace(
    'Federal',
    'Federal Tricare',
  );
  lovellVaMenu.name = lovellVaMenu.name.replace('Federal', 'Federal VA');

  // Mutate menu labels and paths of the cloned menus
  lovellMenusReplacePaths(lovellTricareMenu.links, 'tricare');
  lovellMenusReplacePaths(lovellVaMenu.links, 'va');

  // create a key to store the new menus
  const lovellTricareMenuKey = camelize(
    `va${lovellTricareMenu.name}FacilitySidebarQuery`,
  );
  const lovellVaMenuKey = camelize(
    `va${lovellVaMenu.name}FacilitySidebarQuery`,
  );

  // Add the cloned menus to the drupal data
  drupalData.data = {
    ...drupalData.data,
    [lovellTricareMenuKey]: lovellTricareMenu,
    [lovellVaMenuKey]: lovellVaMenu,
  };

  return drupalData;
}

function getDrupalContent(buildOptions) {
  if (!ENABLED_ENVIRONMENTS.has(buildOptions.buildtype)) {
    log(`Drupal integration disabled for buildtype ${buildOptions.buildtype}`);
    return () => {};
  }

  return async (files, metalsmith, done) => {
    let drupalData = null;
    try {
      drupalData = await loadDrupal(buildOptions);
      drupalData = convertDrupalFilesToLocal(drupalData, files);

      await loadCachedDrupalFiles(buildOptions, files);

      // Get lovell 'clone' pages
      const lovellClonePages = drupalData.data.nodeQuery.entities.filter(
        isLovellClonePage,
      );

      // clone and modify pages
      drupalData = appendDrupalDataWithLovellTricarePages(
        drupalData,
        lovellClonePages,
      );

      // clone and modify menu
      drupalData = appendDrupalDataWithLovellTricareMenus(drupalData);

      pipeDrupalPagesIntoMetalsmith(drupalData, files);
      await createReactPages(files, drupalData);
      addHomeContent(drupalData, files, metalsmith, buildOptions);
      log('Successfully piped Drupal content into Metalsmith!');
      buildOptions.drupalData = drupalData;
      done();
    } catch (err) {
      if (err instanceof ReferenceError) throw err;

      buildOptions.drupalError = drupalData;
      log(err.stack);
      log('Failed to pipe Drupal content into Metalsmith!');
      if (
        buildOptions.buildtype !== ENVIRONMENTS.LOCALHOST ||
        buildOptions['drupal-fail-fast']
      ) {
        done(err);
      } else {
        done();
      }
    }
  };
}

module.exports = {
  getDrupalContent,
  pipeDrupalPagesIntoMetalsmith,
  shouldPullDrupal,
  PULL_DRUPAL_BUILD_ARG,
};
