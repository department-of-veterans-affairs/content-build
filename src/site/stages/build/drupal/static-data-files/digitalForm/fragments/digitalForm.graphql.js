const address = require('./address.graphql');
const phoneAndEmail = require('./phoneAndEmail.graphql');
const yourPersonalInformation = require('./yourPersonalInformation.graphql');
const listLoop = require('./listLoop.graphql');

/*
 *
 * The "Digital Form" Content Type in the VA.gov CMS
 *
 */
module.exports = `
  ${address}
  ${listLoop}
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
        ...listLoop
        ...phoneAndEmail
        ...yourPersonalInformation
      }
    }
  }
`;
