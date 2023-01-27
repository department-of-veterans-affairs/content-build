/* eslint-disable @department-of-veterans-affairs/axe-check-required */
/* eslint-disable camelcase */
import { expect } from 'chai';
import {
  processLovellPages,
  isLovellVaPage,
  isLovellTricarePage,
} from '../../process-lovell-pages';
import { stringArraysContainSameElements } from './utils';
// Mock Data
import federalStories from './fixtures/listing-pages/federal/stories.json';
import federalEvents from './fixtures/listing-pages/federal/events.json';
import federalNews from './fixtures/listing-pages/federal/news.json';
import tricareStories from './fixtures/listing-pages/tricare/stories.json';
import tricareEvents from './fixtures/listing-pages/tricare/events.json';
import tricareNews from './fixtures/listing-pages/tricare/news.json';
import vaStories from './fixtures/listing-pages/va/stories.json';
import vaEvents from './fixtures/listing-pages/va/events.json';
import vaNews from './fixtures/listing-pages/va/news.json';
import lovellFederalHealthCareFacilitySidebarQuery from './fixtures/sidebar.json';

const entityBundleFromListingVariant = listingVariant => {
  let prefix = listingVariant;
  if (listingVariant === 'stories') {
    prefix = 'story';
  } else if (listingVariant === 'events') {
    prefix = 'event';
  }

  return `${prefix}_listing`;
};

const getMergedListing = (drupalData, lovellVariant, listingVariant) => {
  return drupalData.data.nodeQuery.entities
    .filter(page => {
      if (lovellVariant === 'tricare') {
        return isLovellTricarePage(page);
      }
      if (lovellVariant === 'va') {
        return isLovellVaPage(page);
      }

      return false;
    })
    .filter(
      page =>
        page.entityBundle === entityBundleFromListingVariant(listingVariant),
    )[0];
};

describe('processLovelPages (listing pages)', () => {
  let counts;
  let titles;
  let drupalData;

  before(() => {
    counts = {
      federal: {
        stories: federalStories.reverseFieldListingNode.entities.length,
        events: {
          past: federalEvents.pastEvents.entities.length,
          all: federalEvents.reverseFieldListingNode.entities.length,
        },
        press_releases: federalNews.reverseFieldListingNode.entities.length,
      },
      tricare: {
        stories: tricareStories.reverseFieldListingNode.entities.length,
        events: {
          past: tricareEvents.pastEvents.entities.length,
          all: tricareEvents.reverseFieldListingNode.entities.length,
        },
        press_releases: tricareNews.reverseFieldListingNode.entities.length,
      },
      va: {
        stories: vaStories.reverseFieldListingNode.entities.length,
        events: {
          past: vaEvents.pastEvents.entities.length,
          all: vaEvents.reverseFieldListingNode.entities.length,
        },
        press_releases: vaNews.reverseFieldListingNode.entities.length,
      },
    };

    titles = {
      federal: {
        stories: federalStories.reverseFieldListingNode.entities.map(
          entity => entity.title,
        ),
        events: {
          past: federalEvents.pastEvents.entities.map(entity => entity.title),
          all: federalEvents.reverseFieldListingNode.entities.map(
            entity => entity.title,
          ),
        },
        press_releases: federalNews.reverseFieldListingNode.entities.map(
          entity => entity.title,
        ),
      },
      tricare: {
        stories: tricareStories.reverseFieldListingNode.entities.map(
          entity => entity.title,
        ),
        events: {
          past: tricareEvents.pastEvents.entities.map(entity => entity.title),
          all: tricareEvents.reverseFieldListingNode.entities.map(
            entity => entity.title,
          ),
        },
        press_releases: tricareNews.reverseFieldListingNode.entities.map(
          entity => entity.title,
        ),
      },
      va: {
        stories: vaStories.reverseFieldListingNode.entities.map(
          entity => entity.title,
        ),
        events: {
          past: vaEvents.pastEvents.entities.map(entity => entity.title),
          all: vaEvents.reverseFieldListingNode.entities.map(
            entity => entity.title,
          ),
        },
        press_releases: vaNews.reverseFieldListingNode.entities.map(
          entity => entity.title,
        ),
      },
    };

    drupalData = {
      data: {
        lovellFederalHealthCareFacilitySidebarQuery,
        nodeQuery: {
          entities: [
            federalStories,
            federalNews,
            federalEvents,
            tricareStories,
            tricareEvents,
            tricareNews,
            vaStories,
            vaEvents,
            vaNews,
          ],
        },
      },
    };

    processLovellPages(drupalData);
  });

  const testMergedListingCounts = (
    mergedListing,
    lovellVariant,
    listingVariant,
  ) => {
    const mergedListingCount =
      mergedListing.reverseFieldListingNode.entities.length;
    const expectedMergedListingCount =
      listingVariant === 'events'
        ? counts.federal.events.all + counts[lovellVariant].events.all
        : counts.federal[listingVariant] +
          counts[lovellVariant][listingVariant];
    expect(mergedListingCount).to.equal(expectedMergedListingCount);
  };

  const testMergedListingTitles = (
    mergedListing,
    lovellVariant,
    listingVariant,
  ) => {
    const mergedListingTitles = mergedListing.reverseFieldListingNode.entities.map(
      entity => entity.title,
    );
    const expectedMergedListingTitles =
      listingVariant === 'events'
        ? [
            ...titles.federal[listingVariant].all,
            ...titles[lovellVariant][listingVariant].all,
          ]
        : [
            ...titles.federal[listingVariant],
            ...titles[lovellVariant][listingVariant],
          ];
    expect(
      stringArraysContainSameElements(
        mergedListingTitles,
        expectedMergedListingTitles,
      ),
    ).to.be.true;
  };

  const testMergedPastEvents = (mergedEvents, lovellVariant) => {
    const mergedPastEventsCount = mergedEvents.pastEvents.entities.length;
    expect(mergedPastEventsCount).to.equal(
      counts.federal.events.past + counts[lovellVariant].events.past,
    );

    const mergedPastEventTitles = mergedEvents.pastEvents.entities.map(
      entity => entity.title,
    );
    const expectedPastEventTitles = [
      ...titles.federal.events.past,
      ...titles[lovellVariant].events.past,
    ];
    expect(
      stringArraysContainSameElements(
        mergedPastEventTitles,
        expectedPastEventTitles,
      ),
    ).to.be.true;
  };

  // Create tests for each of six (6) listing pages
  // - VA Stories
  // - VA Events
  // - VA Press Releases
  // - Tricare Stories
  // - Tricare Events
  // - Tricare Press Releases
  ['stories', 'events', 'press_releases'].forEach(listingVariant => {
    describe(`${listingVariant} listing pages`, () => {
      ['va', 'tricare'].forEach(lovellVariant => {
        it(`correctly merges federal and ${lovellVariant} ${listingVariant} for ${lovellVariant} listing page`, () => {
          const mergedListing = getMergedListing(
            drupalData,
            lovellVariant,
            listingVariant,
          );

          testMergedListingCounts(mergedListing, lovellVariant, listingVariant);
          testMergedListingTitles(mergedListing, lovellVariant, listingVariant);

          if (listingVariant === 'events') {
            testMergedPastEvents(mergedListing, lovellVariant);
          }
        });
      });
    });
  });
});
