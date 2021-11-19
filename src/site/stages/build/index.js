// Builds the site using Metalsmith as the top-level build runner.
/* eslint-disable no-console */
const chalk = require('chalk');
const assets = require('metalsmith-assets');
const collections = require('metalsmith-collections');
const dateInFilename = require('metalsmith-date-in-filename');
const filenames = require('metalsmith-filenames');
const inPlace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdownit');
const navigation = require('metalsmith-navigation');
const permalinks = require('metalsmith-permalinks');

const silverSmith = require('./silversmith');
const addDebugInfo = require('./add-debug-info');
const { runCommand } = require('./../../../../script/utils');
// const assetSources = require('../../constants/assetSources');

const registerLiquidFilters = require('../../filters/liquid');
const { getDrupalContent } = require('./drupal/metalsmith-drupal');
const addDrupalPrefix = require('./plugins/add-drupal-prefix');
const checkCollections = require('./plugins/check-collections');
const downloadAssets = require('./plugins/download-assets');
// const readAssetsFromDisk = require('./plugins/read-assets-from-disk');
const createDrupalDebugPage = require('./plugins/create-drupal-debug');
const createEnvironmentFilter = require('./plugins/create-environment-filter');
const createHeaderFooter = require('./plugins/create-header-footer');
const createOutreachAssetsData = require('./plugins/create-outreach-assets-data');
const createResourcesAndSupportWebsiteSection = require('./plugins/create-resources-and-support-section');
const createSitemaps = require('./plugins/create-sitemaps');
const createSymlink = require('./plugins/create-symlink');
const downloadDrupalAssets = require('./plugins/download-drupal-assets');
const getFilesToUpdate = require('./plugins/get-files-to-update');
const ignoreAssets = require('./plugins/ignore-assets');
const leftRailNavResetLevels = require('./plugins/left-rail-nav-reset-levels');
const modifyDom = require('./plugins/modify-dom');
const rewriteDrupalPages = require('./plugins/rewrite-drupal-pages');
const rewriteVaDomains = require('./plugins/rewrite-va-domains');
const updateRobots = require('./plugins/update-robots');

// Replace fs with graceful-fs to retry on EMFILE errors. Metalsmith can
// attempt to open too many files simultaneously, so we need to handle it.
const realFs = require('fs');
const gracefulFs = require('graceful-fs');

gracefulFs.gracefulify(realFs);

