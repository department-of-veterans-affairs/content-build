/* eslint-disable no-param-reassign, no-continue, no-console */
const path = require('path');
const _ = require('lodash');
const set = require('lodash/fp/set');
const chalk = require('chalk');

// Creates the file object to add to the file list using the page and layout
function createFileObj(page, layout) {
  // Exclude some types from sitemap.
  // @todo remove basic_landing_page when /resources/ is ready to be indexed
  const privateTypes = ['outreach_asset', 'support_service'];
  let privStatus = false;
  if (privateTypes.indexOf(page.entityBundle) > -1) {
    privStatus = true;
  }

  return {
    ...page,
    isDrupalPage: true,
    layout,
    contents: Buffer.from('<!-- Drupal-provided data -->'),
    debug: global.isPreviewServer ? page : null,
    private: privStatus,
  };
}

// Return a default entityUrl obj to to work from
function createEntityUrlObj(pagePath) {
  return {
    breadcrumb: [
      {
        url: { path: '/', routed: true },
        text: 'Home',
      },
    ],
    path: pagePath,
  };
}

function paginationPath(pageNum) {
  return pageNum === 0 ? '' : `/page-${pageNum + 1}`;
}

// Turn one big page into a series of paginated pages.
function paginatePages(page, files, field, layout, ariaLabel, perPage) {
  perPage = perPage || 10;

  if (typeof ariaLabel === 'undefined') {
    ariaLabel = '';
  } else {
    ariaLabel = ` of ${ariaLabel}`;
  }

  /* eslint-disable camelcase */
  // Map the page.entityBundle value to a property value we want for page
  const bundleToField = {
    event_listing: 'allEventTeasers',
    story_listing: 'allNewsStoryTeasers',
    leadership_listing: 'fieldLeadership',
    press_releases_listing: 'allPressReleaseTeasers',
  };

  /* eslint-enable camelcase */
  const pageField = _.get(bundleToField, page.entityBundle, field);
  const pageReturn = [];

  if (page[pageField]) {
    const pagedEntities = _.chunk(page[pageField].entities, perPage);

    for (let pageNum = 0; pageNum < pagedEntities.length; pageNum++) {
      let pagedPage = Object.assign({}, page);

      if (pageNum > 0) {
        pagedPage = set(
          'entityUrl.path',
          `${page.entityUrl.path}${paginationPath(pageNum)}`,
          page,
        );
      }

      pagedPage.pagedItems = pagedEntities[pageNum];
      const innerPages = [];

      if (pagedEntities.length > 0) {
        // add page numbers
        const numPageLinks = 3;
        let start;
        let length;
        if (pagedEntities.length <= numPageLinks) {
          start = 0;
          length = pagedEntities.length;
        } else {
          length = numPageLinks;

          if (pageNum + numPageLinks > pagedEntities.length) {
            start = pagedEntities.length - numPageLinks;
          } else {
            start = pageNum;
          }
        }
        for (let num = start; num < start + length; num++) {
          innerPages.push({
            href:
              num === pageNum
                ? null
                : `${page.entityUrl.path}${paginationPath(num)}`,
            label: num + 1,
            class: num === pageNum ? 'va-pagination-active' : '',
          });
        }

        pagedPage.paginator = {
          ariaLabel,
          prev:
            pageNum > 0
              ? `${page.entityUrl.path}${paginationPath(pageNum - 1)}`
              : null,
          inner: innerPages,
          next:
            pageNum < pagedEntities.length - 1
              ? `${page.entityUrl.path}${paginationPath(pageNum + 1)}`
              : null,
        };
        pageReturn.push(pagedPage);
      }

      const fileName = path.join('.', pagedPage.entityUrl.path, 'index.html');

      files[fileName] = createFileObj(pagedPage, layout);
    }
  }
  return pageReturn;
}

