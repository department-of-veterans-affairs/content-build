import { expect } from 'chai';
import {
  processLovellPages,
  isLovellVaPage,
  isLovellTricarePage,
} from '../../process-lovell-pages';
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
    .filter(page => page.entityBundle === `${listingVariant}_listing`)[0];
};

describe('processLovelPages (listing pages)', () => {
  let counts;
  let drupalData;

  before(() => {
    counts = {
      federal: {
        stories: federalStories.reverseFieldListingNode.entities.length,
        events: {
          past: federalEvents.pastEvents.entities.length,
          all: federalEvents.reverseFieldListingNode.entities.length,
        },
        news: federalNews.reverseFieldListingNode.entities.length,
      },
      tricare: {
        stories: tricareStories.reverseFieldListingNode.entities.length,
        events: {
          past: tricareEvents.pastEvents.entities.length,
          all: tricareEvents.reverseFieldListingNode.entities.length,
        },
        news: tricareNews.reverseFieldListingNode.entities.length,
      },
      va: {
        stories: vaStories.reverseFieldListingNode.entities.length,
        events: {
          past: vaEvents.pastEvents.entities.length,
          all: vaEvents.reverseFieldListingNode.entities.length,
        },
        news: vaNews.reverseFieldListingNode.entities.length,
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

  describe('stories listing pages', () => {
    it('correctly merges Federal and Tricare stories for Tricare listing page', () => {
      const mergedStories = getMergedListing(drupalData, 'tricare', 'story');
      const mergedStoryCount =
        mergedStories.reverseFieldListingNode.entities.length;
      expect(mergedStoryCount).to.equal(
        counts.federal.stories + counts.tricare.stories,
      );
    });
    it('correctly merges Federal and VA stories for VA listing page', () => {
      const mergedStories = getMergedListing(drupalData, 'va', 'story');
      const mergedStoryCount =
        mergedStories.reverseFieldListingNode.entities.length;
      expect(mergedStoryCount).to.equal(
        counts.federal.stories + counts.va.stories,
      );
    });
  });

  describe('events listing pages', () => {
    it('correctly merges Federal and Tricare events for Tricare listing page', () => {
      const mergedEvents = getMergedListing(drupalData, 'tricare', 'event');
      const mergedAllEventsCount =
        mergedEvents.reverseFieldListingNode.entities.length;
      const mergedPastEventsCount = mergedEvents.pastEvents.entities.length;
      expect(mergedAllEventsCount).to.equal(
        counts.federal.events.all + counts.tricare.events.all,
      );
      expect(mergedPastEventsCount).to.equal(
        counts.federal.events.past + counts.tricare.events.past,
      );
    });
    it('correctly merges Federal and VA events for VA listing page', () => {
      const mergedEvents = getMergedListing(drupalData, 'va', 'event');
      const mergedAllEventsCount =
        mergedEvents.reverseFieldListingNode.entities.length;
      const mergedPastEventsCount = mergedEvents.pastEvents.entities.length;
      expect(mergedAllEventsCount).to.equal(
        counts.federal.events.all + counts.va.events.all,
      );
      expect(mergedPastEventsCount).to.equal(
        counts.federal.events.past + counts.va.events.past,
      );
    });
  });

  describe('press-release listing pages', () => {
    it('correctly merges Federal and Tricare press releases for Tricare listing page', () => {
      const mergedNews = getMergedListing(
        drupalData,
        'tricare',
        'press_releases',
      );
      const mergedNewsCount =
        mergedNews.reverseFieldListingNode.entities.length;
      expect(mergedNewsCount).to.equal(
        counts.federal.news + counts.tricare.news,
      );
    });
    it('correctly merges Federal and VA press releases for VA listing page', () => {
      const mergedNews = getMergedListing(drupalData, 'va', 'press_releases');
      const mergedNewsCount =
        mergedNews.reverseFieldListingNode.entities.length;
      expect(mergedNewsCount).to.equal(counts.federal.news + counts.va.news);
    });
  });
});
