/**
 * A person profile detail page
 *
 */
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const { generatePaginatedQueries } = require('../individual-queries-helpers');
const { phoneNumber } = require('./fragments.graphql');
const personTelephone = require('./paragraph-fragments/personTelephone.paragraph.graphql');

const personProfileFragment = `
  fragment bioPage on NodePersonProfile {
    ${entityElementsFromPages}
    fieldNameFirst
    fieldLastName
    fieldSuffix
    fieldDescription
    fieldEmailAddress
    ${personTelephone}
    fieldCompleteBiographyCreate
    fieldCompleteBiography { entity { url } }
    fieldOffice {
        entity {
          entityLabel
          entityType
          ...on NodeHealthCareRegionPage {
            fieldVamcEhrSystem
            ${entityElementsFromPages}
            title
          }
        }
      }
    fieldIntroText
    fieldPhotoAllowHiresDownload
    fieldMedia {
      thumbnail: entity {
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
      hiRes: entity {
        ... on MediaImage {
          image {
            alt
            title
            derivative(style: ORIGINAL) {
              url
              width
              height
            }
          }
        }
      }
    }
    fieldBody {
      processed
    }
    changed
    fieldAdministration {
      entity{
        ... on TaxonomyTermAdministration {
          entityId
        }
      }
    }
  }
`;

function getNodePersonProfilesSlice(operationName, offset, limit) {
  return `
    ${phoneNumber}
    ${personProfileFragment}

    query ${operationName}($onlyPublishedContent: Boolean!) {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        sort: { field: "nid", direction:  ASC }
        filter: {
          conditions: [
            { field: "status", value: ["1"], enabled: $onlyPublishedContent },
            { field: "type", value: ["person_profile"] }
          ]
      }) {
        entities {
          ... bioPage
        }
      }
    }
`;
}

function getNodePersonProfileQueries(entityCounts) {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetNodePersonProfile',
    entitiesPerSlice: 50,
    totalEntities: entityCounts.data.personProfile.count,
    getSlice: getNodePersonProfilesSlice,
  });
}

module.exports = {
  fragment: personProfileFragment,
  getNodePersonProfileQueries,
};
