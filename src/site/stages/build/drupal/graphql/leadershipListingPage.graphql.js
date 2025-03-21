/**
 * An event detail page
 * Example: /pittsburgh-health-care/events/example-event
 */
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const personTelephoneParagraphGraphql = require('./paragraph-fragments/personTelephone.paragraph.graphql');
const { phoneNumber } = require('./fragments.graphql');

const leadershipListingPage = `
  fragment leadershipListingPage on NodeLeadershipListing {
    ${entityElementsFromPages}
    title
    fieldIntroText
    entityUrl {
      path
    }
    fieldLeadership {
      entity {
        ... on NodePersonProfile {
          title
          ${personTelephoneParagraphGraphql}
          entityPublished
          fieldNameFirst
          fieldLastName
          fieldSuffix
          fieldDescription
          fieldOffice {
            entity {
              entityLabel
              entityType
            }
          }
          fieldIntroText
          fieldPhotoAllowHiresDownload
          fieldBody {
            processed
          }
          changed
          entityUrl {
            path
          }
          fieldMedia {
            entity {
              ... on MediaImage {
                image {
                  alt
                  title
                  derivative(style: _23MEDIUMTHUMBNAIL) {
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
    }
    fieldOffice {
      entity {
        entityUrl {
          path
        }
        title
        reverseFieldOfficeNode(limit: 500, filter: {conditions: [{field: "type", value: "person_profile"}, {field: "status", value: "1", operator: EQUAL}]}) {
          entities {
            ... on NodePersonProfile {
              title
              fieldNameFirst
              fieldLastName
              fieldSuffix
              fieldDescription
              fieldOffice {
                entity {
                  entityLabel
                  entityType
                }
              }
              fieldIntroText
              fieldPhotoAllowHiresDownload
              fieldBody {
                processed
              }
              changed
              entityUrl {
                path
              }
              fieldMedia {
                entity {
                  ... on MediaImage {
                    image {
                      alt
                      title
                      derivative(style: _21MEDIUMTHUMBNAIL) {
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
        }
      }
    }
    fieldOffice {
      targetId
      entity {
        ... on NodeHealthCareRegionPage {
          entityId
          entityLabel
          title
          fieldVamcEhrSystem
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

const GetNodeLeadershipListingPages = `

  ${leadershipListingPage}
  ${phoneNumber}
  
  query GetNodeLeadershipListingPages($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 500, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["leadership_listing"] }
      ]
    }) {
      entities {
        ... leadershipListingPage
      }
    }
  }
`;

module.exports = {
  fragment: leadershipListingPage,
  GetNodeLeadershipListingPages,
};
