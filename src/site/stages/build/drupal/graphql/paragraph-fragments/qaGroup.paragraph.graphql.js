module.exports = `
fragment qaGroup on ParagraphQAGroup {
    fieldSectionHeader
    fieldAccordionDisplay
    fieldRichWysiwyg {
      value
      format
      processed
    }
    queryFieldQAs {
      entities {
        entityId
        entityLabel
        moderationState
        ... on NodeQA {
          fieldAnswer {
              entity {
                entityBundle
              ... on ParagraphRichTextCharLimit1000 {
                fieldWysiwyg {
                  processed
                  format
                }
              }
            }
            targetId
            targetRevisionId
            ... on FieldNodeQAFieldAnswer {
              entity {
                entityId
                entityLabel
                
              }
            }
          }
        }
      } 
    }
  }
`;
