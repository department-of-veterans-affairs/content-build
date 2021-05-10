const { expect } = require('chai');
const sinon = require('sinon');
const cheerio = require('cheerio');

const getBrokenLinks = require('../../helpers/getBrokenLinks');

const anchor = '<a href="/link">Testing</a>';
const img = '<img src="/another-link.png">';
const span = '<span>Not a link</span>';
const anchorWithoutHref = '<a>Link</a>';

const getFile = contents => ({ path: '/health-care', contents });
const getFileAndDom = tag => {
  const contents = `<div>${anchor}${tag}</div>`;
  const file = getFile(contents);
  const dom = cheerio.load(contents);
  return { file, dom };
};

describe('getBrokenLinks', () => {
  const detectAllLinksBroken = sinon.stub().returns(true);
  const detectAllLinksOkay = sinon.stub().returns(false);

  it('finds broken links', () => {
    const { file, dom } = getFileAndDom(img);
    const linkErrors = getBrokenLinks(file, dom, [], detectAllLinksBroken);
    expect(linkErrors).to.have.lengthOf(2);
  });

  it('does not detect non-links as a link', () => {
    const { file, dom } = getFileAndDom(span);
    const linkErrors = getBrokenLinks(file, dom, [], detectAllLinksBroken);
    expect(linkErrors).to.have.lengthOf(1);
    expect(linkErrors[0].html).to.be.equal(anchor);
  });

  it('does not detect valid links as broken', () => {
    const { file, dom } = getFileAndDom(img);
    const linkErrors = getBrokenLinks(file, dom, [], detectAllLinksOkay);
    expect(linkErrors).to.have.lengthOf(0);
  });

  it('skips anchors without an HREF attribute', () => {
    const { file, dom } = getFileAndDom(anchorWithoutHref);
    const linkErrors = getBrokenLinks(file, dom, [], detectAllLinksBroken);
    expect(linkErrors).to.have.lengthOf(1);
  });
});
