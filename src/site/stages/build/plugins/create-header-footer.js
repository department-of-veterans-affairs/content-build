const jsesc = require('jsesc');

const {
  formatHeaderData: convertDrupalHeaderData,
} = require('../drupal/menus');

/**
 * Non-Drupal footer data. Used for:
 * Column 4 (In crisis? Talk to someone now)
 */
const hardCodedFooterData = require('../../../../platform/static-data/footer-links.json');

function createHeaderFooterData(buildOptions) {
  return (files, metalsmith, done) => {
    const megaMenuData = convertDrupalHeaderData(
      buildOptions,
      buildOptions.drupalData,
    );

    /**
     * Drupal footer data. Includes:
     * Column 1 (Veteran programs and services)
     * Column 2 (More VA resources)
     * Column 3 (Get VA updates)
     * Bottom rail (beginning with Accessibility)
     */
    const bottomRailFooterData =
      buildOptions.drupalData.data.vaGovFooterBottomRailQuery;
    const footerColumnsData = buildOptions.drupalData.data.vaGovFooterQuery;

    const headerFooter = {
      footerData: {
        bottomRailFooterData,
        footerColumnsData,
        hardCodedFooterData,
      },
      megaMenuData,
    };

    const stringified = JSON.stringify(headerFooter);

    metalsmith.metadata({
      headerFooterData: jsesc(stringified, {
        json: true,
        isScriptContext: true,
      }),
      ...metalsmith.metadata(),
    });

    // eslint-disable-next-line no-param-reassign
    files['generated/headerFooter.json'] = {
      contents: Buffer.from(stringified),
    };

    done();
  };
}

module.exports = createHeaderFooterData;
