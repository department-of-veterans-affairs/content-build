import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/landing_page.drupal.liquid';

describe('intro', () => {
  describe('no fieldTitleIcon', () => {
    let container;
    const data = parseFixture(
      'src/site/layouts/tests/landing_page/fixtures/landing_page.json',
    );

    before(async () => {
      container = await renderHTML(layoutPath, data);
    });

    it('reports no axe violations', async () => {
      const violations = await axeCheck(container);
      expect(violations.length).to.equal(0);
    });

    it('renders elements with expected values', async () => {
      expect(container.querySelector('h1').innerHTML).to.equal(data.title);
      expect(container.querySelector('.va-introtext p').innerHTML).to.equal(
        data.fieldIntroText,
      );
      expect(
        container.querySelector('i.icon-large.white.hub-icon-foo'),
      ).to.equal(null);
    });
  });

  describe('with fieldTitleIcon', () => {
    let container;
    const data = parseFixture(
      'src/site/layouts/tests/landing_page/fixtures/landing_page_with_icon.json',
    );

    before(async () => {
      container = await renderHTML(layoutPath, data);
    });

    it('reports no axe violations', async () => {
      const violations = await axeCheck(container);
      expect(violations.length).to.equal(0);
    });

    it('renders fieldTitleIcon', async () => {
      expect(container.querySelector('h1').innerHTML).to.equal(data.title);
      expect(container.querySelector('.va-introtext p').innerHTML).to.equal(
        data.fieldIntroText,
      );
      expect(
        container.querySelector('i.icon-large.white.hub-icon-foo'),
      ).not.to.equal(null);
    });
  });

  describe('metadata', () => {
    let container;
    const data = parseFixture(
      'src/site/layouts/tests/landing_page/fixtures/landing_page_with_icon.json',
    );

    before(async () => {
      container = await renderHTML(layoutPath, data);
    });

    it('has the correct URLs for the "canonical" field', async () => {
      const canonical = container
        .querySelector('link[rel="canonical"]')
        .getAttribute('href');
      expect(canonical).to.equal('https://dev.va.gov/records/');
    });

    it('has the correct URLs for the "og:url" field', async () => {
      const ogUrl = container
        .querySelector('meta[property="og:url"]')
        .getAttribute('content');
      expect(ogUrl).to.equal('https://dev.va.gov/records/');
    });
  });

  describe('fieldSupportServices links', () => {
    let container;
    const data = parseFixture(
      'src/site/layouts/tests/landing_page/fixtures/landing_page.json',
    );

    it('creates a link for a properly formatted fieldSupportService', async () => {
      container = await renderHTML(layoutPath, {
        ...data,
        fieldSupportServices: data.fieldSupportServices.slice(0, 1),
      });

      const supportLink = container.querySelector(
        '.va-nav-linkslist-list a[href="tel+13128675309"]',
      );

      expect(supportLink.text.trim().replace(/\W{2,}/g, ' ')).to.equal(
        'Jenny 312-867-5309',
      );
    });

    it('creates a link for a TTY 711 fieldSupportService', async () => {
      container = await renderHTML(layoutPath, {
        ...data,
        fieldSupportServices: data.fieldSupportServices.slice(1, 2),
      });

      const supportLink = container.querySelector(
        '.va-nav-linkslist-list a[href="tel:+1711"]',
      );

      expect(supportLink.text.trim().replace(/\W{2,}/g, ' ')).to.equal(
        'TTY 711',
      );
      expect(supportLink.getAttribute('aria-label')).to.equal('TTY: 7 1 1.');
    });

    it('creates a link for a fieldSupportService with a url or filedPhoneNumber', async () => {
      container = await renderHTML(layoutPath, {
        ...data,
        fieldSupportServices: data.fieldSupportServices.slice(2),
      });

      const supportLink = container.querySelectorAll(
        '.va-nav-linkslist-list li',
      )[1];

      expect(supportLink.innerHTML.trim().replace(/\W{2,}/g, ' ')).to.equal(
        'Missing link',
      );
    });
  });
});
