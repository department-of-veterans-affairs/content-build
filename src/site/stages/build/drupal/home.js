/* eslint-disable no-param-reassign, no-continue */
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { createEntityUrlObj, createFileObj } = require('./page');
const ENVIRONMENTS = require('../../../constants/environments');

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
     * The Below is meant to represent potentially dynamic content for the Home Page Prototype
     * This page is only built on non-prod environments
     * */
    if (buildOptions.buildtype !== ENVIRONMENTS.VAGOVPROD) {
      const homePreviewPath = '/homepage-test';

      const unsortedHubs =
        homePageHubListQuery.itemsOfEntitySubqueueHomePageHubList;

      // This assumes that benefit hubs with beresorted in the CMS later and for now is
      // hardcoding their ordering to match the prototype mockup
      let sortedHubs = [
        unsortedHubs[9], // Health Care
        unsortedHubs[10], // Disability
        unsortedHubs[7], // Education & Training
        //
        unsortedHubs[3], // Careers and employment
        unsortedHubs[5], // Pension
        unsortedHubs[4], // Housing Assistance
        //
        unsortedHubs[6], // Life Insurance
        unsortedHubs[2], // Burial and memorials
        unsortedHubs[8], //

        unsortedHubs[0], // Life Insurance
        unsortedHubs[1], // Burial and memorials
        unsortedHubs[9], // VA Dept Information -- Needs created,
      ];

      sortedHubs = divideHubRows(sortedHubs);

      const homePreviewEntityObj = {
        ...homeEntityObj,
        hero: {
          headline: 'The PACT Act and your VA benefits',
          copy:
            'Expands and extends eligibility for care and benefits for Veterans and Survivors related to toxic exposures.',
          link: '#',
          linkText: 'Learn about the PACT Act',
        },
        commonTasks: {
          searchLinks: [
            { link: '/find-a-location/', linkText: 'Find a VA facility' },
            { link: '/find-forms/', linkText: 'Find a VA form' },
            {
              link: '/resouces/',
              linkText: 'Find benedit resources and support',
            },
          ],
          popularLinks: [
            {
              link: '/health-care/',
              linkText: 'VA health care',
            },
            {
              link: '/health-care/get-medical-records/',
              linkText: 'VA medical records',
            },
            {
              link: 'https://mentalhealth.va.gov/',
              linkText: 'Mental health help',
            },
            {
              link: '/health-care/get-reimbursed-for-travel-pay/',
              linkText: 'Travel reimbursement for health care',
            },
            {
              link: '/resources/the-pact-act-and-your-va-benefits/',
              linkText: 'PACT Act information for Veterans with toxic exposure',
            },
            {
              link: '/claim-or-appeal-status/',
              linkText: 'Claim or appeal status',
            },
            {
              link: '/disability/',
              linkText: 'Disability compensation',
            },
            {
              link: '/education/',
              linkText: 'Education benefits',
            },
            {
              link: '/va-payment-history/',
              linkText: 'You VA payment history',
            },
            {
              link: '/view-change-dependents',
              linkText: 'Dependants on your disability benefits',
            },
          ],
        },
        blogPromo: {
          title: 'Pathfinder: The front door for engaging with VA',
          copy:
            'Pathfinder is an entry point for those seeking to sell their product or service or innovate on solutions with VA.',
          url: 'https://pathfinder.va.gov',
          thumbnailAltText: 'Thumbnail alt text goes here',
          thumbnail:
            'https://s3-us-gov-west-1.amazonaws.com/content.www.va.gov/img/2022-08/Pathfinder%20VA.gov%20Banner%20%28552%20%C3%97%20360%20px%29_v1_0.png',
        },
        hubs: sortedHubs,
        path: homePreviewPath,
        entityUrl: {
          path: homePreviewPath,
        },
      };

      files[`./homepage-test.html`] = createFileObj(
        homePreviewEntityObj,
        'home-preview.drupal.liquid',
      );
    }
  }
}

module.exports = { addHomeContent };
