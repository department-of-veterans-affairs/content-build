const Raven = require('raven');
const jsesc = require('jsesc');
const Diff2Html = require('diff2html');
const gitDiff = require('git-diff');

const createPipeline = require('../../src/site/stages/preview');

const {
  compilePage,
  createFileObj,
} = require('../../src/site/stages/build/drupal/page');

const DRUPALS = require('../../src/site/constants/drupals');

const convertDrupalFilesToLocal = require('../../src/site/stages/build/drupal/assets');
const updateAssetLinkElements = require('../../src/site/stages/prearchive/helpers');

async function calculateDiff(res, bucketPath, pagePath, updatedPage) {
  const currentPageReq = await fetch(bucketPath);
  const currentPage = await currentPageReq.text();
  const result = gitDiff(currentPage, updatedPage);
  const diffJson = Diff2Html.parse(
    `
diff --git ${pagePath}
index 0000001..0ddf2ba
--- ${pagePath}
+++ ${pagePath}
${result}
`,
  );

  const htmlDiff = Diff2Html.html(diffJson, { drawFileList: true });

  res.send(`
<!doctype html>
<html>
  <!-- https://www.npmjs.com/package/diff2html -->
  <!-- CSS -->
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css" />
  <!-- Javascripts -->
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html.min.js"></script>
  <body>
    ${htmlDiff}
  </body>
</html>
`);
}

// Uses currying to pass dependencies from the parent module
function singlePageDiff(
  nonNodeContent,
  options,
  fetchAllPageData,
  getContentUrl,
) {
  // Return an Express route
  return async (req, res, next) => {
    try {
      if (!nonNodeContent.content) {
        const percent = Number(nonNodeContent.refreshProgress * 100).toFixed(2);
        res
          .set('Retry-After', 30)
          .status(503)
          .send(`Please hold while the preview server is starting - ${percent}%`);
        return;
      }

      const buildOptions = {
        ...options,
        isPreviewServer: true,
        isSinglePagePublish: true,
        port: process.env.PORT || 3002,
      };

      const smith = await createPipeline(buildOptions);

      const [
        drupalData,
        fileManifest,
        headerFooterData,
      ] = await fetchAllPageData(req.query.nodeId);

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

      const drupalDataWithUpdatedAssetRefs = convertDrupalFilesToLocal(
        drupalData,
        [],
        buildOptions,
      );
      const drupalPage = drupalDataWithUpdatedAssetRefs.data.nodes.entities[0];
      const drupalPath = `${req.path.substring(1)}/index.html`;

      if (!drupalPage.entityBundle) {
        if (process.env.SENTRY_DSN) {
          Raven.captureMessage('Preview attempted on page that is not ready');
        }

        res.send(`
          <p>This page isn't ready to be previewed yet.
            This may mean development is still in progress or that there's an issue with the preview server.
          </p>
        `);
        return;
      }

      const compiledPage = compilePage(
        drupalPage,
        drupalDataWithUpdatedAssetRefs,
      );
      const fullPage = createFileObj(
        compiledPage,
        `${compiledPage.entityBundle}.drupal.liquid`,
      );

      const headerFooterDataSerialized = jsesc(
        JSON.stringify(headerFooterData),
        {
          json: true,
          isScriptContext: true,
        },
      );

      const files = {
        'generated/file-manifest.json': {
          path: 'generated/file-manifest.json',
          contents: Buffer.from(JSON.stringify(fileManifest)),
        },
        [drupalPath]: {
          ...fullPage,
          isPreview: false,
          isSinglePagePublish: true,
          headerFooterData: headerFooterDataSerialized,
          drupalSite:
            DRUPALS.PUBLIC_URLS[options['drupal-address']] ||
            options['drupal-address'],
        },
      };

      let updatedPage = await new Promise(resolve => {
        smith.run(files, (err, newFiles) => {
          if (err) {
            next(err);
          } else {
            resolve(newFiles[drupalPath].contents.toString());
          }
        });
      });

      const bucketDomain = getContentUrl(options.buildtype);

      updatedPage = updateAssetLinkElements(
        updatedPage,
        'script, img, link, picture > source',
        'va_files',
        bucketDomain,
      )
        .html()
        .toString();

      const pagePath = `${fullPage.entityUrl.path}/index.html`;
      const bucketPath = `${bucketDomain}${pagePath}`;

      calculateDiff(res, bucketPath, pagePath, updatedPage);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = singlePageDiff;
