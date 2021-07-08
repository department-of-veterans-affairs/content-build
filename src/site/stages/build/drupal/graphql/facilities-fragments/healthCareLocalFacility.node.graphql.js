/**
 * The 'Health Care Local Facility' bundle of the 'Content' entity type.
 */

const FACILITIES_RESULTS = `
  entities {
    ... on NodeHealthCareLocalFacility {
      entityUrl {
      ... on EntityCanonicalUrl {
        path
      }
    }
      entityBundle
      title
      entityId
      entityBundle
      changed
      fieldMobile
      fieldOperatingStatusFacility
      fieldFacilityLocatorApiId
      fieldIntroText
      fieldLocationServices {
        entity {
          ... on ParagraphHealthCareLocalFacilityServi {
            entityId
            entityBundle
            fieldTitle
            fieldWysiwyg {
              processed
            }
          }
        }
      }
    fieldAddress {
      addressLine1
      locality
      administrativeArea
      postalCode
    }
    fieldPhoneNumber
    fieldMentalHealthPhone
    fieldFacilityHours {
      value
    }
      fieldMainLocation
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
  }
`;

function queryFilter(isMainLocation, isMobile = false) {
  return `
    filter: {conditions: [
      {field: "status", value: "1", operator: EQUAL, enabled: $onlyPublishedContent},
      {field: "field_main_location", value: "${
        isMainLocation ? '1' : '0'
      }", operator: EQUAL}
      {field: "field_mobile", value: "${isMobile ? '1' : '0'}", operator: EQUAL}
    ]}`;
}

module.exports = `
  mainFacilities: reverseFieldRegionPageNode(limit: 50, ${queryFilter(true)}) {
    ${FACILITIES_RESULTS}
  }
  otherFacilities: reverseFieldRegionPageNode(limit: 50, ${queryFilter(
    false,
  )}) {
    ${FACILITIES_RESULTS}
  }
  mobileFacilities: reverseFieldRegionPageNode(limit: 50, ${queryFilter(
    false,
    true,
  )}) {
    ${FACILITIES_RESULTS}
  }
`;
