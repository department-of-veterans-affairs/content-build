const {
  deriveMostRecentDate,
  filterUpcomingEvents,
} = require('../../../../filters/events');
const { ENTITY_BUNDLES } = require('../../../../constants/content-modeling');

const isFeatured = item => item?.fieldFeatured;

const fieldAdministrationAsc = (a, b) =>
  (a?.fieldAdministration?.entity?.entityId ?? Number.MAX_SAFE_INTEGER) -
  (b?.fieldAdministration?.entity?.entityId ?? Number.MAX_SAFE_INTEGER);

const dateAsc = (a, b) =>
  (deriveMostRecentDate(a?.fieldDatetimeRangeTimezone)?.value ??
    Number.MAX_SAFE_INTEGER) -
  (deriveMostRecentDate(b?.fieldDatetimeRangeTimezone)?.value ??
    Number.MAX_SAFE_INTEGER);

const getFeaturedListingEvents = events => {
  const upcomingEvents = filterUpcomingEvents(events) || [];
  const featuredEvents = upcomingEvents.filter(isFeatured);
  return [...featuredEvents].sort(dateAsc);
};

const getFeaturedListingStories = stories => {
  const featuredStories = stories?.filter?.(isFeatured) || [];
  return [...featuredStories].sort(fieldAdministrationAsc);
};

const getFeaturedListingItems = (listingPages, listingType) => {
  const listingPage = listingPages.find(
    page => page.entityBundle === listingType,
  );
  const listingItems = listingPage?.reverseFieldListingNode?.entities;
  return listingType === ENTITY_BUNDLES.EVENT_LISTING
    ? getFeaturedListingEvents(listingItems)
    : getFeaturedListingStories(listingItems);
};

module.exports = {
  getFeaturedListingItems,
};
