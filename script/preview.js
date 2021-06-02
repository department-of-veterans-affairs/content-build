/* eslint-disable no-console */

require('isomorphic-fetch');
const Raven = require('raven');
const commandLineArgs = require('command-line-args');
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const proxy = require('express-http-proxy');
const jsesc = require('jsesc');

const {
  nonNodeQueries,
} = require('../src/site/stages/build/drupal/individual-queries');
const createPipeline = require('../src/site/stages/preview');

const getDrupalClient = require('../src/site/stages/build/drupal/api');
const {
  compilePage,
  createFileObj,
} = require('../src/site/stages/build/drupal/page');
const ENVIRONMENTS = require('../src/site/constants/environments');
const HOSTNAMES = require('../src/site/constants/hostnames');
const DRUPALS = require('../src/site/constants/drupals');
const bucketsContent = require('../src/site/constants/buckets-content');
const singlePageDiff = require('./preview-routes/single-page-diff');

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

const cacheDir = path.join(
  __dirname,
  '../.cache',
  options.buildtype,
  'preview-server',
);

const app = express();
const drupalClient = getDrupalClient(options);

const urls = {
  [ENVIRONMENTS.LOCALHOST]: 'http://localhost:3002',
  [ENVIRONMENTS.VAGOVDEV]:
    'http://dev.va.gov.s3-website-us-gov-west-1.amazonaws.com',
  [ENVIRONMENTS.VAGOVSTAGING]:
    'http://staging.va.gov.s3-website-us-gov-west-1.amazonaws.com',
  [ENVIRONMENTS.VAGOVPROD]:
    'http://www.va.gov.s3-website-us-gov-west-1.amazonaws.com',
};

const getContentUrl = env => {
  return env === 'localhost'
    ? 'http://localhost:3002'
    : bucketsContent[options.buildtype];
};

if (process.env.SENTRY_DSN) {
  app.use(Raven.requestHandler());
}

const nonNodeContent = {
  fileName: path.join(cacheDir, 'nonNodeContent.json'),
  content: null,
  isRefreshing: false,
  refreshProgress: 0,

  async refresh() {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;

    console.log(
      'Refreshing the non-node content (e.g. sidebars and other menus)...',
    );

    if (this.content) {
      console.log('(This process will happen in the background)');
    } else {
      console.log(
        'This will take a few minutes but will be cached into file storage once done.',
      );
    }

    const freshNonNodeContent = { data: {} };
    const queries = Object.entries(nonNodeQueries());

    this.refreshProgress = 0;

    console.time('Node-node queries');
    for (const [queryName, query] of queries) {
      console.time(queryName);

      // eslint-disable-next-line no-await-in-loop
      const json = await drupalClient.query({ query });
      Object.assign(freshNonNodeContent.data, json.data);
      console.timeEnd(queryName);

      this.refreshProgress += 1 / queries.length;
    }
    console.timeEnd('Node-node queries');

    this.content = freshNonNodeContent;
    this.saveIntoCache();
    this.isRefreshing = false;
  },

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

  saveIntoCache() {
    console.log(`Caching non-node content into ${this.fileName}...`);
    fs.ensureFileSync(this.fileName);
    fs.writeJSONSync(this.fileName, this.content);
    console.log('Done!');
  },
};

function fetchAllPageData(nodeId) {
  console.time(`Node ${nodeId}`);
  const nodeQuery = drupalClient.getLatestPageById(nodeId).then(response => {
    console.timeEnd(`Node ${nodeId}`);
    return response;
  });

  const requests = [
    nodeQuery,
    fetch(`${urls[options.buildtype]}/generated/file-manifest.json`).then(
      resp => {
        if (resp.ok) {
          return resp.json();
        }
        throw new Error(
          `HTTP error when fetching manifest: ${resp.status} ${resp.statusText}`,
        );
      },
    ),
    fetch(
      `${getContentUrl(options.buildtype)}/generated/headerFooter.json`,
    ).then(resp => {
      if (resp.ok) {
        return resp.json();
      }
      throw new Error(
        `HTTP error when fetching header/footer data: ${resp.status} ${resp.statusText}`,
      );
    }),
  ];

  return Promise.all(requests);
}

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
    if (!nonNodeContent.content) {
      const percent = Number(nonNodeContent.refreshProgress * 100).toFixed(2);
      res
        .set('Retry-After', 30)
        .status(503)
        .send(
          `Please hold while the preview server is starting - ${percent}%`,
        );
      return;
    }

    const smith = await createPipeline({
      ...options,
      isPreviewServer: true,
      port: process.env.PORT || 3002,
    });

    const [drupalData, fileManifest, headerFooterData] = await fetchAllPageData(
      req.query.nodeId,
    );

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

    if (!drupalPage.entityBundle) {
      if (process.env.SENTRY_DSN) {
        Raven.captureMessage('Preview attempted on page that is not ready');
      }

      res.send(`
        <p>This page isn't ready to be previewed yet.
          This may mean development is still in progress or that there's an issue with the preview server.
          Make sure the query for this page has been added to src/site/stages/build/drupal/graphql/GetLatestPageById.graphql.js.
        </p>
      `);
      return;
    }

    const compiledPage = compilePage(drupalPage, drupalData);
    const fullPage = createFileObj(
      compiledPage,
      `${compiledPage.entityBundle}.drupal.liquid`,
    );

    const headerFooterDataSerialized = jsesc(JSON.stringify(headerFooterData), {
      json: true,
      isScriptContext: true,
    });

    const files = {
      'generated/file-manifest.json': {
        path: 'generated/file-manifest.json',
        contents: Buffer.from(JSON.stringify(fileManifest)),
      },
      [drupalPath]: {
        ...fullPage,
        isPreview: true,
        headerFooterData: headerFooterDataSerialized,
        drupalSite:
          DRUPALS.PUBLIC_URLS[options['drupal-address']] ||
          options['drupal-address'],
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

app.get(
  '/diff',
  singlePageDiff(nonNodeContent, options, fetchAllPageData, getContentUrl),
);

if (options.buildtype !== ENVIRONMENTS.LOCALHOST) {
  app.use(proxy(urls[options.buildtype]));
} else {
  app.use(express.static(path.join(__dirname, '..', options.buildpath)));
}

if (process.env.SENTRY_DSN) {
  app.use(Raven.errorHandler());
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

  // If there wasn't any non-node content in cache, fetch it
  // from the CMS...
  if (!nonNodeContent.content) {
    nonNodeContent.refresh();
  }

  // Refresh the non-node data every 10 minutes...
  const fifteenMinutes = 15 * 60 * 1000;
  setInterval(() => nonNodeContent.refresh(), fifteenMinutes);

  app.listen(options.port, () => {
    console.log(`Content preview server running on port ${options.port}`);
  });
}

start();
