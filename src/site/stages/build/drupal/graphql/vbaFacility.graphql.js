const { generatePaginatedQueries } = require('../individual-queries-helpers');

const draftContentOverride = process.env.UNPUBLISHED_CONTENT === 'true';

const vbaFacilityFragment = `
      fragment vbaFacilityFragment on NodeVbaFacility {
        entityId
        entityUrl {
          path
          routed
        }
        entityMetatags {
          __typename
          key
          value
        }
        entityBundle
        entityLabel
        ... on NodeVbaFacility {
          title
          changed
          fieldIntroText
          fieldFacilityLocatorApiId
          fieldOperatingStatusFacility
          fieldOperatingStatusMoreInfo
          fieldPhoneNumber
          fieldAddress {
            addressLine1
            addressLine2
            countryCode
            locality
            postalCode
            administrativeArea
          }
          fieldGeolocation {
            lat
            lon
          }
          fieldOfficeHours {
            day
            starthours
            endhours
            comment
          }
        }
      }`;

const getVbaFacilitySlice = (operationName, offset, limit) => {
  return `
    ${vbaFacilityFragment}

    query GetVbaFacilitys${
      !draftContentOverride ? '($onlyPublishedContent: Boolean!)' : ''
    } {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        filter: {
          conditions: [
            ${
              !draftContentOverride
                ? '{ field: "status", value: ["1"], enabled: $onlyPublishedContent },'
                : ''
            }
            { field: "type", value: ["vba_facility"] }
          ]
        }) {
        entities {
          ... vbaFacilityFragment
        }
      }
    }
`;
};

const getVbaFacilityQueries = entityCounts => {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetVbaFacility',
    entitiesPerSlice: 25,
    totalEntities: entityCounts.data.vbaFacilities.count,
    getSlice: getVbaFacilitySlice,
  });
};

module.exports = {
  fragment: vbaFacilityFragment,
  getVbaFacilityQueries,
};
