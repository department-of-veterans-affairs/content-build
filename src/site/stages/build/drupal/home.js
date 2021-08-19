/* eslint-disable no-param-reassign, no-continue */
const { createEntityUrlObj, createFileObj } = require('./page');

// Processes the data received from the home page query.
// eslint-disable-next-line no-unused-vars
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
      },
    } = contentData;

    // Liquid does not have a good modulo operator, so we let the template know when to end a row.
    const hubs = homePageHubListQuery.itemsOfEntitySubqueueHomePageHubList.map(
      (hub, i) => {
        // We want 3 cards per row.
        if ((i + 1) % 3 === 0) {
          hub = {
            ...hub,
            endRow: true,
          };
        }
        return hub;
      },
    );

    homeEntityObj = {
      ...homeEntityObj,
      banners,
      cards: homePageMenuQuery.links.slice(0, menuLength),
      description:
        'Apply for and manage the VA benefits and services you’ve earned as a Veteran, Servicemember, or family member—like health care, disability, education, and more.',
      entityUrl: { path: '/' },
      hubs,
      promos: homePagePromoBlockQuery.itemsOfEntitySubqueueHomePagePromos,
      title: 'VA.gov Home',
    };

    // Let Metalsmith know we're here.
    files[`./index.html`] = createFileObj(homeEntityObj, 'home.drupal.liquid');
  }
}

module.exports = { addHomeContent };
