/* eslint-disable no-param-reassign, no-continue, no-console */
const path = require('path');
const appRegistry = require('../../../../applications/registry.json');

function createReactPages(files, drupalData = { data: {} }, done) {
  const {
    data: {
      alerts: alertsItem = {},
      banners,
      bannerAlerts: bannerAlertsItem = {},
    },
  } = drupalData;
  const alertItems = { alert: alertsItem };

  appRegistry.forEach(({ entryName, appName, rootUrl, template }) => {
    const trimmedUrl = path.join('.', rootUrl);
    const filePath = path.join(trimmedUrl, 'index.html');
    if (!files[filePath]) {
      if (global.verbose) {
        console.log(
          `Generating HTML template for application ${appName} at ${rootUrl}`,
        );
      }
      files[filePath] = {
        title: appName,
        entryname: entryName,
        isDrupalPage: true,
        debug: null,
        path: trimmedUrl,
        layout: 'page-react.html',
        contents: Buffer.from('\n<!-- Generated from manifest.json -->\n'),
        entityUrl: { path: `/${trimmedUrl}` },
        alertItems,
        ...{ bannerAlert: bannerAlertsItem },
        ...{ banners },
        ...template,
      };
    }
  });

  done?.();
}

module.exports = createReactPages;
