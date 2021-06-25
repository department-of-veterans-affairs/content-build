const { normal } = require('../../../../platform/testing/e2e/timeouts');
const xml = require('fast-xml-parser');
const fetch = require("sync-fetch");

const options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : true,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    // arrayMode: false, //"strict"
    // attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
    // tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
    stopNodes: ["parse-me-as-string"]
};

const data = fetch(`http://localhost:3002/sitemap.xml`).text();
const lol = xml.parse(data, options).urlset.url;

describe('Accessibility tests', () => {
//   for (const abc of lol) {
    it(`${lol[0].loc}`, () => {
      cy.visit(lol[0].loc).injectAxe();
      cy.get('body').should('be.visible', { timeout: normal });
      cy.axeCheck();
    });
//   }
});
