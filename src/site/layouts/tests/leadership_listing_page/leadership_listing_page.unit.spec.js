import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/leadership_listing.drupal.liquid';

describe('Leadership Listing Page', () => {
  let container;
  const data = parseFixture(
    'src/site/layouts/tests/leadership_listing_page/fixtures/data.json',
  );

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('renders header and intro text', () => {
    expect(container.querySelector('h1').innerHTML.trim()).to.equal(data.title);
    expect(
      container.querySelector('div.va-introtext').innerHTML.trim(),
    ).to.equal(data.fieldIntroText);
  });

  it('renders published bios', () => {
    expect(
      Object.keys(container.querySelectorAll('[data-template="teasers/bio"]'))
        .length,
    ).to.equal(4);
  });

  it('does NOT render unpublished bios', () => {
    for (const node of container
      .querySelectorAll('[data-template="teasers/bio"]')
      .values()) {
      expect(node.textContent).not.to.include('O’Connor');
    }
  });
});
