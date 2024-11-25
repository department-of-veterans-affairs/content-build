const identificationInformation = require('./identificationInformation.graphql');
const nameAndDateOfBirth = require('./nameAndDateOfBirth.graphql');

/*
 *
 * The "Your personal information" Digital Form pattern.
 *
 * Pattern documentation:
 * https://github.com/department-of-veterans-affairs/vets-website/blob/0ae48c0b017a37d84f6ae425c67c332f4c67fb8b/src/applications/simple-forms/mock-simple-forms-patterns-v3/config/form.js#L40
 *
 */
module.exports = `
  ${identificationInformation}
  ${nameAndDateOfBirth}

  fragment yourPersonalInformation on ParagraphDigitalFormYourPersonalInfo {
    fieldNameAndDateOfBirth {
      entity {
        ...nameAndDateOfBirth
      }
    }
    fieldIdentificationInformation {
      entity {
        ...identificationInformation
      }
    }
  }
`;
