import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/includes/metatags.drupal.liquid';

describe('Metatags', () => {
  let container;
  const metatagsData = parseFixture(
    'src/site/includes/tests/fixtures/metatags.json',
  );

  describe('title', () => {
    before(async () => {
      container = await renderHTML(layoutPath, metatagsData.titleTest);
    });

    it('returns metatag - [title] | Veterans Affairs - when there is only title', () => {
      expect(
        container
          .querySelector("meta[property='og:title']")
          .getAttribute('content'),
      ).to.equal('Title Test | Veterans Affairs');
    });

    it('renders title-tag - [title] | Veterans Affairs - when there is only title', () => {
      expect(container.querySelector('title').innerHTML).to.equal(
        'Title Test | Veterans Affairs',
      );
    });
  });

  describe('entityLabel', () => {
    before(async () => {
      container = await renderHTML(layoutPath, metatagsData.entityLabelTest);
    });

    it('renders metatag - [entityLabel] | Veterans Affairs', () => {
      expect(
        container
          .querySelector("meta[property='og:title']")
          .getAttribute('content'),
      ).to.equal('Entity Label Test | Veterans Affairs');
    });

    it('renders title-tag - [entityLabel] | Veterans Affairs', () => {
      expect(container.querySelector('title').innerHTML).to.equal(
        'Entity Label Test | Veterans Affairs',
      );
    });
  });

  describe('fieldOffice', () => {
    before(async () => {
      container = await renderHTML(layoutPath, metatagsData.fieldOfficeTest);
    });

    it('renders metatag - [fieldOffice] | Veterans Affairs', () => {
      expect(
        container
          .querySelector("meta[property='og:title']")
          .getAttribute('content'),
      ).to.equal('Field Office Test | Veterans Affairs');
    });

    it('renders title-tag - [fieldOffice] | Veterans Affairs', () => {
      expect(container.querySelector('title').innerHTML).to.equal(
        'Field Office Test | Veterans Affairs',
      );
    });
  });

  describe('regionOrOffice', () => {
    before(async () => {
      container = await renderHTML(layoutPath, metatagsData.regionOrOfficeTest);
    });

    it('renders metatag - [title] | [regionOrOffice] | Veterans Affairs', () => {
      expect(
        container
          .querySelector("meta[property='og:title']")
          .getAttribute('content'),
      ).to.equal('Title Test | Region Or Office | Veterans Affairs');
    });

    it('renders title-tag - [title] | [regionOrOffice] | Veterans Affairs', () => {
      expect(container.querySelector('title').innerHTML).to.equal(
        'Title Test | Region Or Office | Veterans Affairs',
      );
    });
  });

  describe('legacy metatags.liquid', () => {
    it('returns metatag - [og:site_name] | Veterans Affairs', async () => {
      container = await renderHTML(layoutPath, {});

      expect(
        container
          .querySelector("meta[property='og:site_name']")
          .getAttribute('content'),
      ).to.equal('Veterans Affairs');
    });

    it('returns metatag - [DC.Date] | {date} when lastupdate is included', async () => {
      container = await renderHTML(layoutPath, {
        lastupdate: 'January 01, 2021',
      });

      expect(
        container.querySelector("meta[name='DC.Date']").getAttribute('content'),
      ).to.equal('2021-01-01');
    });

    it('returns metatag - [DC.Date] | {date} when changed is included', async () => {
      container = await renderHTML(layoutPath, {
        changed: '1612094400',
      });

      expect(
        container.querySelector("meta[name='DC.Date']").getAttribute('content'),
      ).to.equal('2021-01-31');
    });

    it('returns metatag - [og:url] | {host}{path} when entityUrl.path is included', async () => {
      container = await renderHTML(layoutPath, {
        entityUrl: {
          path: '/test-url',
        },
      });

      expect(
        container
          .querySelector("meta[property='og:url']")
          .getAttribute('content'),
      ).to.equal('https://dev.va.gov/test-url/');
    });

    it('returns metatag - [og:url] | {host}/{path} when entityUrl.path is not included', async () => {
      container = await renderHTML(layoutPath, {
        path: 'example-url',
      });

      expect(
        container
          .querySelector("meta[property='og:url']")
          .getAttribute('content'),
      ).to.equal('https://dev.va.gov/example-url');
    });

    it('returns metatag - [twitter:title] | MetaTitle | Veterans Affairs when title is included', async () => {
      container = await renderHTML(layoutPath, {
        title: 'metaTitle',
      });

      expect(
        container
          .querySelector("meta[name='twitter:title']")
          .getAttribute('content'),
      ).to.equal('MetaTitle | Veterans Affairs');
    });

    it('returns metatag - [twitter:title] | {host} when title is not included', async () => {
      container = await renderHTML(layoutPath, {});

      expect(
        container
          .querySelector("meta[name='twitter:title']")
          .getAttribute('content'),
      ).to.equal('https://dev.va.gov');
    });

    it('returns metatag - [keywords] | veterans when keywords is provided', async () => {
      container = await renderHTML(layoutPath, {
        keywords: 'veterans',
      });

      expect(
        container
          .querySelector("meta[name='keywords']")
          .getAttribute('content'),
      ).to.equal('veterans');
    });

    it('returns title VA.gov when title == "HOME', async () => {
      container = await renderHTML(layoutPath, {
        title: 'Home',
      });

      expect(container.querySelector('title').text).to.equal('VA.gov');
    });

    it('returns title {metaTitle} when title != "HOME', async () => {
      container = await renderHTML(layoutPath, {
        title: 'Search',
      });

      expect(container.querySelector('title').text).to.equal(
        'Search | Veterans Affairs',
      );
    });
  });

  describe('tags', () => {
    it('includes meta tags for each item in tags when provided', async () => {
      container = await renderHTML(layoutPath, {
        tags: ['foo'],
      });

      expect(
        container
          .querySelector("meta[property='article:tag']")
          .getAttribute('content'),
      ).to.equal('foo');
    });
  });
});
