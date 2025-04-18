const personTelephoneParagraphGraphql = require('../paragraph-fragments/personTelephone.paragraph.graphql');

/**
 * Associated person profiles on the healthcare region node
 */
const PERSON_PROFILE_RESULTS = `
  entity {
    ... on NodePersonProfile {
      entityPublished
      title
      fieldNameFirst
      fieldLastName
      fieldSuffix
      fieldEmailAddress
      ${personTelephoneParagraphGraphql}
      fieldDescription
      fieldOffice {
        entity {
          entityLabel
          entityType
        }
      }
      fieldIntroText
      fieldPhotoAllowHiresDownload
      fieldMedia {
        entity {
          ... on MediaImage {
            image {
              alt
              title
              url
              derivative(style: _23MEDIUMTHUMBNAIL) {
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
      entityUrl {
        path
      }
    }
  }
`;

module.exports = `
  fieldLeadership
    {
    ${PERSON_PROFILE_RESULTS}
  }
`;
