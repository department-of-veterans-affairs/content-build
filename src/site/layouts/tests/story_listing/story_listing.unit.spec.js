import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/story_listing.drupal.liquid';

describe('story_listing', () => {
  let container;
  const data = parseFixture(
    'src/site/layouts/tests/story_listing/fixtures/featured_stories.json',
  );

  before(async () => {
    container = await renderHTML(layoutPath, data.hasMoreThanTwoStories);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });
});
