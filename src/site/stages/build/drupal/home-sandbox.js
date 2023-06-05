/* eslint-disable no-param-reassign */
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { createFileObj } = require('./page');

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

const addHomeSandboxContent = (
  contentData,
  files,
  metalsmith,
  buildOptions,
) => {
  // We cannot limit menu items in Drupal, so we must do it here.
  const menuLength = 4;
  const fragmentsRoot = metalsmith.path(buildOptions.contentFragments);
  const bannerLocation = path.join(fragmentsRoot, 'home/banner.yml');
  const bannerFile = fs.readFileSync(bannerLocation);
  const banner = yaml.safeLoad(bannerFile);

  const {
    data: {
      homePageHeroQuery,
      homePageNewsSpotlightQuery,
      homePagePopularOnVaGovMenuQuery,
      homePageOtherSearchToolsMenuQuery,
      homePageHubListMenuQuery,
      homePageCreateAccountQuery,
      banners,
      homePageMenuQuery,
      homePageHubListQuery,
      homePagePromoBlockQuery,
      promoBanners,
    },
  } = contentData;
  const hubs = divideHubRows(
    homePageHubListQuery.itemsOfEntitySubqueueHomePageHubList,
  );

  const homeEntityObj = {
    breadcrumb: [
      {
        url: { path: '/new-home-page', routed: true },
        text: 'V2 Home',
      },
    ],
    path: '/new-home-page',
    banners,
    cards: homePageMenuQuery.links.slice(0, menuLength),
    description:
      'Apply for and manage the VA benefits and services you’ve earned as a Veteran, Servicemember, or family member—like health care, disability, education, and more.',
    entityUrl: { path: '/new-home-page' },
    hubs,
    // eslint-disable-next-line camelcase
    legacy_homepage_banner: banner,
    promoBanners,
    promos: homePagePromoBlockQuery.itemsOfEntitySubqueueHomePagePromos,
    title: 'New VA.gov Home Page',
  };

  const homeSandboxPath = '/new-home-page';
  const hero =
    homePageHeroQuery?.itemsOfEntitySubqueueHomePageHero?.[0]?.entity || {};
  hero.createAccountBlock =
    homePageCreateAccountQuery
      ?.itemsOfEntitySubqueueV2HomePageCreateAccount?.[0]?.entity || {};
  const searchLinks = homePageOtherSearchToolsMenuQuery?.links || [];
  const popularLinks = homePagePopularOnVaGovMenuQuery?.links || [];
  const newsSpotlight =
    homePageNewsSpotlightQuery?.itemsOfEntitySubqueueHomePageNewsSpotlight?.[0]
      ?.entity || {};

  // Filter hub menu links. We do this here instead of in the template because the
  // grouping of hubs also happens here, and we need to filter before we group in
  // order to preserve the intended grouping. See divideHubRows().
  const homeSandboxHubs = homePageHubListMenuQuery.links.filter(link => {
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

  const homeSandboxEntityObj = {
    ...homeEntityObj,
    canonicalLink: '/', // Match current homepage to avoid 'duplicate content' SEO demerit
    hero,
    commonTasks: {
      searchLinks,
      popularLinks,
    },
    newsSpotlight,
    path: homeSandboxPath,
    entityUrl: {
      path: homeSandboxPath,
    },
    hubs: divideHubRows(homeSandboxHubs),
    title: 'New VA.gov home page',
  };

  files[`.${homeSandboxPath}.html`] = createFileObj(
    homeSandboxEntityObj,
    'home-sandbox.drupal.liquid',
  );
};

module.exports = {
  addHomeSandboxContent,
};
