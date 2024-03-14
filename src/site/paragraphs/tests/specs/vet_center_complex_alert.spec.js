/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { getByTestId } from '@testing-library/dom';
import { parseFixture, renderHTML } from '../../../tests/support';

describe('Vet Center Complex Alert', () => {
  const fixtureForAlert = parseFixture(
    'src/site/paragraphs/tests/fixtures/vet_center_complex_alert.json',
  );

  it('should render complex alert paragraph', async () => {
    const AlertParagraph = await renderHTML(
      'src/site/paragraphs/alert.drupal.liquid',
      fixtureForAlert,
    );
    const Alert = getByTestId(AlertParagraph, 'alert-135322');
    expect(Alert).to.exist;
  });
});
