import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

import cloneDeep from '~/platform/utilities/data/cloneDeep';

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

    it('renders image section', async () => {
      expect(container.querySelector('section-image')).to.exist;
    });
  });

  describe('Bad images', () => {
    it('does not render image section if alt tag is missing', async () => {
      const missingAltImageData = cloneDeep(data.main);
      missingAltImageData.entity.fieldMedia.entity.image.alt = '';

      container = await renderHTML(layoutPath, missingAltImageData);
      expect(container.querySelector('section-image')).not.to.exist;
    });

    it('does not render image section if url is missing', async () => {
      const missingUrlImageData = cloneDeep(data.main);
      missingUrlImageData.entity.fieldMedia.entity.image.derivative.url = '';

      container = await renderHTML(layoutPath, missingUrlImageData);
      expect(container.querySelector('section-image')).not.to.exist;
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
