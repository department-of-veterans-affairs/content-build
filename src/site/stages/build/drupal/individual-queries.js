const { CountEntityTypes } = require('./graphql/CountEntityTypes.graphql');

const { getNodePageQueries } = require('./graphql/page.graphql');
const { GetNodeLandingPages } = require('./graphql/landingPage.graphql');
const { getNodeVaFormQueries } = require('./graphql/vaFormPage.graphql');

const {
  getNodeHealthCareRegionPageQueries,
} = require('./graphql/healthCareRegionPage.graphql');

const { getNodeOfficeQueries } = require('./graphql/nodeOffice.graphql');

const {
  getNodeHealthCareLocalFacilityPageQueries,
} = require('./graphql/healthCareLocalFacilityPage.graphql');
const {
  getNodeHealthServicesListingPageQueries,
} = require('./graphql/healthServicesListingPage.graphql');

const {
  getPressReleaseQueries,
} = require('./graphql/pressReleasePage.graphql');

const {
  GetNodePressReleaseListingPages,
} = require('./graphql/pressReleasesListingPage.graphql');

const {
  GetNodeLocationsListingPages,
} = require('./graphql/locationsListingPage.graphql');
const {
  GetNodeLeadershipListingPages,
} = require('./graphql/leadershipListingPage.graphql');

const {
  GetNodeVamcOperatingStatusAndAlerts,
} = require('./graphql/vamcOperatingStatusAndAlerts.graphql');

const {
  GetNodePublicationListingPages,
} = require('./graphql/benefitListingPage.graphql');

const {
  getNodeHealthCareRegionDetailPageQueries,
} = require('./graphql/healthCareRegionDetailPage.graphql');

const { getNodeQaQueries } = require('./graphql/nodeQa.graphql');
const { GetNodeMultipleQaPages } = require('./graphql/faqMultipleQa.graphql');
const { GetNodeStepByStep } = require('./graphql/nodeStepByStep.graphql');
const {
  GetNodeMediaListImages,
} = require('./graphql/nodeMediaListImages.graphql');
const { GetNodeChecklist } = require('./graphql/nodeChecklist.graphql');
const {
  GetNodeMediaListVideos,
} = require('./graphql/nodeMediaListVideos.graphql');

const {
  GetNodeSupportResourcesDetailPage,
} = require('./graphql/nodeSupportResourcesDetailPage.graphql');

const {
  GetNodeBasicLandingPage,
} = require('./graphql/nodeBasicLandingPage.graphql');

const {
  GetCampaignLandingPages,
} = require('./graphql/nodeCampaignLandingPage.graphql');

const { GetPolicyPages } = require('./graphql/vamcPoliciesPage.graphql');
const {
  GetRegisterForCarePages,
} = require('./graphql/vamcRegisterForCarePage.graphql');

const {
  GetMedicalRecordsOfficePages,
} = require('./graphql/vamcMedicalRecordsOfficePage.graphql');

const {
  GetBillingAndInsurancePages,
} = require('./graphql/vamcBillingAndInsurancePage.graphql');

const { getVetCenterQueries } = require('./graphql/vetCenter.graphql');
const { getVbaFacilityQueries } = require('./graphql/vbaFacility.graphql');
const { getVaPoliceQueries } = require('./graphql/vaPolice.graphql');
const {
  GetVetCenterLocations,
} = require('./graphql/vetCenterLocations.graphql');

const {
  GetLocationsOperatingStatus,
} = require('./graphql/locationsOperatingStatus.graphql');

function getNodeQueries(entityCounts) {
  return {
    ...getNodePageQueries(entityCounts),
    GetNodeLandingPages,
    ...getNodeVaFormQueries(entityCounts),
    ...getNodeHealthCareRegionPageQueries(entityCounts),
    ...getNodeOfficeQueries(entityCounts),
    ...getNodeHealthCareLocalFacilityPageQueries(entityCounts),
    ...getNodeHealthServicesListingPageQueries(entityCounts),
    ...getPressReleaseQueries(entityCounts),
    GetNodePressReleaseListingPages,
    ...getVaPoliceQueries(entityCounts),
    GetNodeLocationsListingPages,
    GetNodeLeadershipListingPages,
    GetNodeVamcOperatingStatusAndAlerts,
    GetNodePublicationListingPages,
    ...getNodeHealthCareRegionDetailPageQueries(entityCounts),
    ...getNodeQaQueries(entityCounts),
    GetNodeMultipleQaPages,
    GetNodeStepByStep,
    GetNodeMediaListImages,
    GetNodeChecklist,
    GetNodeMediaListVideos,
    GetNodeSupportResourcesDetailPage,
    GetNodeBasicLandingPage,
    GetCampaignLandingPages,
    ...getVetCenterQueries(entityCounts),
    ...getVbaFacilityQueries(entityCounts),
    GetVetCenterLocations,
    GetPolicyPages,
    GetBillingAndInsurancePages,
    GetRegisterForCarePages,
    GetMedicalRecordsOfficePages,
  };
}

function nonNodeQueries() {
  // Get current feature flags
  const { cmsFeatureFlags } = global;

  const { getEntityQueueByName } = require('./graphql/entityQueue.graphql');
  const GetEntityQueueStagedContent = getEntityQueueByName('staged_content');

  const { GetIcsFiles } = require('./graphql/file-fragments/ics.file.graphql');

  const {
    GetSidebars,
  } = require('./graphql/navigation-fragments/sidebar.nav.graphql');

  const {
    VaFacilitySidebars,
  } = require('./graphql/navigation-fragments/facilitySidebar.nav.graphql');

  const {
    GetOutreachSidebar,
  } = require('./graphql/navigation-fragments/outreachSidebar.nav.graphql');

  const { GetAlerts } = require('./graphql/alerts.graphql');
  const { GetBanners } = require('./graphql/banners.graphql');
  const { GetPromoBanners } = require('./graphql/promoBanners.graphql');
  const { GetBannnerAlerts } = require('./graphql/bannerAlerts.graphql');
  const {
    GetOutreachAssets,
  } = require('./graphql/file-fragments/outreachAssets.graphql');
  const { GetHomepage } = require('./graphql/homePage.graphql');
  const {
    GetMenuLinks,
  } = require('./graphql/navigation-fragments/menuLinks.nav.graphql');
  const {
    GetBottomRail,
    GetFooterColumns,
  } = require('./graphql/navigation-fragments/footer.nav.graphql');
  const {
    GetTaxonomies,
  } = require('./graphql/taxonomy-fragments/GetTaxonomies.graphql');

  const componentQueries = {
    GetEntityQueueStagedContent,
    GetLocationsOperatingStatus,
    GetIcsFiles,
    GetSidebars,
    ...VaFacilitySidebars,
    GetOutreachSidebar,
    GetAlerts,
    GetBanners,
    GetPromoBanners,
    GetBannnerAlerts,
    GetOutreachAssets,
    GetBottomRail,
    GetFooterColumns,
    GetHomepage,
    GetMenuLinks,
    GetTaxonomies,
  };

  if (cmsFeatureFlags.FEATURE_ALL_HUB_SIDE_NAVS) {
    const {
      GetAllSideNavMachineNames,
    } = require('./graphql/navigation-fragments/allSideNavMachineNames.nav.graphql');

    componentQueries.GetAllSideNavMachineNames = GetAllSideNavMachineNames;
  }

  return componentQueries;
}

function getIndividualizedQueries(entityCounts) {
  return {
    ...getNodeQueries(entityCounts),
    ...nonNodeQueries(),
  };
}

module.exports = {
  getIndividualizedQueries,
  nonNodeQueries,
  CountEntityTypes,
};
