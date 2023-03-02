const locationsOperatingStatus = `
  locationsOperatingStatus: nodeQuery(limit: 3000, filter:
    {conditions: [
      {field: "status", value: ["1"]},
      {field: "type", value: ["health_care_local_facility"]}]
    }) {
    entities {
      ... on NodeHealthCareLocalFacility {
        entityId
        nid
        title
        fieldMainLocation
        entityUrl {
          path
        }
        fieldFacilityLocatorApiId
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
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
        fieldRegionPage {
          targetId
        }
      }
    }
  }
`;

const GetLocationsOperatingStatus = `
 query {
   ${locationsOperatingStatus}
 }
 `;

module.exports = {
  GetLocationsOperatingStatus,
  partialQuery: locationsOperatingStatus,
};
