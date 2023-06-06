/* eslint-disable no-param-reassign, no-continue */
const { createEntityUrlObj, createFileObj } = require('./page');
const { addHomeSandboxContent } = require('./home-sandbox');

function divideHubRows(hubs) {
  return hubs.map((hub, i) => {
    // We want 3 cards per row.
    if ((i + 1) % 3 === 0) {
      hub = {
        ...hub,
        endRow: true,
      };
    }
    return hub;
  });
}

// Processes the data received from the home page query.
function addHomeContent(contentData, files, metalsmith, buildOptions) {
  // We cannot limit menu items in Drupal, so we must do it here.
  const menuLength = 4;

  // Make sure that we have content for the home page.
  if (contentData.data.homePageMenuQuery) {
    let homeEntityObj = createEntityUrlObj('/');
    const {
      data: {
        banners,
        homePageMenuQuery,
        homePagePromoBlockQuery,
        promoBanners,
      },
    } = contentData;

    const {
      data: {
        homePageHeroQuery,
        homePageNewsSpotlightQuery,
        homePagePopularOnVaGovMenuQuery,
        homePageOtherSearchToolsMenuQuery,
        homePageHubListMenuQuery,
        homePageCreateAccountQuery,
      },
    } = contentData;
    const homePath = '/';

    const hero =
      homePageHeroQuery?.itemsOfEntitySubqueueHomePageHero?.[0]?.entity || {};
    hero.createAccountBlock =
      homePageCreateAccountQuery
        ?.itemsOfEntitySubqueueV2HomePageCreateAccount?.[0]?.entity || {};
    const searchLinks = homePageOtherSearchToolsMenuQuery?.links || [];
    const popularLinks = homePagePopularOnVaGovMenuQuery?.links || [];
    const newsSpotlight =
      homePageNewsSpotlightQuery
        ?.itemsOfEntitySubqueueHomePageNewsSpotlight?.[0]?.entity || {};

    // Filter hub menu links. We do this here instead of in the template because the
    // grouping of hubs also happens here, and we need to filter before we group in
    // order to preserve the intended grouping. See divideHubRows().
    const homeHubs = homePageHubListMenuQuery.links.filter(link => {
      // Any disabled links should not be displayed.
      if (!link.enabled) {
        return false;
      }
      // If the link has a linkedEntity, and the linkedEntity is not published, it
      // should not be displayed.
      return (
        !link.entity.linkedEntity ||
        (link.entity.linkedEntity && link.entity.linkedEntity.entityPublished)
      );
    });

    homeEntityObj = {
      banners,
      canonicalLink: '/',
      cards: homePageMenuQuery.links.slice(0, menuLength),
      commonTasks: {
        searchLinks,
        popularLinks,
      },
      entityUrl: { path: homePath },
      hero,
      hubs: divideHubRows(homeHubs),
      newsSpotlight,
      promoBanners,
      promos: homePagePromoBlockQuery.itemsOfEntitySubqueueHomePagePromos,
      path: homePath,
      title: 'VA.gov Home',
    };

    addHomeSandboxContent(contentData, files, metalsmith, buildOptions);

    files[`./index.html`] = createFileObj(homeEntityObj, 'home.drupal.liquid');
  }
}

module.exports = { addHomeContent };
