/* eslint-disable no-console */

require('isomorphic-fetch');
const Raven = require('raven');
const commandLineArgs = require('command-line-args');
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const proxy = require('express-http-proxy');

const createPipeline = require('../src/site/stages/preview');

const {
  compilePage,
  createFileObj,
} = require('../src/site/stages/build/drupal/page');
const ENVIRONMENTS = require('../src/site/constants/environments');
const HOSTNAMES = require('../src/site/constants/hostnames');
const DRUPALS = require('../src/site/constants/drupals');
const createMetalSmithSymlink = require('../src/site/stages/build/plugins/create-symlink');

const defaultBuildtype = ENVIRONMENTS.LOCALHOST;
const defaultHost = HOSTNAMES[defaultBuildtype];
const defaultContentDir = '../../../../../vagov-content/pages';

const COMMAND_LINE_OPTIONS_DEFINITIONS = [
  {
    name: 'buildtype',
    type: String,
    defaultValue: process.env.PREVIEW_BUILD_TYPE || defaultBuildtype,
  },
  { name: 'buildpath', type: String, defaultValue: null },
  { name: 'host', type: String, defaultValue: defaultHost },
  { name: 'port', type: Number, defaultValue: process.env.PORT || 3002 },
  { name: 'entry', type: String, defaultValue: null },
  { name: 'protocol', type: String, defaultValue: 'http' },
  { name: 'destination', type: String, defaultValue: null },
  { name: 'content-directory', type: String, defaultValue: defaultContentDir },
  { name: 'accessibility', type: Boolean, defaultValue: true },
  { name: 'lint-plain-language', type: Boolean, defaultValue: false },
  { name: 'omitdebug', type: Boolean, defaultValue: false },
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
];

global.cmsFeatureFlags = {};

if (process.env.SENTRY_DSN) {
  Raven.config(process.env.SENTRY_DSN).install();
}

const options = commandLineArgs(COMMAND_LINE_OPTIONS_DEFINITIONS);

if (options.buildpath === null) {
  options.buildpath = `build/${options.buildtype}`;
}

// Create symlink to 'vets-website/generated' if one doesn't exist
// so we don't have to run the content build
if (
  options.buildtype === ENVIRONMENTS.LOCALHOST &&
  !fs.existsSync(`${options.buildpath}/generated`)
) {
  options['apps-directory-name'] = 'vets-website';
  createMetalSmithSymlink(options);
}

const app = express();

const urls = {
  [ENVIRONMENTS.LOCALHOST]: 'http://localhost:3002',
  [ENVIRONMENTS.VAGOVDEV]:
    'http://dev.va.gov.s3-website-us-gov-west-1.amazonaws.com',
  [ENVIRONMENTS.VAGOVSTAGING]:
    'http://staging.va.gov.s3-website-us-gov-west-1.amazonaws.com',
  [ENVIRONMENTS.VAGOVPROD]:
    'http://www.va.gov.s3-website-us-gov-west-1.amazonaws.com',
};

const nonNodeContent = {
  fileName: path.join(
    __dirname,
    '../src/site/layouts/tests/fixtures/nonNodeContent.fixture.json',
  ),
  content: null,
  isRefreshing: false,
  refreshProgress: 0,

  initializeFromCache() {
    if (fs.existsSync(this.fileName)) {
      console.log(`Non-node content initializing from ${this.fileName}`);
      this.content = fs.readJSONSync(this.fileName);
    } else {
      console.log(
        `Non-node content not found in local cache at ${this.fileName}...`,
      );
    }
  },
};

/**
 * Make the query params case-insensitive.
 */
app.use((req, res, next) => {
  // eslint-disable-next-line fp/no-proxy
  req.query = new Proxy(req.query, {
    get: (target, name) =>
      target[
        Object.keys(target).find(
          key => key.toLowerCase() === name.toLowerCase(),
        )
      ],
  });

  next();
});

// eslint-disable-next-line no-unused-vars
app.get('/error', (_req, _res) => {
  throw new Error('fake error');
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.get('/preview', async (req, res, next) => {
  try {
    const entity = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          `../src/site/layouts/tests/fixtures/layout_data/${req.query.template}.fixture.json`,
        ),
      ),
    );
    const [drupalData, fileManifest] = [
      {
        data: {
          nodes: {
            entities: [entity],
          },
        },
      },
      {},
    ];

    const smith = await createPipeline({
      ...options,
      drupalData,
      isPreviewServer: true,
      port: process.env.PORT || 3002,
    });

    if (drupalData.errors) {
      throw new Error(
        `Drupal errors: ${JSON.stringify(drupalData.errors, null, 2)}`,
      );
    }

    if (!drupalData.data.nodes.entities.length) {
      res.sendStatus(404);
      return;
    }

    Object.assign(drupalData.data, nonNodeContent.content.data);

    const drupalPage = drupalData.data.nodes.entities[0];
    const drupalPath = `${req.path.substring(1)}/index.html`;

    const compiledPage = compilePage(drupalPage, drupalData);

    // This forces the locations_listing preview pages to use the same template
    // as the full build.
    if (compiledPage.entityBundle === 'locations_listing') {
      compiledPage.entityBundle = 'health_care_region_locations_page';
      compiledPage.mainFacilities =
        compiledPage?.fieldOffice?.entity?.mainFacilities;
      compiledPage.otherFacilities =
        compiledPage?.fieldOffice?.entity?.otherFacilities;
      compiledPage.mobileFacilities =
        compiledPage?.fieldOffice?.entity?.mobileFacilities;
      compiledPage.fieldOtherVaLocations =
        compiledPage?.fieldOffice?.entity?.fieldOtherVaLocations;
    }

    const fullPage = createFileObj(
      compiledPage,
      `${compiledPage.entityBundle}.drupal.liquid`,
    );

    const drupalAddressUrl = DRUPALS.PUBLIC_URLS[options['drupal-address']];
    const drupalSite = drupalAddressUrl || 'prod.cms.va.gov';

    const files = {
      'generated/file-manifest.json': {
        path: 'generated/file-manifest.json',
        contents: Buffer.from(JSON.stringify(fileManifest)),
      },
      [drupalPath]: {
        ...fullPage,
        isPreview: true,
        drupalSite,
      },
    };

    smith.run(files, (err, newFiles) => {
      if (err) {
        next(err);
      } else {
        res.set('Content-Type', 'text/html');
        res.send(newFiles[drupalPath].contents);
      }
    });
  } catch (err) {
    next(err);
  }
});

if (options.buildtype !== ENVIRONMENTS.LOCALHOST) {
  app.use(proxy(urls[options.buildtype]));
} else {
  app.use(express.static(path.join(__dirname, '..', options.buildpath)));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.send(`
    <p>We're sorry, something went wrong when trying to preview that page.</p>
    <p>Error id: ${res.sentry}</p>
    <pre>${options.buildtype !== ENVIRONMENTS.VAGOVPROD ? err : ''}</pre>
  `);
});

async function start() {
  // Attempt to read non-node content from cache...
  nonNodeContent.initializeFromCache();

  app.listen(options.port, () => {
    console.log(
      `Content template render server running on port ${options.port}`,
    );
  });
}

start();
