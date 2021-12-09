import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/home.drupal.liquid';

describe('Home Page', () => {
  let container;
  const data = parseFixture('src/site/layouts/tests/home/fixtures/home.json');

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('sets focus on main when skipped to content', async () => {
    expect(container.querySelector('main').id).to.equal('content');
  });
});
