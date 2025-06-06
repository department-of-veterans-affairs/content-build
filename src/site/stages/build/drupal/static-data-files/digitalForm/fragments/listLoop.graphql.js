/*
 *
 * The "List & Loop" Digital Form pattern.
 *
 * Pattern documentation:
 * https://design.va.gov/patterns/ask-users-for/multiple-responses
 *
 */
module.exports = `
fragment listLoop on ParagraphDigitalFormListLoop {
  fieldTitle
  fieldOptional
  fieldSectionIntro
  fieldItemNameLabel
  fieldListLoopMaxItems
  fieldListLoopNounPlural
  fieldListLoopNounSingular
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
