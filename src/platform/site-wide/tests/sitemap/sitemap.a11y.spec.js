const { normal } = require('../../../testing/e2e/timeouts');
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
};

const step = Number(Cypress.env('STEP'));
const data = fetch(
  `http://localhost:${Cypress.env('CONTENT_BUILD_PORT')}/sitemap.xml`,
).text();
const urls = xml
  .parse(data, options)
  .urlset.url.map(url => url.loc)
  .sort();
const divider = Math.ceil(urls.length / 32);
const splitURLs = urls.slice((step - 1) * divider, step * divider);

describe(`Accessibility tests batch ${step} of 32`, () => {
  for (const url of splitURLs) {
    // eslint-disable-next-line no-loop-func
    it(`${url}`, () => {
      const localURL = url.replace(
        `https://www.va.gov`,
        `http://localhost:${Cypress.env('CONTENT_BUILD_PORT')}`,
      );
      cy.visit(localURL);
      cy.get('body').should('be.visible', { timeout: normal });
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000);
      cy.injectAxe().axeCheck({
        exclude: [
          ['.loading-indicator'],
          ['div[data-widget-type="facility-map"]'],
        ],
      });
    });
  }
});