// Return page object with path, breadcrumb and title set.
function updateEntityUrlObj(page, drupalPagePath, title, pathSuffix) {
  pathSuffix =
    pathSuffix ||
    title
      .replace(/&/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

  let generatedPage = Object.assign({}, page);
  const absolutePath = path.join('/', drupalPagePath, pathSuffix);

  generatedPage.entityUrl.breadcrumb = [
    ...page.entityUrl.breadcrumb,
    {
      url: { path: absolutePath },
      text: page.title,
    },
  ];

  generatedPage = set('entityUrl.path', absolutePath, page);

  generatedPage.title = title;
  return generatedPage;
}

// Generate breadcrumbs from drupal page path
function generateBreadCrumbs(pathString) {
  const pathArray = pathString.split('/');
  const entityUrlObj = createEntityUrlObj(pathString);
  let previous = '';
  let trimmedValue;

  for (const value of pathArray) {
    trimmedValue = _.trim(value, '/');
    if (value) {
      const dehandlized =
        value === 'pittsburgh-health-care'
          ? 'VA Pittsburgh health care'
          : value.charAt(0).toUpperCase() + value.replace(/-/g, ' ').slice(1);
      entityUrlObj.breadcrumb.push({
        url: {
          path: `${previous}${value}`,
          routed: true,
        },
        text: dehandlized,
      });
    }
    previous += `${trimmedValue}/`;
  }
  return entityUrlObj;
}

function getHubSidebar(navsArray, owner) {
  // Get the right benefits hub sidebar
  for (const nav of navsArray) {
    if (nav !== null && nav.links) {
      const navName = _.toLower(nav.name.replace(/&/g, 'and'));
      if (owner !== null && owner === navName) {
        return { sidebar: nav };
      }
    }
  }

  // default to no menu
  return { sidebar: {} };
}

// used to find the correct sidebar menu if the page belongs to a health care region
function getFacilitySidebar(page, contentData) {
  // for pages like New Releases, Stories, Events, and Detail Pages
  const facilityPage =
    page.fieldOffice &&
    page.fieldOffice.entity &&
    page.fieldOffice.entity.entityLabel;

  // for Local Facility pages
  const localFacilityPage = page.fieldRegionPage;

  // if neither of those, check if it's a health care region page
  if (
    facilityPage ||
    localFacilityPage ||
    page.entityBundle === 'health_care_region_page'
  ) {
    let pageTitle = null;

    if (!facilityPage) {
      pageTitle = localFacilityPage
        ? localFacilityPage.entity.title
        : page.title;
    }

    // set the correct menuName based on the page
    const facilityNavName = facilityPage
      ? page.fieldOffice.entity.entityLabel
      : pageTitle;

    // choose the correct menu name to retrieve the object from contentData
    const facilitySidebarNavName = Object.keys(
      contentData.data,
    ).find(attribute =>
      contentData.data[attribute]
        ? contentData.data[attribute].name === facilityNavName
        : false,
    );

    if (facilitySidebarNavName) {
      return contentData.data[facilitySidebarNavName];
    } else {
      const errorMessage = `Failed to find a facility sidebar with a name that matches the VAMC office label "${facilityNavName}".`;

      console.log(chalk.red(errorMessage));

      console.log(
        chalk.red(
          'The VAMC office label should match one of the following menu names as returned by the CMS -',
        ),
      );

      const sidebarNames = Object.values(contentData.data)
        .filter(queryData => queryData?.name)
        .map(queryData => `- ${queryData.name}`);

      console.log(chalk.red(sidebarNames.join('\n')));

      const stringifiedPage = JSON.stringify(page, null, 2);

      console.log(
        chalk.red(
          `Here is the entity evaluated when this error was triggered: \n${stringifiedPage}`,
        ),
      );

      throw new Error(errorMessage);
    }
  }

  // return the default and most important of the menu structure
  return { links: [] };
}

function mergeTaxonomiesIntoResourcesAndSupportHomepage(
  resourcesAndSupportHomepage,
  allTaxonomies,
) {
  const audienceBundles = new Set([
    'audience_beneficiaries',
    'audience_non_beneficiaries',
  ]);

  const audienceTagsUnsorted = allTaxonomies.entities
    .filter(taxonomy => audienceBundles.has(taxonomy.entityBundle))
    .filter(audienceTag => audienceTag.fieldAudienceRsHomepage);

  const audienceTags = _.sortBy(audienceTagsUnsorted, 'name');

  return {
    ...resourcesAndSupportHomepage,
    audienceTags,
  };
}

function compilePage(page, contentData) {
  const {
    data: {
      alerts: alertsItem = {},
      allTaxonomies = {
        entities: [],
      },
      banners,
      bannerAlerts: bannerAlertsItem = {},
      burialsAndMemorialsBenefQuery: burialsHubSidebarNav = {},
      careersEmploymentBenefitsQuery: careersHubSidebarNav = {},
      decisionReviewsBenefitsHQuery: decisionHubSidebarNav = {},
      decisionReviewsHubQuery: decisionReviewsSidebarNav = {},
      disabilityBenefitsHubQuery: disabilityHubSidebarNav = {},
      educationBenefitsHubQuery: educationHubSidebarNav = {},
      healthCareBenefitsHubQuery: healthcareHubSidebarNav = {},
      housingAssistanceBenefitsQuery: housingHubSidebarNav = {},
      lifeInsuranceBenefitsHubQuery: lifeInsuranceHubSidebarNav = {},
      outreachSidebarQuery: outreachSidebarNav = {},
      pensionBenefitsHubQuery: pensionHubSidebarNav = {},
      recordsBenefitsHubQuery: recordsHubSidebarNav = {},
      locationsOperatingStatus,
    },
  } = contentData;

  // Get page owner
  let owner;
  if (page.fieldAdministration && page.fieldAdministration.entity) {
    owner = _.toLower(page.fieldAdministration.entity.name);
  }
  // Benefits hub side navs in an array to loop through later
  const sideNavs = [
    burialsHubSidebarNav,
    careersHubSidebarNav,
    decisionHubSidebarNav,
    disabilityHubSidebarNav,
    educationHubSidebarNav,
    healthcareHubSidebarNav,
    housingHubSidebarNav,
    lifeInsuranceHubSidebarNav,
    pensionHubSidebarNav,
    recordsHubSidebarNav,
    decisionReviewsSidebarNav,
  ];
  let sidebarNavItems;

  const facilitySidebarNavItems = {
    facilitySidebar: getFacilitySidebar(page, contentData),
  };
  const outreachSidebarNavItems = { outreachSidebar: outreachSidebarNav };
  const alertItems = { alert: alertsItem };

  const { entityUrl, entityBundle } = page;

  const pageIdRaw = parseInt(page.entityId, 10);
  const pageId = { pid: pageIdRaw };

  if (!('breadcrumb' in entityUrl)) {
    page.entityUrl = generateBreadCrumbs(entityUrl.path);
  }

  let pageCompiled;
  let operatingStatusEntities;
  let fieldFacilityOperatingStatus;

  switch (entityBundle) {
    case 'office':
    case 'publication_listing':
    case 'locations_listing':
    case 'event_listing':
    case 'leadership_listing':
    case 'story_listing':
    case 'press_releases_listing':
    case 'health_services_listing':
    case 'vamc_system_policies_page':
    case 'health_care_region_detail_page':
    case 'vamc_system_register_for_care':
    case 'vamc_system_billing_insurance':
    case 'vamc_system_medical_records_offi':
      pageCompiled = Object.assign(
        {},
        page,
        facilitySidebarNavItems,
        outreachSidebarNavItems,
        alertItems,
        { bannerAlert: bannerAlertsItem },
        { banners },
        pageId,
      );
      break;
    case 'health_care_local_facility':
    case 'vamc_operating_status_and_alerts':
      operatingStatusEntities = locationsOperatingStatus.entities.filter(
        e => e.fieldRegionPage.targetId === page.fieldOffice.targetId,
      );
      fieldFacilityOperatingStatus = operatingStatusEntities
        .map(e => ({
          entity: e,
        }))
        .sort((e1, e2) => {
          if (e1.entity.title === e2.entity.title) return 0;
          return e1.entity.title > e2.entity.title ? 1 : -1;
        });
      page = {
        ...page,
        fieldFacilityOperatingStatus,
      };
      pageCompiled = Object.assign(
        {},
        page,
        facilitySidebarNavItems,
        alertItems,
        { bannerAlert: bannerAlertsItem },
        { banners },
        pageId,
      );
      break;
    case 'health_care_region_page':
    case 'press_release':
      pageCompiled = Object.assign(
        page,
        facilitySidebarNavItems,
        outreachSidebarNavItems,
        alertItems,
        { bannerAlert: bannerAlertsItem },
        { banners },
        pageId,
      );
      break;
    case 'person_profile':
      if (page.fieldIntroText && page.fieldBody) {
        pageCompiled = Object.assign(
          page,
          facilitySidebarNavItems,
          outreachSidebarNavItems,
          alertItems,
          { bannerAlert: bannerAlertsItem },
          { banners },
          pageId,
        );
      }
      break;
    case 'news_story':
      pageCompiled = Object.assign(
        page,
        facilitySidebarNavItems,
        outreachSidebarNavItems,
        alertItems,
        { banners },
        pageId,
      );
      break;
    case 'event':
      // eslint-disable-next-line no-param-reassign
      page.entityUrl = generateBreadCrumbs(entityUrl.path);
      pageCompiled = Object.assign(
        page,
        facilitySidebarNavItems,
        outreachSidebarNavItems,
        alertItems,
        { bannerAlert: bannerAlertsItem },
        { banners },
        pageId,
      );
      break;
    default:
      // Get the right benefits hub sidebar
      sidebarNavItems = getHubSidebar(sideNavs, owner);

      // Build page with correct sidebar
      pageCompiled = Object.assign(
        {},
        page,
        sidebarNavItems,
        outreachSidebarNavItems,
        alertItems,
        { bannerAlert: bannerAlertsItem },
        { banners },
        pageId,
      );
      break;
  }

  if (entityUrl.path === '/resources') {
    pageCompiled = mergeTaxonomiesIntoResourcesAndSupportHomepage(
      pageCompiled,
      allTaxonomies,
    );
  }

  return pageCompiled;
}

module.exports = {
  compilePage,
  createEntityUrlObj,
  createFileObj,
  generateBreadCrumbs,
  paginatePages,
  updateEntityUrlObj,
};
