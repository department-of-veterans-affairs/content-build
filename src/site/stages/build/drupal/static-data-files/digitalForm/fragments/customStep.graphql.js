const page = require('./page.graphql');

/*
 *
 * The "Single Response" Digital Form pattern.
 *
 * Pattern documentation:
 * https://design.va.gov/patterns/ask-users-for/a-single-response
 *
 */
module.exports = `
${page}

fragment customStep on ParagraphDigitalFormCustomStep {
  fieldTitle
  fieldDigitalFormPages {
    entity {
      entityId
      type {
        entity {
          entityId
          entityLabel
        }
      }
      ...page
    }
  }
}
`;
