const address = require('./address.graphql');
const customStep = require('./customStep.graphql');
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
  ${customStep}
  ${listLoop}
  ${phoneAndEmail}
  ${yourPersonalInformation}

  fragment digitalForm on NodeDigitalForm {
    nid
    entityLabel
    fieldDigitalFormWhatToKnow
    fieldIntroText
    fieldVaFormNumber
    fieldOmbNumber
    fieldRespondentBurden
    moderationState
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
        ...customStep
        ...listLoop
        ...phoneAndEmail
        ...yourPersonalInformation
      }
    }
  }
`;
