import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/locations_listing.drupal.liquid';

describe('locations_listing', () => {
  const data = parseFixture(
    'src/site/layouts/tests/vamc/fixtures/locations_listing.json',
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

  it('should render main phone numbers', () => {
    expect(
      Array.from(container.querySelectorAll('.main-phone a')).map(
        link => link.textContent,
      ),
    ).to.deep.equal([
      '866-482-7488',
      '412-360-6000',
      '724-709-6005',
      '740-695-9321',
      '724-439-4990',
      '724-250-7790',
      '724-216-0317',
      '724-250-7790',
      '724-709-6005',
    ]);
  });
});
