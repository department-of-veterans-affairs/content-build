/* eslint-disable no-param-reassign, no-continue */
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { createEntityUrlObj, createFileObj } = require('./page');

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
        homePageHubListQuery,
        homePagePromoBlockQuery,
        promoBanners,
      },
    } = contentData;

    // Liquid does not have a good modulo operator, so we let the template know when to end a row.
    const hubs = divideHubRows(
      homePageHubListQuery.itemsOfEntitySubqueueHomePageHubList,
    );

    const fragmentsRoot = metalsmith.path(buildOptions.contentFragments);
    const bannerLocation = path.join(fragmentsRoot, 'home/banner.yml');
    const bannerFile = fs.readFileSync(bannerLocation);
    const banner = yaml.safeLoad(bannerFile);

    homeEntityObj = {
      ...homeEntityObj,
      banners,
      cards: homePageMenuQuery.links.slice(0, menuLength),
      description:
        'Apply for and manage the VA benefits and services you’ve earned as a Veteran, Servicemember, or family member—like health care, disability, education, and more.',
      entityUrl: { path: '/' },
      hubs,
      // eslint-disable-next-line camelcase
      legacy_homepage_banner: banner,
      promoBanners,
      promos: homePagePromoBlockQuery.itemsOfEntitySubqueueHomePagePromos,
      title: 'VA.gov Home',
    };

    // Let Metalsmith know we're here.
    files[`./index.html`] = createFileObj(homeEntityObj, 'home.drupal.liquid');

    /**
     * Below is the code responsible for generating the new Homepage experience.
     * */
    const {
      data: {
        homePageHeroQuery,
        homePageNewsSpotlightQuery,
        homePagePopularOnVaGovMenuQuery,
        homePageOtherSearchToolsMenuQuery,
      },
    } = contentData;

    const homePreviewPath = '/new-home-page';

    const hero =
      homePageHeroQuery?.itemsOfEntitySubqueueHomePageHero?.[0]?.entity || {};
    const searchLinks = homePageOtherSearchToolsMenuQuery?.links || [];
    const popularLinks = homePagePopularOnVaGovMenuQuery?.links || [];
    const newsSpotlight =
      homePageNewsSpotlightQuery
        ?.itemsOfEntitySubqueueHomePageNewsSpotlight?.[0]?.entity || {};

    const homePreviewEntityObj = {
      ...homeEntityObj,
      canonicalLink: '/', // Match current homepage to avoid 'duplicate content' SEO demerit
      hero,
      commonTasks: {
        searchLinks,
        popularLinks,
      },
      newsSpotlight,
      path: homePreviewPath,
      entityUrl: {
        path: homePreviewPath,
      },
    };

    files[`.${homePreviewPath}.html`] = createFileObj(
      homePreviewEntityObj,
      'home-preview.drupal.liquid',
    );
  }
}

module.exports = { addHomeContent };
