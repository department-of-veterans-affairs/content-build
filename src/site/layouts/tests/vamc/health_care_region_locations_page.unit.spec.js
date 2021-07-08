import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath =
  'src/site/layouts/health_care_region_locations_page.drupal.liquid';

describe('health_care_region_locations_page', () => {
  const data = parseFixture(
    'src/site/layouts/tests/vamc/fixtures/health_care_region_page.json',
  );

  let container;

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('should sort health clinics correctly', async () => {
    const expected = [
      'Pittsburgh VA Medical Center-University Drive',
      'H. John Heinz III Department of Veterans Affairs Medical Center',
      'Beaver County VA Clinic',
      'Belmont County VA Clinic',
      'Fayette County VA Clinic',
      'Washington County VA Clinic',
      'Westmoreland County VA Clinic',
      'AAA Mobile Clinic',
      'ZZZ Mobile Clinic',
    ];
    const actual = Array.from(container.querySelectorAll('h3 > a')).map(
      a => a.text,
    );
    expect(actual).to.deep.equal(expected);
  });

  it('should render main phone number', async () => {
    expect(container.querySelector('.main-phone a').textContent).to.equal(
      data.mainFacilities.entities[0].fieldPhoneNumber,
    );
  });
});
