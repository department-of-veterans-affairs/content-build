const checkbox = require('./checkbox.graphql');
const date = require('./date.graphql');
const radioButton = require('./radioButton.graphql');
const responseOption = require('./responseOption.graphql');
const textArea = require('./textArea.graphql');
const textInput = require('./textInput.graphql');

/*
 *
 * A Custom Step page containing form components.
 *
 */
module.exports = `
${checkbox}
${date}
${radioButton}
${responseOption}
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
      ...checkbox
      ...date
      ...radioButton
      ...textArea
      ...textInput
    }
  }
}
`;
