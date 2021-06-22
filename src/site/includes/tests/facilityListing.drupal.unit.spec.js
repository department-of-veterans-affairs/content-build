import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/includes/facilityListing.drupal.liquid';

describe('Facility Listing', () => {
  let container;
  const data = parseFixture(
    'src/site/includes/tests/fixtures/facilityListingData.json',
  );

  describe('Main', () => {
    before(async () => {
      container = await renderHTML(layoutPath, data.main);
    });

    it('renders title link as h3', async () => {
      expect(container.querySelector('h3 > a').innerHTML).to.equal(
        'Cheyenne VA Medical Center',
      );
    });

    it('renders an address', async () => {
      expect(container.querySelector('address')).to.exist;
    });

    it('renders a Directions link', async () => {
      expect(
        container.querySelector('directions > a').innerHTML.trim(),
      ).to.equal('Directions');
    });

    it('renders a phone link', async () => {
      expect(container.querySelector('.main-phone > a').href).to.equal(
        'tel:307-778-7550',
      );
      expect(container.querySelector('.main-phone > a').innerHTML).to.equal(
        '307-778-7550',
      );
    });

    it('renders an image', async () => {
      expect(container.querySelector('img')).to.exist;
    });
  });

  describe('Mobile', () => {
    before(async () => {
      container = await renderHTML(layoutPath, data.mobile);
    });

    it('renders title link as h3', async () => {
      expect(container.querySelector('h3 > a').innerHTML).to.equal(
        'Cheyenne VA Mobile Clinic',
      );
    });

    it('does NOT render an address', async () => {
      expect(container.querySelector('address')).not.to.exist;
    });

    it('does NOT render a Directions link', async () => {
      expect(container.querySelector('directions')).not.to.exist;
    });

    it('renders a phone link', async () => {
      expect(container.querySelector('.main-phone > a').href).to.equal(
        'tel:307-778-7550 x3816',
      );
      expect(container.querySelector('.main-phone > a').innerHTML).to.equal(
        '307-778-7550 x3816',
      );
    });

    it('does NOT render an image', async () => {
      expect(container.querySelector('img')).not.to.exist;
    });
  });
});
