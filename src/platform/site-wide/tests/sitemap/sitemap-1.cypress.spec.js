const { normal } = require('../../../../platform/testing/e2e/timeouts');
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

const data = fetch(`http://localhost:3002/sitemap.xml`).text();
const urls = xml.parse(data, options).urlset.url;

describe('Accessibility tests', () => {
  for (const url of urls) {
    // eslint-disable-next-line no-loop-func
    it(`${url.loc}`, () => {
      cy.visit(url.loc).injectAxe();
      cy.get('body').should('be.visible', { timeout: normal });
      cy.axeCheck();
    });
  }
});
