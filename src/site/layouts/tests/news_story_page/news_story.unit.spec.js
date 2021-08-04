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

  it('href should include path (/(name)-health-care/stories) to stories', async () => {
    expect(
      container.querySelector('article > a').getAttribute('href'),
    ).to.equal('/gulf-coast-health-care/stories');
  });

  it('renders "See all stories" link with path(href) to see all stories', async () => {
    expect(container.querySelector('article').innerHTML).to.include(
      `<a onclick="recordEvent({ event: 'nav-secondary-button-click' });" class="vads-u-display--block vads-u-margin-bottom--7" href="/gulf-coast-health-care/stories">See all stories</a>`,
    );
  });

  it('should not render "See all stories" link if href is empty', async () => {
    const clonedData = _.cloneDeep(data);
    clonedData.fieldListing.entity.entityUrl.path = '';

    const newContainer = await renderHTML(layoutPath, clonedData);

    expect(newContainer.querySelector('article').innerHTML).to.not.include(
      `<a onclick="recordEvent({ event: 'nav-secondary-button-click' });" class="vads-u-display--block vads-u-margin-bottom--7" href="/gulf-coast-health-care/stories">See all stories</a>`,
    );
  });
});
