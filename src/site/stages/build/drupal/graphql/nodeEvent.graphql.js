// Relative imports.
const { generatePaginatedQueries } = require('../individual-queries-helpers');

const FIELD_ADDRESS = `
fieldAddress {
  addressLine1
  addressLine2
  postalCode
  locality
  administrativeArea
}`;

// Create NodeEvent fragment.
const nodeEvent = `
  fragment nodeEvent on NodeEvent {
    changed
    entityBundle
    entityId
    entityPublished
    fieldLastSavedByAnEditor
    entityMetatags {
      __typename
      key
      value
    }
    entityUrl {
      ... on EntityCanonicalUrl {
        breadcrumb {
          url {
            path
            routed
          }
          text
        }
        path
      }
    }
    title
    vid
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
    fieldCtaEmail
    fieldHowToSignUp
    fieldEventRegistrationrequired
    fieldFacilityLocation {
      entity {
        ... on NodeVetCenter {
          ${FIELD_ADDRESS}
        }
        ...on NodeHealthCareLocalFacility {
          ${FIELD_ADDRESS}
        }
        ...on NodeNcaFacility {
          ${FIELD_ADDRESS}
        }
        ...on NodeVbaFacility {
          ${FIELD_ADDRESS}
        }
        ...on NodeVetCenterOutstation {
          ${FIELD_ADDRESS}
        }
        ...on NodeVetCenterCap {
          ${FIELD_ADDRESS}
        }
        entityBundle
        entityId
        entityType

        entityUrl {
          path
        }
        title
      }
    }
    fieldFeatured
    fieldLink {
      uri
      url {
        path
      }
      title
    }
    fieldListing {
      entity {
        entityBundle
        entityId
        entityType
        entityUrl {
          path
        }
        ... on NodeEventListing {
          fieldDescription
        fieldIntroText
        fieldOffice {
            entity {
              entityType
              entityBundle
              entityId
              ... on Node {
                title
              }
              ... on NodeOffice {
                title
                fieldBody {
                  value
                  format
                  processed
                }
                fieldDescription
              }
            }
          }
        }
      }
    }
    fieldAdditionalListings {
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
              ... on Node {
                title
              }
              ... on NodeOffice {
                title
                fieldBody {
                  value
                  format
                  processed
                }
                fieldDescription
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
    fieldOrder
    fieldPublishToOutreachCal
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
    fieldAdministration {
      entity{
        ... on TaxonomyTermAdministration {
          entityId
        }
      }
    }
  }
`;

const nodeEventWithoutBreadcrumbs = `
  fragment nodeEventWithoutBreadcrumbs on NodeEvent {
    changed
    entityBundle
    entityId
    entityPublished
    fieldLastSavedByAnEditor
    entityMetatags {
      __typename
      key
      value
    }
    entityUrl {
      path
    }
    title
    vid
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
    fieldCtaEmail
    fieldHowToSignUp
    fieldEventRegistrationrequired
    fieldFacilityLocation {
      entity {
        ... on NodeVetCenter {
          ${FIELD_ADDRESS}
        }
        ...on NodeHealthCareLocalFacility {
          ${FIELD_ADDRESS}
        }
        ...on NodeNcaFacility {
          ${FIELD_ADDRESS}
        }
        ...on NodeVbaFacility {
          ${FIELD_ADDRESS}
        }
        ...on NodeVetCenterOutstation {
          ${FIELD_ADDRESS}
        }
        ...on NodeVetCenterCap {
          ${FIELD_ADDRESS}
        }
        entityBundle
        entityId
        entityType
        entityUrl {
          path
        }
        title
      }
    }
    fieldFeatured
    fieldLink {
      uri
      url {
        path
      }
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
              ... on Node {
                title
              }
              ... on NodeOffice {
                title
                fieldBody {
                  value
                  format
                  processed
                }
                fieldDescription
              }
            }
          }
        }
      }
    }
    fieldAdditionalListings {
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
              ... on Node {
                title
              }
              ... on NodeOffice {
                title
                fieldBody {
                  value
                  format
                  processed
                }
                fieldDescription
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
    fieldOrder
    fieldPublishToOutreachCal
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
    fieldAdministration {
      entity{
        ... on TaxonomyTermAdministration {
          entityId
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
  fragmentWithoutBreadcrumbs: nodeEventWithoutBreadcrumbs,
  getNodeEventQueries,
};
