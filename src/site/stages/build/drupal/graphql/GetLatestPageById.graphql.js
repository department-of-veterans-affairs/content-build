// Relative imports.
const bioPage = require('./bioPage.graphql');
const faqMultipleQa = require('./faqMultipleQa.graphql');
const healthCareLocalFacilityPage = require('./healthCareLocalFacilityPage.graphql');
const healthCareRegionDetailPage = require('./healthCareRegionDetailPage.graphql');
const healthCareRegionPage = require('./healthCareRegionPage.graphql');
const healthServicesListingPage = require('./healthServicesListingPage.graphql');
const landingPage = require('./landingPage.graphql');
const leadershipListingPage = require('./leadershipListingPage.graphql');
const locationsListingPage = require('./locationsListingPage.graphql');
const newsStoryPage = require('./newStoryPage.graphql');
const nodeBasicLandingPage = require('./nodeBasicLandingPage.graphql');
const nodeCampaignLandingPage = require('./nodeCampaignLandingPage.graphql');
const nodeChecklist = require('./nodeChecklist.graphql');
const nodeEvent = require('./nodeEvent.graphql');
const nodeEventListing = require('./nodeEventListing.graphql');
const nodeMediaListImages = require('./nodeMediaListImages.graphql');
const nodeMediaListVideos = require('./nodeMediaListVideos.graphql');
const nodeQa = require('./nodeQa.graphql');
const nodeStepByStep = require('./nodeStepByStep.graphql');
const nodeSupportResourcesDetailPage = require('./nodeSupportResourcesDetailPage.graphql');
const page = require('./page.graphql');
const pressReleasePage = require('./pressReleasePage.graphql');
const pressReleasesListingPage = require('./pressReleasesListingPage.graphql');
const storyListingPage = require('./storyListingPage.graphql');
const vaFormPage = require('./vaFormPage.graphql');
const vamcBillingAndInsurancePages = require('./vamcBillingAndInsurancePage.graphql');
const vamcMedicalRecordsOfficePages = require('./vamcMedicalRecordsOfficePage.graphql');
const vamcOperatingStatusAndAlerts = require('./vamcOperatingStatusAndAlerts.graphql');
const vamcPolicyPages = require('./vamcPoliciesPage.graphql');
const vamcRegisterForCarePages = require('./vamcRegisterForCarePage.graphql');
const vetCenterLocations = require('./vetCenterLocations.graphql');
const vetCenters = require('./vetCenter.graphql');
const { ALL_FRAGMENTS } = require('./fragments.graphql');

// String Helpers
const {
  updateQueryString,
  queryParamToBeChanged,
} = require('./../../../../utilities/stringHelpers');

/**
 * Queries for a page by the node id, getting the latest revision
 * To execute, run this query at http://staging.va.agile6.com/graphql/explorer.
 */

module.exports = `
  ${ALL_FRAGMENTS}
  ${landingPage.fragment}
  ${page.fragment}
  ${healthCareRegionPage.fragment}
  ${healthCareLocalFacilityPage.fragment}
  ${healthCareRegionDetailPage.fragment}
  ${healthServicesListingPage.fragment}
  ${pressReleasePage.fragment}
  ${pressReleasesListingPage.fragment}
  ${vamcOperatingStatusAndAlerts.fragment}
  ${storyListingPage.fragment}
  ${newsStoryPage.fragment}
  ${nodeEvent.fragment}
  ${nodeEventListing.fragment}
  ${bioPage.fragment}
  ${vaFormPage.fragment}
  ${nodeQa.fragment}
  ${faqMultipleQa.fragment}
  ${nodeStepByStep.fragment}
  ${nodeMediaListImages.fragment}
  ${nodeChecklist.fragment}
  ${nodeMediaListVideos.fragment}
  ${nodeSupportResourcesDetailPage.fragment}
  ${nodeBasicLandingPage.fragment}
  ${nodeCampaignLandingPage.fragment}
  ${vetCenters.fragment}
  ${vetCenterLocations.fragment}
  ${vamcPolicyPages.fragment}
  ${vamcRegisterForCarePages.fragment}
  ${vamcMedicalRecordsOfficePages.fragment}
  ${vamcBillingAndInsurancePages.fragment}
  ${leadershipListingPage.fragment}
  ${locationsListingPage.fragment}

  query GetLatestPageById($id: String!, $today: String!, $onlyPublishedContent: Boolean!) {
    nodes: nodeQuery(revisions: LATEST, filter: {
    conditions: [
      { field: "nid", value: [$id] }
    ]
    }) {
      entities {
        ... landingPage
        ... page
        ... healthCareRegionPage
        ... healthCareLocalFacilityPage
        ... healthCareRegionDetailPage
        ... healthServicesListingPage
        ... storyListingPage
        ... newsStoryPage
        ... pressReleasePage
        ... pressReleasesListingPage
        ... vamcOperatingStatusAndAlerts
        ... nodeEvent
        ... nodeEventListing
        ... bioPage
        ... vaFormPage
        ... nodeQa
        ... faqMultipleQA
        ... nodeStepByStep
        ... nodeMediaListImages
        ... nodeChecklist
        ... nodeMediaListVideos
        ... nodeSupportResourcesDetailPage
        ... nodeBasicLandingPage
        ... nodeCampaignLandingPage
        ... vetCenterFragment
        ... vetCenterLocationsFragment
        ... policiesPageFragment
        ... registerForCareFragment
        ... medicalRecordsOfficeFragment
        ... billingAndInsuranceFragment
        ... leadershipListingPage
        ... locationListingPage
      }
    }
  }
`;

const query = module.exports;

let regString = '';
queryParamToBeChanged.forEach(param => {
  regString += `${param}|`;
});

const regex = new RegExp(`${regString}`, 'g');
module.exports = query.replace(regex, updateQueryString);