function build(BUILD_OPTIONS) {
  const smith = silverSmith();

  registerLiquidFilters();

  // Start manual garbage collection to limit large spikes in memory use.
  // This prevents running out of memory on CI.
  smith.startGarbageCollection();

  // Set up Metalsmith. BE CAREFUL if you change the order of the plugins. Read the comments and
  // add comments about any implicit dependencies you are introducing!!!
  //
  smith.source(`${BUILD_OPTIONS.contentPagesRoot}`);
  smith.destination(BUILD_OPTIONS.destination);

  // This lets us access the {{buildtype}} variable within liquid templates.
  smith.metadata({
    buildtype: BUILD_OPTIONS.buildtype,
    hostUrl: BUILD_OPTIONS.hostUrl,
    enabledFeatureFlags: BUILD_OPTIONS.cmsFeatureFlags,
    omitdebug: BUILD_OPTIONS.omitdebug,
  });

  if (global.rebuild) {
    smith.use(getFilesToUpdate(BUILD_OPTIONS), 'Get files for rebuild');
  }

  // If you're on localhost, you probably want to see CSS/JS reflected in the build,
  // so, this will set up a symlink into vets-website for you.
  if (
    BUILD_OPTIONS.buildtype === 'localhost' &&
    !BUILD_OPTIONS.nosymlink &&
    !global.rebuild
  ) {
    smith.use(
      createSymlink(BUILD_OPTIONS),
      'Create symlink into vets-website for local development.',
    );
  }

  smith.use(getDrupalContent(BUILD_OPTIONS), 'Get Drupal content');
  smith.use(addDrupalPrefix(BUILD_OPTIONS), 'Add Drupal Prefix');

  smith.use(
    createOutreachAssetsData(BUILD_OPTIONS),
    'Create Outreach Assets Data',
  );

  smith.use(
    createResourcesAndSupportWebsiteSection(BUILD_OPTIONS),
    'Create "Resources and support" section of the website',
  );

  smith.use(
    createEnvironmentFilter(BUILD_OPTIONS),
    'Create environment filter',
  );

  // This adds the filename into the "entry" that is passed to other plugins. Without this errors
  // during templating end up not showing which file they came from. Load it very early in in the
  // plugin chain.
  smith.use(filenames(), 'Add filenames for debugging');

  smith.use(checkCollections(BUILD_OPTIONS), 'Check collections');
  smith.use(collections(BUILD_OPTIONS.collections), 'Group collections');
  smith.use(leftRailNavResetLevels(), 'Reset left rail navigation menu levels');
  smith.use(dateInFilename(true), 'Add the date to filenames');
  smith.use(assets(BUILD_OPTIONS.appAssets), 'Add app assets');
  smith.use(assets(BUILD_OPTIONS.contentAssets), 'Add content assets');

  // smith.use(cspHash({ pattern: ['js/*.js', 'generated/*.css', 'generated/*.js'] }))

  // Liquid substitution must occur before markdown is run otherwise markdown will escape the
  // bits of liquid commands (eg., quotes) and break things.
  //
  // Unfortunately this must come before permalinks and navigation because of limitation in both
  // modules regarding what files they understand. The consequence here is that liquid templates
  // *within* a single file do NOT have access to the final path that they will be rendered under
  // or any other metadata added by the permalinks() and navigation() filters.
  //
  // Thus far this has not been a problem because the only references to such paths are in the
  // includes which are handled by the layout module. The layout module, luckily, can be run
  // near the end of the filter chain and therefore has access to all the metadata.
  //
  // If this becomes a barrier in the future, permalinks should be patched to understand
  // translating .md files which would allow inPlace() and markdown() to be moved under the
  // permalinks() and navigation() filters making the variable stores uniform between inPlace()
  // and layout().
  smith.use(
    inPlace({ engine: 'liquid', pattern: '*.{md,html}' }),
    'Plug the content into the templates',
  );
  smith.use(
    markdown({
      typographer: true,
      html: true,
    }),
    'Translate the markdown to html',
  );

  // Responsible for create permalink structure. Most commonly used change foo.md to foo/index.html.
  //
  // This must come before navigation module, otherwise breadcrumbs will see the wrong URLs.
  //
  // It also must come AFTER the markdown() module because it only recognizes .html files. See
  // comment above the inPlace() module for explanation of effects on the metadata().
  smith.use(
    permalinks({
      relative: false,
      linksets: [
        {
          match: { collection: 'posts' },
          pattern: ':date/:slug',
        },
      ],
    }),
    'Add permalinks and change foo.md to foo/index.html',
  );

  smith.use(createHeaderFooter(BUILD_OPTIONS), 'Create header and footer');

  smith.use(
    navigation({
      navConfigs: {
        sortByNameFirst: true,
        breadcrumbProperty: 'breadcrumb_path',
        pathProperty: 'nav_path',
        includeDirs: true,
      },
      navSettings: {},
    }),
    'Generate navigation',
  );

  // Split the layout step by letter. This avoids "too many open files" errors
  // caused by the layouts plugin opening too many templates in parallel.
  // Metalsmith's concurrency setting does not fix the issue.
  const letters = 'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .map(letter => letter.toUpperCase() + letter);
  const nonletters = `0-9.-_~!$&'()*+,;=:@`;
  const patterns = [...letters, nonletters];

  // Only apply layouts to markdown and html files.
  const suffix = '{md,html}';

  patterns.forEach(pattern => {
    smith.use(
      layouts({
        engine: 'liquid',
        directory: BUILD_OPTIONS.layouts,
        // At the top level, match filenames. Otherwise match the final
        // directory name since so many files are named index.html
        pattern: [`[${pattern}]*.${suffix}`, `**/[${pattern}]*/*.${suffix}`],
      }),
      `Apply layouts ${pattern.length === 2 ? pattern[0] : pattern}`,
    );
  });

  /*
   * This will replace links in static pages with a staging domain,
   * if it is in the list of domains to replace
   */
  smith.use(
    rewriteVaDomains(BUILD_OPTIONS),
    'Rewrite VA domains for the buildtype',
  );
  smith.use(rewriteDrupalPages(BUILD_OPTIONS), 'Rewrite Drupal pages');
  smith.use(createDrupalDebugPage(BUILD_OPTIONS), 'Create Drupal debug page');
  smith.use(downloadDrupalAssets(BUILD_OPTIONS), 'Download Drupal assets');
  smith.use(downloadAssets(BUILD_OPTIONS), 'Download application assets');
  smith.use(createSitemaps(BUILD_OPTIONS), 'Create sitemap');
  smith.use(updateRobots(BUILD_OPTIONS), 'Update robots.txt');

  smith.use(
    modifyDom(BUILD_OPTIONS),
    'Parse a virtual DOM from every .html file and perform a variety of DOM sub-operations on each file',
  );

  // Ignore Drupal and application assets when building pages, so they don't get overwritten.
  // We no longer need to build them now that they are stored directly on disk
  smith.use(ignoreAssets(), 'Ignore assets for build');

  smith.build(async (err, files) => {
    if (err) {
      smith.endGarbageCollection();
      throw err;
    }

    // If we're running a watch, let the engineer know important information
    if (BUILD_OPTIONS.watch) {
      runCommand(
        `yarn build:webpack --watch --env=buildtype=${BUILD_OPTIONS.buildtype}`,
      );

      // Avoid saving Metalsmith files object on rebuild to prevent overwriting the object
      if (!global.rebuild) global.metalsmithFiles = files;

      if (BUILD_OPTIONS.buildtype === 'localhost') {
        console.log(' ');
        console.log(
          chalk.green('--------------------------------------------'),
        );
        console.log(' ');
        console.log(
          chalk.green('Project is running at http://localhost:3002/'),
        );
      }
      console.log(
        chalk.green(
          `Metalsmith output is served from /build/${BUILD_OPTIONS.buildtype}`,
        ),
      );
      console.log(chalk.green('Metalsmith is watching the files...'));
    } else {
      // If this isn't a watch, just output the normal "end of build" information
      if (global.verbose) {
        smith.printSummary(BUILD_OPTIONS);
        smith.printPeakMemory();
      }

      runCommand(
        `yarn build:webpack --env=buildtype=${BUILD_OPTIONS.buildtype}`,
      );

      console.log('The Metalsmith build has completed.');
    }

    if (BUILD_OPTIONS.buildtype !== 'vagovprod' && !BUILD_OPTIONS.omitdebug) {
      // Add debug info to HTML files
      await addDebugInfo(files, BUILD_OPTIONS.buildtype);
    }

    smith.endGarbageCollection();
  }); // smith.build()
}

module.exports = build;
