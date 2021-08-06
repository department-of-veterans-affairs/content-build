import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const _ = require('lodash');

const layoutPath = 'src/site/layouts/news_story.drupal.liquid';

describe('News Story Page', () => {
  const data = parseFixture(
    'src/site/layouts/tests/news_story_page/fixtures/news-story-data.json',
  );

  let container;

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('renders "See all stories" link with path(/(name)-health-care/stories) to see all stories', async () => {
    expect(container.getElementById('news-stories-listing-link')).to.exist;

    expect(container.getElementById('news-stories-listing-link').href).to.equal(
      '/gulf-coast-health-care/stories',
    );
  });

  it('should not render "See all stories" link if href is empty', async () => {
    const clonedData = _.cloneDeep(data);
    clonedData.fieldListing.entity.entityUrl.path = '';

    const newContainer = await renderHTML(layoutPath, clonedData);

    expect(newContainer.getElementById('news-stories-listing-link')).to.equal(
      null,
    );
  });
});
