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
const urls = xml.parse(data, options).urlset.url.sort();
const divider = Math.ceil(urls.length / 4);
const splitURLs = urls.slice(0, divider);

describe(`${urls[0].loc}`, () => {
  //   for (const url of splitURLs) {
  // eslint-disable-next-line no-loop-func
  it('test', () => {
    const testString = urls[0].loc.replace(
      'https://www.va.gov',
      'http://localhost:3002',
    );
    cy.visit(testString).injectAxe();
    cy.get('body').should('be.visible', { timeout: normal });
    cy.axeCheck();
  });
  //   }
});
