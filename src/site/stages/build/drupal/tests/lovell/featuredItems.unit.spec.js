/* eslint-disable @department-of-veterans-affairs/axe-check-required */
/* eslint-disable camelcase */
import { expect, assert } from 'chai';
import { processLovellPages } from '../../process-lovell-pages';
import {
  deriveMostRecentDate,
  filterUpcomingEvents,
} from '../../../../../filters/events';
// Mock Data
import tricareHomepage from './fixtures/homepages/tricare.json';
import vaHomepage from './fixtures/homepages/va.json';
import federalStories from './fixtures/listing-pages/federal/stories.json';
import federalEvents from './fixtures/listing-pages/federal/events.json';
import tricareStories from './fixtures/listing-pages/tricare/stories.json';
import tricareEvents from './fixtures/listing-pages/tricare/events.json';
import vaStories from './fixtures/listing-pages/va/stories.json';
import vaEvents from './fixtures/listing-pages/va/events.json';
import lovellFederalHealthCareFacilitySidebarQuery from './fixtures/sidebar.json';
import {
  isTricareRegionHomepage,
  isVaRegionHomepage,
} from '../../lovell/helpers';

const isFeatured = entity => entity.fieldFeatured === true;

const getFeaturedItems = (drupalData, lovellVariant, listingVariant) => {
  const homepage = drupalData.data.nodeQuery.entities.find(page => {
    if (lovellVariant === 'tricare') {
      return isTricareRegionHomepage(page);
    }
    if (lovellVariant === 'va') {
      return isVaRegionHomepage(page);
    }
    return false;
  });

  return (
    homepage?.[`${listingVariant}TeasersFeatured`]?.entities[0]
      ?.reverseFieldListingNode?.entities || []
  );
};

const isSortedAscendingByFieldAdministration = featuredStories =>
  featuredStories.reduce(
    (acc, featuredStory) => {
      const currentEntityId =
        featuredStory?.fieldAdministration?.entity?.entityId ??
        Number.MAX_SAFE_INTEGER;
      return {
        lastEntityId: currentEntityId,
        isSorted:
          acc.isSorted &&
          parseInt(currentEntityId, 10) >= parseInt(acc.lastEntityId, 10),
      };
    },
    {
      lastEntityId: 0,
      isSorted: true,
    },
  ).isSorted;

const isSortedAscendingByDate = featuredEvents =>
  featuredEvents.reduce(
    (acc, featuredEvent) => {
      const currentTimestamp = deriveMostRecentDate(
        featuredEvent?.fieldDatetimeRangeTimezone,
      )?.value;
      return {
        lastTimestamp: currentTimestamp,
        isSorted: acc.isSorted && currentTimestamp >= acc.lastTimestamp,
      };
    },
    {
      lastTimestamp: 0,
      isSorted: true,
    },
  ).isSorted;

describe('processLovellPages (featured items)', () => {
  const listingPages = [
    federalStories,
    federalEvents,
    tricareStories,
    tricareEvents,
    vaStories,
    vaEvents,
  ];
  let featuredCounts;
  let drupalDataWithoutHomepages;
  let drupalDataWithHomepages;

  before(() => {
    featuredCounts = {
      federal: {
        stories: federalStories.reverseFieldListingNode.entities.filter(
          isFeatured,
        ).length,
        events: filterUpcomingEvents(
          federalEvents.reverseFieldListingNode.entities,
        ).filter(isFeatured).length,
      },
      tricare: {
        stories: tricareStories.reverseFieldListingNode.entities.filter(
          isFeatured,
        ).length,
        events: filterUpcomingEvents(
          tricareEvents.reverseFieldListingNode.entities,
        ).filter(isFeatured).length,
      },
      va: {
        stories: vaStories.reverseFieldListingNode.entities.filter(isFeatured)
          .length,
        events: filterUpcomingEvents(
          vaEvents.reverseFieldListingNode.entities,
        ).filter(isFeatured).length,
      },
    };

    drupalDataWithoutHomepages = {
      data: {
        lovellFederalHealthCareFacilitySidebarQuery,
        nodeQuery: {
          entities: [...listingPages],
        },
      },
    };
    drupalDataWithHomepages = {
      data: {
        lovellFederalHealthCareFacilitySidebarQuery,
        nodeQuery: {
          entities: [...listingPages, vaHomepage, tricareHomepage],
        },
      },
    };

    processLovellPages(drupalDataWithHomepages);
  });

  describe('homepages do not exist', () => {
    it('processes without errors when homepage objects do not exist', () => {
      try {
        processLovellPages(drupalDataWithoutHomepages);
      } catch (_err) {
        assert.fail(
          '`processLovellPages` should finish without errors if VA/TRICARE homeapge data is not present, but it fails.',
        );
      }
    });
  });

  describe('homepages do exist', () => {
    describe('TRICARE homepage', () => {
      let tricareFeaturedStories;
      let tricareFeaturedEvents;
      before(() => {
        tricareFeaturedStories = getFeaturedItems(
          drupalDataWithHomepages,
          'tricare',
          'newsStory',
        );
        tricareFeaturedEvents = getFeaturedItems(
          drupalDataWithHomepages,
          'tricare',
          'event',
        );
      });
      it('correctly populates featured stories on TRICARE homepage', () => {
        expect(tricareFeaturedStories.length).to.equal(
          featuredCounts.federal.stories + featuredCounts.tricare.stories,
        );
      });
      it('correctly sorts featured stories on TRICARE homepage', () => {
        expect(isSortedAscendingByFieldAdministration(tricareFeaturedStories))
          .to.be.true;
      });
      it('correctly populates featured events on TRICARE homepage', () => {
        expect(tricareFeaturedEvents.length).to.equal(
          featuredCounts.federal.events + featuredCounts.tricare.events,
        );
      });
      it('correctly sorts featured events on TRICARE homepage', () => {
        expect(isSortedAscendingByDate(tricareFeaturedEvents)).to.be.true;
      });
    });

    describe('VA homepage', () => {
      let vaFeaturedStories;
      let vaFeaturedEvents;

      before(() => {
        vaFeaturedStories = getFeaturedItems(
          drupalDataWithHomepages,
          'va',
          'newsStory',
        );
        vaFeaturedEvents = getFeaturedItems(
          drupalDataWithHomepages,
          'va',
          'event',
        );
      });
      it('correctly populates featured stories on VA homepage', () => {
        expect(vaFeaturedStories.length).to.equal(
          featuredCounts.federal.stories + featuredCounts.va.stories,
        );
      });
      it('correctly sorts featured stories on VA homepage', () => {
        expect(isSortedAscendingByFieldAdministration(vaFeaturedStories)).to.be
          .true;
      });
      it('correctly populates featured events on VA homepage', () => {
        expect(vaFeaturedEvents.length).to.equal(
          featuredCounts.federal.events + featuredCounts.va.events,
        );
      });
      it('correctly sorts featured events on VA homepage', () => {
        expect(isSortedAscendingByDate(vaFeaturedEvents)).to.be.true;
      });
    });
  });
});
