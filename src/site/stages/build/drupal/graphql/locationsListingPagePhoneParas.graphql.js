/**
 * An event detail page
 * Example: /pittsburgh-health-care/events/example-event
 */
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const healthCareLocalFacilitiesPhoneParas = require('./facilities-fragments/healthCareLocalFacilityPhoneParas.node.graphql');

const locationListingPage = `
  fragment locationListingPage on NodeLocationsListing {
    ${entityElementsFromPages}
    title
    entityId
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
                fieldSupplementalStatusMoreI {
                  value
                  format
                  processed
                }
              }
            }
          }
          fieldVamcEhrSystem
          fieldVaHealthConnectPhone
          ${healthCareLocalFacilitiesPhoneParas}
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

const GetNodeLocationsListingPagesPhoneParas = `

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
  GetNodeLocationsListingPagesPhoneParas,
};
