const address = require('./address.graphql');
const phoneAndEmail = require('./phoneAndEmail.graphql');
const yourPersonalInformation = require('./yourPersonalInformation.graphql');

/*
 *
 * The "Digital Form" Content Type in the VA.gov CMS
 *
 */
module.exports = `
  ${address}
  ${phoneAndEmail}
  ${yourPersonalInformation}

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
        ...address
        ...phoneAndEmail
        ...yourPersonalInformation
      }
    }
  }
`;
