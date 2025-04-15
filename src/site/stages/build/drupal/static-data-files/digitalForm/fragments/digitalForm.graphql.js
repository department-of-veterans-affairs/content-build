const address = require('./address.graphql');
const customStep = require('./customStep.graphql');
const employmentHistory = require('./employmentHistory.graphql');
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
  ${employmentHistory}
  ${listLoop}
  ${phoneAndEmail}
  ${yourPersonalInformation}

  fragment digitalForm on NodeDigitalForm {
    nid
    entityLabel
    fieldDigitalFormWhatToKnow
    fieldIntroText
    fieldPlainLanguageTitle
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
        ...employmentHistory
        ...listLoop
        ...phoneAndEmail
        ...yourPersonalInformation
      }
    }
  }
`;
