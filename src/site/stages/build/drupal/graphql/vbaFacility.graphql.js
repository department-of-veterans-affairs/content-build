const { generatePaginatedQueries } = require('../individual-queries-helpers');

const draftContentOverride = process.env.UNPUBLISHED_CONTENT === 'true';
const entityElementsFromPages = require('./entityElementsForPages.graphql');

const vbaFacilityFragment = `
      fragment vbaFacilityFragment on NodeVbaFacility {
        ${entityElementsFromPages}
        entityLabel
        ... on NodeVbaFacility {
          title
          changed
          entityUrl {
            ... on EntityCanonicalUrl {
              breadcrumb {
                text
                url {
                  path
                  routed
                }
              }
            }
          }
          fieldIntroText
          fieldFacilityLocatorApiId
          fieldOperatingStatusFacility
          fieldOperatingStatusMoreInfo
          fieldPhoneNumber
          fieldCcBenefitsHotline {
            fetched
          }
          fieldCcCantFindBenefits {
           fetched
          }
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
          fieldCcNationalSpotlight1 {
            fetched
          }
          fieldCcNationalSpotlight2 {
            fetched
          }
          fieldCcNationalSpotlight3 {
            fetched
          }
          fieldMedia {
            entity {
              ... on MediaImage {
                image {
                  alt
                  title
                  derivative(style: _32MEDIUMTHUMBNAIL) {
                    url
                    width
                    height
                  }
                }
              }
            }
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
