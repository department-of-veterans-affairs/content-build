/* eslint-disable no-param-reassign, no-continue */
const fs = require('fs-extra');
const _ = require('lodash');
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

      const unsortedHubs = _.cloneDeep(
        homePageHubListQuery.itemsOfEntitySubqueueHomePageHubList,
      );

      // Updating copy for each of the hubs without overrriding their current values for other fields.
      const healthCareHub = unsortedHubs[9];
      healthCareHub.entity.fieldTeaserText =
        'Apply for VA health care and manage your prescriptions, appointments, and care online.';

      const disabilityHub = unsortedHubs[10];
      disabilityHub.entity.fieldTeaserText =
        'File and track your service-connect claims and manage your benefits over time.';

      const educationHub = unsortedHubs[7];
      educationHub.entity.fieldTeaserText =
        'Apply for and manage your GI Bill and other education benefits.';

      const careersHub = unsortedHubs[3];
      careersHub.entity.fieldTeaserText =
        'Get support for vocations rehabilitation, your small business, or other job-related needs.';

      const pensionHub = unsortedHubs[5];
      pensionHub.entity.fieldTeaserText =
        'Apply for monthly payments for wartime Veterans and survivors.';

      const housingHub = unsortedHubs[4];
      housingHub.entity.fieldTeaserText =
        "Find out if you're eligible for VA-backed home loans and disability housing grants.";

      const insuranceHub = unsortedHubs[6];
      insuranceHub.entity.fieldTeaserText =
        'Explore life insurance options for you and your family and manage you policy online.';

      const burialHub = unsortedHubs[2];
      burialHub.entity.fieldTeaserText =
        'Plan a burial in a VA national cemetary, request memorial items, and apply for survival benefits.';

      const recordsHub = unsortedHubs[8];
      recordsHub.entity.fieldTeaserText =
        'Apply for a printer Veteran ID card, get your benefit letters and medical records, and learn how to apply for discharge upgrade.';

      const memberBenefitsHub = unsortedHubs[0];
      memberBenefitsHub.entity.fieldTeaserText =
        'Learn when and how to apply for benefits during service and as you transition out of service.';

      const familyBenefitsHub = unsortedHubs[1];
      familyBenefitsHub.entity.fieldTeaserText =
        'Find out which benefits you may be eligible for as a dependant, spouse, survivor, or family caregiver.';

      // This hub is a new addition and therefore needs mocked in its entirety.
      const vaDeptInfoHub = {
        entity: {
          entityId: '123456',
          fieldTitleIcon: '',
          path: '#',
          fieldHomePageHubLabel: 'VA department information',
          fieldTeaserText:
            'Learn more about the VA departments that manage our benefits and health care programs',
        },
      };

      // This assumes that benefit hubs with beresorted in the CMS later and for now is
      // hardcoding their ordering to match the prototype mockup
      let sortedHubs = [
        healthCareHub, // Health Care
        disabilityHub, // Disability
        educationHub, // Education & Training

        careersHub, // Careers and employment
        pensionHub, // Pension
        housingHub, // Housing Assistance

        insuranceHub, // Life Insurance
        burialHub, // Burial and memorials
        recordsHub, // Records

        memberBenefitsHub, // Service Member Benefits
        familyBenefitsHub, // Family Member Benefits
        vaDeptInfoHub, // VA Dept Information -- Needs created,
      ];

      sortedHubs = divideHubRows(sortedHubs);

      const homePreviewEntityObj = {
        ...homeEntityObj,
        hero: {
          headline: 'The PACT Act and your VA benefits',
          copy:
            'This new law expands and extends eligibility for care and benefits for Veterans and survivors related to toxic exposures.',
          link: '#',
          linkText: 'Learn what the PACT Act means to you',
        },
        commonTasks: {
          searchLinks: [
            { link: '/find-a-location/', linkText: 'Find a VA facility' },
            { link: '/find-forms/', linkText: 'Find a VA form' },
            {
              link: '/resources/',
              linkText: 'Find benefit resources and support',
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
              link: '/health-care/health-needs-conditions/mental-health/',
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
              linkText: 'Your VA payment history',
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
