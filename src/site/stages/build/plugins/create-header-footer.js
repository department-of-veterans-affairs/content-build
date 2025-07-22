const jsesc = require('jsesc');

const hardCodedFooterData = require('../../../../platform/static-data/footer-links.json');

const {
  convertLinkToRelative,
  formatLink,
  relativeLinkHosts,
  formatHeaderData: convertDrupalHeaderData,
} = require('../drupal/menus');

const formatColumn = (data, columnId, hostUrl) => {
  return data?.links?.map((link, linkIndex) => {
    return {
      column: columnId,
      href: formatLink(link?.url?.path, hostUrl),
      order: linkIndex + 1,
      target: null,
      title: link?.label,
    };
  });
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

    // Transform hardCodedFooterData hrefs to relative if needed
    let transformedHardCodedFooterData = hardCodedFooterData;
    if (relativeLinkHosts.includes(hostUrl)) {
      transformedHardCodedFooterData = hardCodedFooterData.map(item => {
        // Only transform if href starts with https://www.va.gov
        if (item.href && item.href.startsWith(relativeLinkHosts[0])) {
          return {
            ...item,
            href: convertLinkToRelative(item.href),
          };
        }
        return item;
      });
    }
    const footerData = [
      ...bottomRailFooterData,
      ...footerColumnsData,
      ...transformedHardCodedFooterData,
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
