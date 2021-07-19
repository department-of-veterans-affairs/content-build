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
});
