// Node modules.
import { beforeEach } from 'mocha';
import { expect } from 'chai';
// Relative imports.
import axeCheck from '~/site/tests/support/axe';
import { parseFixture, renderHTML } from '~/site/tests/support';

// Derive the layout path.
const layoutPath = 'src/site/blocks/alert.drupal.liquid';

describe('blocks/alert.drupal.liquid', () => {
  let container;
  const data = parseFixture(
    'src/site/blocks/tests/alert/fixtures/alert-data.json',
  );

  beforeEach(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('has a h2 header for the alert', () => {
    const title = container.querySelector('h2');
    expect(title.innerHTML.trim()).to.equal(data.alert.fieldAlertTitle);
  });

  it('has the correct alert type class', () => {
    const alert = container.querySelector('.usa-alert');
    const alertType =
      data.alert.fieldAlertType === 'information'
        ? 'info'
        : data.alert.fieldAlertTitle;

    expect(alert.classList.contains(`usa-alert-${alertType}`)).to.be.true;
  });
});
