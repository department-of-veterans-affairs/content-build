import identificationInformation from './identificationInformation.graphql';
import nameAndDateOfBirth from './nameAndDateOfBirth.graphql';

/*
 *
 * The "Digital Form" Content Type in the VA.gov CMS
 *
 */
module.exports = `
  ${identificationInformation}
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
        ...identificationInformation
        ...nameAndDateOfBirth
      }
    }
  }
`;
