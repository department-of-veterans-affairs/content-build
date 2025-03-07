const date = require('./date.graphql');
const radioButton = require('./radioButton.graphql');
const textArea = require('./textArea.graphql');
const textInput = require('./textInput.graphql');

/*
 *
 * A Custom Step page containing form components.
 *
 */
module.exports = `
${date}
${radioButton}
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
      ...radioButton
      ...textArea
      ...textInput
    }
  }
}
`;
