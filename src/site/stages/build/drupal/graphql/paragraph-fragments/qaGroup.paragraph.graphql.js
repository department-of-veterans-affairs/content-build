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
