const { normal, slow } = require('../../../../platform/testing/e2e/timeouts');
const xml = require('fast-xml-parser');
const fetch = require('sync-fetch');

const options = {
  attributeNamePrefix: '@_',
  attrNodeName: 'attr',
  textNodeName: '#text',
  ignoreAttributes: true,
  ignoreNameSpace: true,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: '__cdata',
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  stopNodes: ['parse-me-as-string'],
};

const data = fetch(
  `http://localhost:${Cypress.env('CONTENT_BUILD_PORT')}/sitemap.xml`,
).text();
const urls = xml
  .parse(data, options)
  .urlset.url.map(url => url.loc)
  .sort();
const divider = Math.ceil(urls.length / 8);
const splitURLs = urls.slice(2 * divider, 3 * divider);

describe(`Accessibility tests`, () => {
  for (const url of splitURLs) {
    // eslint-disable-next-line no-loop-func
    it(`${url}`, () => {
      const localURL = url.replace(
        `https://www.va.gov`,
        `http://localhost:${Cypress.env('CONTENT_BUILD_PORT')}`,
      );
      cy.visit(localURL).injectAxe();
      cy.get('body')
        .should('be.visible', { timeout: normal })
        .then($body => {
          if ($body.find('div[data-widget-type="facility-map"]').length) {
            cy.get('a#generated-mapbox-image-link').should('be.visible', {
              timeout: slow,
            });
            cy.axeCheck({
              exclude: ['.loading-indicator'],
            });
          } else {
            cy.log('Page has no map');
            cy.axeCheck({
              exclude: ['.loading-indicator'],
            });
          }
        });
    });
  }
});
