/**
 * An event detail page
 * Example: /pittsburgh-health-care/events/example-event
 */
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const healthCareLocalFacilities = require('./facilities-fragments/healthCareLocalFacility.node.graphql');

const locationListingPage = `
  fragment locationListingPage on NodeLocationsListing {
    ${entityElementsFromPages}
    title
    entityId
    fieldIntroText
    fieldMetaTags
    fieldOffice {
      targetId
      entity {
        ...on NodeHealthCareRegionPage {
          reverseFieldRegionPageNode(limit: 100000, filter:{conditions:[{field: "status", value: ["1"]},{field: "type", value: "health_care_local_facility"}]}) {
            entities {
              ... on NodeHealthCareLocalFacility {
                title
                entityId
                fieldFacilityLocatorApiId
                fieldOperatingStatusFacility
                fieldSupplementalStatus {
                  entity {
                    ... on TaxonomyTermFacilitySupplementalStatus {
                      name
                      fieldStatusId
                      description {
                        processed
                      }
                      fieldGuidance {
                        processed
                      }
                    }
                  }
                }
              }
            }
          }
          fieldVaHealthConnectPhone
          ${healthCareLocalFacilities}
          fieldOtherVaLocations
          entityLabel
          title
        }
      }
    }
    fieldAdministration {
      entity{
        ... on TaxonomyTermAdministration {
          entityId
        }
      }
    }
  }
`;

const GetNodeLocationsListingPages = `

  ${locationListingPage}

  query GetNodeLocationsListingPages($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 500, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["locations_listing"] }
      ]
    }) {
      entities {
        ... locationListingPage
      }
    }
  }
`;

module.exports = {
  fragment: locationListingPage,
  GetNodeLocationsListingPages,
};
