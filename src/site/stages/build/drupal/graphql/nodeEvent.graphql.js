// Relative imports.
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const { generatePaginatedQueries } = require('../individual-queries-helpers');

// Create NodeEvent fragment.
const nodeEvent = `
  fragment nodeEvent on NodeEvent {
    ${entityElementsFromPages}
    changed
    entityUrl {
      path
    }
    title
    fieldAdditionalInformationAbo {
      value
      format
      processed
    }
    fieldAddress {
      additionalName
      addressLine1
      addressLine2
      administrativeArea
      countryCode
      dependentLocality
      familyName
      givenName
      langcode
      locality
      organization
      postalCode
      sortingCode
    }
    fieldBody {
      format
      processed
      value
    }
    fieldDatetimeRangeTimezone {
      duration
      endTime
      endValue
      rrule
      rruleIndex
      startTime
      timezone
      value
    }
    fieldDescription
    fieldEventCost
    fieldEventCta
    fieldEventRegistrationrequired
    fieldFacilityLocation {
      entity {
        entityBundle
        entityId
        entityType
        ... on NodeHealthCareLocalFacility {
          entityUrl {
            path
          }
          fieldFacilityLocatorApiId
          title
        }
      }
    }
    fieldFeatured
    fieldLink {
      uri
      title
    }
    fieldListing {
      entity {
        entityBundle
        entityId
        entityType
        ... on NodeEventListing {
          fieldDescription
          fieldIntroText
          fieldOffice {
            entity {
              entityType
              entityBundle
              entityId
              ... on NodeOffice {
                fieldBody {
                  value
                  format
                  processed
                }
                fieldDescription
                fieldMetaTags
              }
            }
          }
        }
      }
    }
    fieldLocationHumanreadable
    fieldLocationType
    fieldMedia {
      entity {
        entityBundle
        entityId
        entityType
        ... on MediaImage {
          image {
            alt
            title
            derivative(style: _72MEDIUMTHUMBNAIL) {
              height
              url
              width
            }
          }
          thumbnail {
            alt
            height
            targetId
            title
            url
            width
          }
        }
      }
    }
    fieldMetaTags
    fieldOrder
    fieldUrlOfAnOnlineEvent {
      uri
      title
    }
    uid {
      targetId
      ... on FieldNodeUid {
        entity {
          name
          timezone
        }
      }
    }
  }
`;

function getNodeEventSlice(operationName, offset, limit = 100) {
  return `
    ${nodeEvent}

    query ${operationName}($onlyPublishedContent: Boolean!) {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        sort: { field: "nid", direction:  ASC }
        filter: {
        conditions: [
          { field: "status", value: ["1"], enabled: $onlyPublishedContent },
          { field: "type", value: ["event"] }
        ]
      }) {
        entities {
          ... nodeEvent
        }
      }
    }
  `;
}

function getNodeEventQueries(entityCounts) {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetNodeEvents',
    entitiesPerSlice: 50,
    totalEntities: entityCounts.data.event.count,
    getSlice: getNodeEventSlice,
  });
}

module.exports = {
  fragment: nodeEvent,
  getNodeEventQueries,
};
