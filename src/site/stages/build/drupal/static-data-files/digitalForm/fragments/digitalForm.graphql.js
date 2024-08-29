const nameAndDateOfBirth = require('./nameAndDateOfBirth.graphql');

/*
 *
 * The "Digital Form" Content Type in the VA.gov CMS
 *
 */
module.exports = `
  ${nameAndDateOfBirth}

  fragment digitalForm on NodeDigitalForm {
    nid
    entityLabel
    fieldVaFormNumber
    fieldOmbNumber
    fieldRespondentBurden
    fieldExpirationDate {
      value
    }
    fieldChapters {
      entity {
        entityId
        type {
          entity {
            entityId
            entityLabel
          }
        }
        ...nameAndDateOfBirth
      }
    }
  }
`;
