const date = require('./date.graphql');
const textArea = require('./textArea.graphql');
const textInput = require('./textInput.graphql');

/*
 *
 * A Custom Step page containing form components.
 *
 */
module.exports = `
${date}
${textArea}
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
      ...date
      ...textArea
      ...textInput
    }
  }
}
`;
