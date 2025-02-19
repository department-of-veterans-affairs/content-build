const textInput = require('./textInput.graphql');

/*
 *
 * A Custom Step page containing form components.
 *
 */
module.exports = `
${textInput}

fragment page on ParagraphDigitalFormPage {
  fieldTitle
  fieldDigitalFormBodyText
  fieldDigitalFormComponents {
    entity {
      entityId
      type {
        entity {
          entityId
          entityLabel
        }
      }
      ...textInput
    }
  }
}
`;
