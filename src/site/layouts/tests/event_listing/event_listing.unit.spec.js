import { expect } from 'chai';
import { renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';
import { readFileSync } from 'fs';
import path from 'path';

const layoutPath = 'src/site/layouts/event_listing.drupal.liquid';

const getFile = filePath =>
  readFileSync(path.resolve(__dirname, `../../`, filePath), 'utf8');

const getTomorrow = () => {
  const d = new Date();
  return Math.round(d.getTime() / 1000) + 60 * 60 * 24;
};

const getYesterday = () => {
  const d = new Date();
  return Math.round(d.getTime() / 1000) - 60 * 60 * 24;
};

const tomorrow = getTomorrow();
const yesterday = getYesterday();

const dateStringLookup = {
  yesterday,
  tomorrow,
  tomorrowPlusOne: tomorrow + 1,
};

describe('Events Listing Page', () => {
  let data;
  const fixturePath = 'tests/event_listing/fixtures/event-listing-data.json';

  try {
    data = JSON.parse(getFile(fixturePath));
  } catch (error) {
    /* eslint-disable no-console */
    console.log(`Error parsing JSON fixture in:\n`, error);
    /* eslint-enable no-console */
  }

  data.pastEvents.entities.forEach((event, index) => {
    data.pastEvents.entities[index].fieldDatetimeRangeTimezone.value =
      dateStringLookup[event.fieldDatetimeRangeTimezone.value];
  });

  data.reverseFieldListingNode.entities.forEach((event, index) => {
    data.reverseFieldListingNode.entities[
      index
    ].fieldDatetimeRangeTimezone.value =
      dateStringLookup[event.fieldDatetimeRangeTimezone.value];
  });

  let container;

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('renders upcoming/past events toggle', async () => {
    expect(container.getElementById('events-list-toggle')).to.exist;
  });

  it('renders correct spotlight event', async () => {
    expect(container.querySelector('#featured-content a').innerHTML).to.equal(
      'Virtual Veterans Town Hall',
    );
  });

  it('renders correct upcoming event', async () => {
    expect(
      container.querySelector('#virtual-women-veterans-health- a').innerHTML,
    ).to.equal('Virtual Women Veterans Health Public Forum');
  });

  it('does not render featured event twice', () => {
    expect(container.querySelectorAll('h2 a').length).to.equal(2);
  });
});
