const jsesc = require('jsesc');

const hardCodedFooterData = require('../../../../platform/static-data/footer-links.json');

const {
  convertLinkToAbsolute,
  formatHeaderData: convertDrupalHeaderData,
} = require('../drupal/menus');

const formatLink = (link, linkIndex, columnId, hostUrl) => {
  return {
    column: columnId,
    href: convertLinkToAbsolute(hostUrl, link?.url?.path),
    order: linkIndex + 1,
    target: null,
    title: link?.label,
  };
};

const formatColumn = (data, columnId, hostUrl) => {
  return data?.links?.map((link, linkIndex) =>
    formatLink(link, linkIndex, columnId, hostUrl),
  );
};

const formatFooterColumns = (data, hostUrl) => {
  return data?.links?.reduce?.(
    (acc, column, columnIndex) => [
      ...acc,
      ...formatColumn(column, columnIndex + 1, hostUrl),
    ],
    [],
  );
};

function createHeaderFooterData(buildOptions) {
  return (files, metalsmith, done) => {
    const { hostUrl } = buildOptions;

    const megaMenuData = convertDrupalHeaderData(
      buildOptions,
      buildOptions.drupalData,
    );

    const bottomRailFooterData =
      formatColumn(
        buildOptions.drupalData.data.vaGovFooterBottomRailQuery,
        'bottom_rail',
        hostUrl,
      ) || [];

    const footerColumnsData =
      formatFooterColumns(
        buildOptions.drupalData.data.vaGovFooterQuery,
        hostUrl,
      ) || [];

    const footerData = [
      ...bottomRailFooterData,
      ...footerColumnsData,
      ...hardCodedFooterData,
    ];

    const headerFooter = {
      footerData,
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

module.exports = {
  createHeaderFooterData,
  formatColumn,
  formatFooterColumns,
};
