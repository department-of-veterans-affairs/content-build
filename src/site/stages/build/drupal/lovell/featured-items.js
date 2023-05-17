const { filterUpcomingEvents } = require('../../../../filters/events');
const { ENTITY_BUNDLES } = require('../../../../constants/content-modeling');

/*
 * Event listings need to filter out past events.
 * Other listings just return all entities.
 */
const getCurrentListingItems = listingPage => {
  const listingItems = listingPage?.reverseFieldListingNode?.entities;
  if (listingPage.entityBundle !== ENTITY_BUNDLES.EVENT_LISTING) {
    return listingItems;
  }

  return filterUpcomingEvents(listingItems);
};

const getFeaturedListingItems = (listingPages, listingType) => {
  const listingPage = listingPages.find(
    page => page.entityBundle === listingType,
  );
  const listingItems = getCurrentListingItems(listingPage);
  const featuredItems = listingItems?.filter?.(item => item?.fieldFeatured);
  const sortedFeaturedItems = featuredItems?.sort?.(
    (a, b) =>
      (a?.fieldAdministration?.entity?.entityId || Number.MAX_SAFE_INTEGER) -
      (b?.fieldAdministration?.entity?.entityId || Number.MAX_SAFE_INTEGER),
  );

  return sortedFeaturedItems || [];
};

module.exports = {
  getFeaturedListingItems,
};
