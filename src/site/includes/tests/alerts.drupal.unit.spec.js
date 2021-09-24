import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/includes/alerts.drupal.liquid';

describe('Alerts', () => {
  let container;
  const data = parseFixture('src/site/includes/tests/fixtures/alerts.json');

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('renders field alert title as h2', async () => {
    expect(
      container
        .querySelector('h2')
        .innerHTML.replace(/\s+/g, ' ')
        .trim(),
    ).to.equal('Take a look at banner, Michael!');
  });
});
