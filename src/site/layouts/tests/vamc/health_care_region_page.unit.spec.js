import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

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
    expect(container.querySelector('p').innerHTML).to.equal(
      'An official website of the United States government',
    );
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
});
