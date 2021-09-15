import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const _ = require('lodash');

const layoutPath = 'src/site/layouts/story_listing.drupal.liquid';

describe('story_listing', () => {
  let container;
  const data = parseFixture(
    'src/site/layouts/tests/story_listing/fixtures/story_listing.json',
  );

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('displays a max of 2 featured stories if there are 2 or more featured stories', () => {
    expect(container.getElementsByClassName('featured-story').length).to.equal(
      2,
    );
  });

  it('displays 1 featured story if there is only 1', async () => {
    const clonedData = _.cloneDeep(data);
    const oneFeaturedStory = [
      {
        entityId: '35240',
        title: 'Get your flu shot',
        fieldFeatured: true,
        entityUrl: {
          path: '/salt-lake-city-health-care/stories/get-your-flu-shot',
        },
        promote: false,
        created: 1631219705,
        fieldAuthor: null,
        fieldImageCaption: null,
        fieldIntroText:
          "It's flu season, and it’s now more important than ever to get the flu shot as we continue to battle the COVID-19 pandemic.",
      },
    ];

    clonedData.reverseFieldListingNode.entities = oneFeaturedStory;

    const newContainer = await renderHTML(layoutPath, clonedData);
    expect(
      newContainer.getElementsByClassName('featured-story').length,
    ).to.equal(1);
  });
});
