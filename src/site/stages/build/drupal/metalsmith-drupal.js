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

const LOVELL_TITLE_STRING = 'Lovell Federal';

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

// Pages that should be cloned have the value of 347
function isLovellTricarePage(page) {
  return (
    page?.fieldAdministration?.entity?.entityId === '347' ||
    page?.fieldAdministration?.entity?.entityId === '1039'
  );
}

function isLovellVaPage(page) {
  return (
    page?.fieldAdministration?.entity?.entityId === '347' ||
    page?.fieldAdministration?.entity?.entityId === '1040'
  );
}

function getLovellClonePageIndexes(drupalData) {
  return drupalData.data.nodeQuery.entities.map((page, index) => {
    if (
      page?.fieldAdministration?.entity?.entityId === '347' ||
      page?.fieldAdministration?.entity?.entityId === '1039' ||
      page?.fieldAdministration?.entity?.entityId === '1040'
    ) {
      return index;
    }
    return false;
  });
}

function lovellPageModify(page, variant) {
  const fieldOfficeMod = variant === 'tricare' ? 'Tricare' : 'VA';

  // Modify the path
  page.entityUrl.path = page.entityUrl.path.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${variant}-health-care`,
  );

  // Modify the title used for querying the menus
  if (page.fieldOffice) {
    page.fieldOffice.entity.entityLabel = page.fieldOffice.entity.entityLabel.replace(
      LOVELL_TITLE_STRING,
      `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
    );
  }
  if (page.fieldRegionPage) {
    page.fieldRegionPage.entity.title = page.fieldRegionPage.entity.title.replace(
      LOVELL_TITLE_STRING,
      `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
    );
  }

  // Modify the title this will become more complex to handle specific cases
  page.title = page.title.replace(
    LOVELL_TITLE_STRING,
    `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
  );

  return page;
}

function cloneLovellPages(lovellClonePages, variant) {
  // Deep clone with lodash
  const clonedPages = cloneDeep(lovellClonePages);

  // Modify the clones
  return clonedPages.map(page => {
    page = lovellPageModify(page, variant);
    return page;
  });
}

function getLovellClonePages(drupalData) {
  // Get lovell 'clone' pages
  const lovellTricareClonePages = drupalData.data.nodeQuery.entities.filter(
    isLovellTricarePage,
  );
  const lovellVaClonePages = drupalData.data.nodeQuery.entities.filter(
    isLovellVaPage,
  );

  // Deep clone the lovell pages to create va pages
  const vaClones = cloneLovellPages(lovellVaClonePages, 'va');

  // Deep clone the lovell pages to create tricare pages
  const tricareClones = cloneLovellPages(lovellTricareClonePages, 'tricare');

  return [...vaClones, ...tricareClones];
}

function lovellMenusModifyLinks(links, variation) {
  const titleVar = variation === 'va' ? 'VA' : 'Tricare';
  const linkVar = variation === 'va' ? 'va' : 'tricare';

  links.forEach(link => {
    // Modify labels and links
    link.label = link.label.replace(
      LOVELL_TITLE_STRING,
      `${LOVELL_TITLE_STRING} ${titleVar}`,
    );

    link.url.path = link.url.path.replace(
      '/lovell-federal-health-care',
      `/lovell-federal-${linkVar}-health-care`,
    );

    // Use recursion to modify nested links
    if (link && link.links.length > 0) {
      // Remove the links that don't belong in either the va or tricare menus
      link.links = link.links.filter(menuItem => {
        if (
          menuItem.entity.fieldMenuSection === 'va' &&
          variation === 'tricare'
        ) {
          return false;
        }
        if (
          menuItem.entity.fieldMenuSection === 'tricare' &&
          variation === 'va'
        ) {
          return false;
        }
        return true;
      });
      lovellMenusModifyLinks(link.links, variation);
    }
  });
}

function getLovellCloneMenus(drupalData, lovellMenuKey) {
  // Clone the original menu
  const lovellTricareMenu = cloneDeep(drupalData.data[lovellMenuKey]);
  const lovellVaMenu = cloneDeep(drupalData.data[lovellMenuKey]);

  // Rename the name so our new cloned pages can find the cloned menus
  lovellTricareMenu.name = lovellTricareMenu.name.replace(
    LOVELL_TITLE_STRING,
    `${LOVELL_TITLE_STRING} Tricare`,
  );
  lovellVaMenu.name = lovellVaMenu.name.replace(
    LOVELL_TITLE_STRING,
    `${LOVELL_TITLE_STRING} VA`,
  );

  // Mutate menu labels and paths of the cloned menus
  lovellMenusModifyLinks(lovellTricareMenu.links, 'tricare');
  lovellMenusModifyLinks(lovellVaMenu.links, 'va');

  // create a key for the new menus
  const lovellTricareMenuKey = camelize(
    `va${lovellTricareMenu.name}FacilitySidebarQuery`,
  );
  const lovellVaMenuKey = camelize(
    `va${lovellVaMenu.name}FacilitySidebarQuery`,
  );

  // Add the cloned menus to the drupal data
  return {
    [lovellTricareMenuKey]: lovellTricareMenu,
    [lovellVaMenuKey]: lovellVaMenu,
  };
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

      // clone and modify pages for Lovell
      const lovellClonePageIndexes = getLovellClonePageIndexes(drupalData);
      drupalData.data.nodeQuery.entities = [
        ...drupalData.data.nodeQuery.entities,
        ...getLovellClonePages(drupalData),
      ];
      // Delete original pages for lovell
      lovellClonePageIndexes.forEach(index => {
        delete drupalData.data.nodeQuery.entities[index];
      });

      // clone and modify menus for Lovell
      const lovellMenuKey = 'lovellFederalHealthCareFacilitySidebarQuery';
      drupalData.data = {
        ...drupalData.data,
        ...getLovellCloneMenus(drupalData, lovellMenuKey),
      };
      // Remove the original menu
      delete drupalData.data[lovellMenuKey];

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
