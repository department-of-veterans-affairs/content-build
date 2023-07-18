const jsesc = require('jsesc');

const hardCodedFooterData = require('../../../../platform/static-data/footer-links.json');

const {
  formatHeaderData: convertDrupalHeaderData,
} = require('../drupal/menus');

const formatLink = (link, linkIndex, columnId) => {
  return {
    column: columnId,
    href: link?.url?.path,
    order: linkIndex + 1,
    target: null,
    title: link?.description,
  };
};

const formatColumn = (data, columnId) => {
  return data?.links?.map((link, linkIndex) =>
    formatLink(link, linkIndex, columnId),
  );
};

const formatFooterColumns = data => {
  return data?.links?.reduce?.(
    (acc, column, columnIndex) => [
      ...acc,
      ...formatColumn(column, columnIndex + 1),
    ],
    [],
  );
};

function createHeaderFooterData(buildOptions) {
  return (files, metalsmith, done) => {
    const megaMenuData = convertDrupalHeaderData(
      buildOptions,
      buildOptions.drupalData,
    );

    const bottomRailFooterData =
      formatColumn(
        buildOptions.drupalData.data.vaGovFooterBottomRailQuery,
        'bottom_rail',
      ) || [];
    const footerColumnsData =
      formatFooterColumns(buildOptions.drupalData.data.vaGovFooterQuery) || [];

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
