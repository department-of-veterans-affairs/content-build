import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const _ = require('lodash');

const layoutPath = 'src/site/layouts/health_care_region_page.drupal.liquid';

describe('intro', () => {
  let container;
  const data = parseFixture(
    'src/site/layouts/tests/vamc/fixtures/health_care_region_page.json',
  );

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('renders elements with expected values', () => {
    expect(container.querySelector('h1').innerHTML).to.equal(data.title);
    expect(container.querySelector('i.icon-large.white.hub-icon-foo')).to.equal(
      null,
    );
  });

  // Test return if the fieldPhoneNumber string is empty
  it('should not render .main-phone if string is empty', async () => {
    const testDataEmptyPhone = {
      ...data,
      mainFacilities: {
        ...data.mainFacilities,
        entities: [
          {
            ...data.mainFacilities.entities[0],
            fieldPhoneNumber: '',
          },
        ],
      },
    };

    container = await renderHTML(
      layoutPath,
      testDataEmptyPhone,
      'fieldPhoneNumberEmpty',
    );

    // Element should not render in the DOM
    expect(container.querySelector('.main-phone')).to.be.null;
  });

  // Test return if the fieldPhoneNumber is null
  it('should not render .main-phone if null', async () => {
    const testDataNullPhone = {
      ...data,
      mainFacilities: {
        ...data.mainFacilities,
        entities: [
          {
            ...data.mainFacilities.entities[0],
            fieldPhoneNumber: null,
          },
        ],
      },
    };

    container = await renderHTML(
      layoutPath,
      testDataNullPhone,
      'fieldPhoneNumberNull',
    );

    // Element should not render in the DOM
    expect(container.querySelector('.main-phone')).to.be.null;
  });

  it('displays a max of 2 featured stories if there are 2 or more featured stories', () => {
    expect(container.getElementsByClassName('featured-story').length).to.equal(
      2,
    );
  });

  it('displays 1 featured story if there is only 1', async () => {
    const clonedData = _.cloneDeep(data);

    clonedData.newsStoryTeasersFeatured.entities[0].reverseFieldListingNode.entities.splice(
      1,
      2,
    );

    const newContainer = await renderHTML(layoutPath, clonedData);
    expect(
      newContainer.getElementsByClassName('featured-story').length,
    ).to.equal(1);
  });
});
