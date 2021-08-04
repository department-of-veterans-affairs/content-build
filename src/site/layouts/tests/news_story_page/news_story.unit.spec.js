import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const _ = require('lodash');

const layoutPath = 'src/site/layouts/news_story.drupal.liquid';
const data = parseFixture(
  'src/site/layouts/tests/news_story_page/fixtures/news-story-data.json',
);

describe('News Story Page', () => {
  let container;

  beforeEach(async () => {
    container = await renderHTML(layoutPath, data);
  });
  it('renders "See all stories" link with path(href) to see all stories', async () => {
    expect(
      container.querySelector('article > a').getAttribute('href'),
    ).to.equal('/gulf-coast-health-care/stories');
  });

  it('should not render "See all stories" link if href is empty', async () => {
    const clonedData = _.cloneDeep(data);
    clonedData.fieldListing.entity.entityUrl.path = '';

    const newContainer = await renderHTML(layoutPath, clonedData);

    expect(newContainer.querySelector('article').innerHTML).to.not.include(
      `<a onclick="recordEvent({ event: 'nav-secondary-button-click' });" class="testing vads-u-display--block vads-u-margin-bottom--7" href="/gulf-coast-health-care/stories">See all stories</a>`,
    );
  });
});
