/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { getAllByRole, getByText } from '@testing-library/dom';
import { parseFixture, renderHTML } from '../../../tests/support';

describe('template: homepage hero', () => {
  const fixtureForPromo = parseFixture(
    'src/site/includes/tests/hero/hero-fixtures-1.json',
  );

  const fixtureForFallback = parseFixture(
    'src/site/includes/tests/hero/hero-fixtures-2.json',
  );

  it('should correctly render the hero when the promo information is provided', async () => {
    const heroHTML = await renderHTML(
      'src/site/includes/hero.drupal.liquid',
      fixtureForPromo,
    );

    expect(getByText(heroHTML, 'Welcome to VA.gov')).to.exist;
    expect(getByText(heroHTML, 'The PACT Act and your VA benefits')).to.exist;
    expect(
      getByText(
        heroHTML,
        'This new law expands and extends eligibility for care and benefits for Veterans and survivors related to toxic exposures.',
      ),
    ).to.exist;
  });

  it('should correctly render the fallback hero when the promo information is not provided', async () => {
    const heroHTML = await renderHTML(
      'src/site/includes/hero.drupal.liquid',
      fixtureForFallback,
    );

    expect(getByText(heroHTML, 'Welcome to VA.gov')).to.exist;
    expect(
      getByText(heroHTML, 'Access and manage your VA benefits and health care'),
    ).to.exist;
    expect(getAllByRole(heroHTML, 'img').length).to.eq(3);
  });
});
