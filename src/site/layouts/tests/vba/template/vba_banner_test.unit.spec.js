/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { getByTestId } from '@testing-library/dom';
import { parseFixture, renderHTML } from '../../../../tests/support';

describe('include: VBA banner tests', () => {
  it('should correctly render dismissible info banner', async () => {
    const fixtureForVBAInfo = parseFixture(
      'src/site/layouts/tests/vba/template/fixtures/vba_banner_informational_dismissible.json',
    );

    const vbaHTML = await renderHTML(
      'src/site/includes/vba_facilities/banner.liquid',
      fixtureForVBAInfo,
    );
    const foundBanner = getByTestId(vbaHTML, 'vba-banner');
    expect(foundBanner).to.exist;
    expect(foundBanner).to.have.attribute('type', 'info');
    expect(foundBanner).to.have.attribute('show-close');
  });
  it('should correctly render dismissible warning banner', async () => {
    const fixtureForVBAWarning = parseFixture(
      'src/site/layouts/tests/vba/template/fixtures/vba_banner_warning_dismissible.json',
    );

    const vbaHTML = await renderHTML(
      'src/site/includes/vba_facilities/banner.liquid',
      fixtureForVBAWarning,
    );
    const foundBanner = getByTestId(vbaHTML, 'vba-banner');
    expect(foundBanner).to.exist;
    expect(foundBanner).to.have.attribute('type', 'warning');
    expect(foundBanner).to.have.attribute('show-close');
  });
  it('should correctly render non-dismissible warning banner', async () => {
    const fixtureForVBAWarning = parseFixture(
      'src/site/layouts/tests/vba/template/fixtures/vba_banner_warning.json',
    );

    const vbaHTML = await renderHTML(
      'src/site/includes/vba_facilities/banner.liquid',
      fixtureForVBAWarning,
    );
    const foundBanner = getByTestId(vbaHTML, 'vba-banner');
    expect(foundBanner).to.exist;
    expect(foundBanner).to.have.attribute('type', 'warning');
    expect(foundBanner).not.to.have.attribute('show-close');
  });
});
