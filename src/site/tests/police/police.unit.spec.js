/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { getByText } from '@testing-library/dom';
import { parseFixture, renderHTML } from '../support';

describe('layout: VAMC System | VA Police', () => {
  const fixtureForPolice = parseFixture(
    'src/site/layouts/tests/vamc/fixtures/policeMockData.json',
  );

  it('should correctly render layout', async () => {
    const policeHTML = await renderHTML(
      'src/site/layouts/vamc_system_va_police.drupal.liquid',
      fixtureForPolice,
    );

    expect(
      getByText(
        policeHTML,
        'VA police officers help make VA medical centers and other VA health facilities safe for Veterans and their family members.',
      ),
    ).to.exist;
    expect(getByText(policeHTML, 'How to contact us')).to.exist;
    expect(getByText(policeHTML, 'How to request a VA police report')).to.exist;
    expect(
      getByText(policeHTML, 'Other questions you may have about VA police'),
    ).to.exist;
  });
});
