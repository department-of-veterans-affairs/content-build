module.exports = `
  fieldTelephone {
        ... on FieldNodeHealthCareLocalFacilityFieldTelephone {
            entity {
              ... on ParagraphPhoneNumber {
                fieldPhoneNumber
                fieldPhoneLabel
                fieldPhoneExtension
                fieldPhoneNumberType
              }
            }
        }
  }`;
