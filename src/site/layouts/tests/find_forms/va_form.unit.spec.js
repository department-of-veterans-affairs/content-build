import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/va_form.drupal.liquid';

describe('va_form', () => {
  let container;
  const data = parseFixture(
    'src/site/layouts/tests/find_forms/fixtures/va_form.json',
  );
  beforeEach(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });
});
