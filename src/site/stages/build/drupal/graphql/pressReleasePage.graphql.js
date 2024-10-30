const { generatePaginatedQueries } = require('../individual-queries-helpers');
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const { phoneNumber } = require('./fragments.graphql');
const personTelephoneParagraphGraphql = require('./paragraph-fragments/personTelephone.paragraph.graphql');

const pressReleaseFragment = `
  fragment pressReleasePage on NodePressRelease {
    ${entityElementsFromPages}
    fieldReleaseDate {
      value
      date
    }
    fieldPdfVersion {
      entity {
        ...on MediaDocument {
          fieldDocument {
            entity {
              ...on File {
                filename
                url
              }
            }
          }
        }
      }
    }
    fieldAddress {
      locality
      administrativeArea
    }
    fieldIntroText
    fieldPressReleaseFulltext {
      processed
    }
    fieldPressReleaseContact {
      entity {
        ...on NodePersonProfile {
          title
          fieldDescription
          fieldPhoneNumber
          ${personTelephoneParagraphGraphql}
          fieldEmailAddress
        }
      }
    }
    fieldPressReleaseDownloads {
      entity {
        entityId
        entityBundle
        name
        ...on MediaDocument {
          fieldDocument {
            entity {
              ...on File {
                filename
                url
              }
            }
          }
        }

        ...on MediaImage {
          image {
            alt
            url
          }
        }

        ...on MediaVideo {
          fieldMediaVideoEmbedField
        }

      }
    }
    fieldListing {
      entity {
        entityUrl {
          path
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

const getPressReleaseSlice = (operationName, offset, limit) => {
  return `
    ${phoneNumber}
    ${pressReleaseFragment}

    query GetNodePressRelease($onlyPublishedContent: Boolean!) {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        filter: {
        conditions: [
          { field: "status", value: ["1"], enabled: $onlyPublishedContent },
          { field: "type", value: ["press_release"] }
        ]
      }) {
        entities {
          ... pressReleasePage
        }
      }
    }
  `;
};

const getPressReleaseQueries = entityCounts => {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetPressRelease',
    entitiesPerSlice: 25,
    totalEntities: entityCounts.data.pressReleases.count,
    getSlice: getPressReleaseSlice,
  });
};

module.exports = {
  fragment: pressReleaseFragment,
  getPressReleaseQueries,
};
