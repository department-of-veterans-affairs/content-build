module.exports = `
fragment qaGroup on ParagraphQAGroup {
    fieldSectionHeader
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
                  value
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
