/* eslint-disable no-param-reassign, no-continue, no-console */
const fs = require('fs');
const path = require('path');
const appRegistry = require('../../../../applications/registry.json');

/**
 * Load skeleton HTML files from vets-website source
 * Uses skeleton property in registry.json entries
 * Returns object mapping entryName to skeleton HTML
 */
function loadSkeletons() {
  const skeletons = {};
  const vetsWebsiteAppsDir = path.join(
    __dirname,
    '../../../../../../vets-website/src/applications',
  );

  try {
    // Load skeletons for apps that have skeleton property in template
    for (const app of appRegistry) {
      if (app.template && app.template.skeleton) {
        const skeletonPath = path.join(
          vetsWebsiteAppsDir,
          app.template.skeleton,
        );

        if (fs.existsSync(skeletonPath)) {
          const html = fs.readFileSync(skeletonPath, 'utf8');
          skeletons[app.entryName] = { html };
        } else {
          console.warn(
            `[create-react-pages] Skeleton not found for ${app.entryName}: ${skeletonPath}`,
          );
        }
      }
    }

    console.log(
      `[create-react-pages] Loaded ${
        Object.keys(skeletons).length
      } skeleton(s) from vets-website`,
    );
  } catch (error) {
    console.warn(
      '[create-react-pages] Error loading skeletons from vets-website:',
      error.message,
    );
  }

  return skeletons;
}

function createReactPages(files, drupalData = { data: {} }, done) {
  const {
    data: {
      alerts: alertsItem = {},
      banners,
      bannerAlerts: bannerAlertsItem = {},
      promoBanners,
    },
  } = drupalData;
  const alertItems = { alert: alertsItem };

  // Load skeleton HTML files for hydration support
  const skeletons = loadSkeletons();

  appRegistry.forEach(
    ({
      entryName,
      appName,
      rootUrl,
      template,
      useLocalStylesAndComponents,
    }) => {
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
          shouldAddDebugInfo: true,
          useLocalStylesAndComponents: !!useLocalStylesAndComponents,
          debug: null,
          path: trimmedUrl,
          layout: 'page-react.html',
          contents: Buffer.from('\n<!-- Generated from manifest.json -->\n'),
          entityUrl: { path: `/${trimmedUrl}` },
          alertItems,
          ...{ bannerAlert: bannerAlertsItem },
          ...{ banners },
          ...{ promoBanners },
          ...template,
          // Add skeleton HTML if available for this app
          skeletonHTML: skeletons[entryName]?.html || '',
        };
      }
    },
  );

  done?.();
}

module.exports = createReactPages;
