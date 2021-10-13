import { expect } from 'chai';
import { renderHTML, parseFixture } from '~/site/tests/support';

const layoutPath = 'src/site/components/fullwidth_banner_alerts.drupal.liquid';

describe('fullwidth_banner_alerts', () => {
  // Note: fieldAlertInheritanceSubpages behaves the opposite of its name.
  it('renders the alert on subpage when fieldAlertInheritanceSubpages is false', async () => {
    const data = parseFixture(
      'src/site/components/tests/fixtures/banner_alerts_inherit.json',
    );
    const container = await renderHTML(layoutPath, data, 'inherit');
    expect(container.getElementById(`usa-alert-full-width-15641`)).to.exist;
  });

  it('hides the alert on subpage when fieldAlertInheritanceSubpages is true', async () => {
    const data = parseFixture(
      'src/site/components/tests/fixtures/banner_alerts_no_inherit.json',
    );
    const container = await renderHTML(layoutPath, data, 'noInherit');
    expect(container.getElementById(`usa-alert-full-width-15641`)).not.to.exist;
  });
});
