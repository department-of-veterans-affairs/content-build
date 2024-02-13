/*
 *
 * Appointments info for a facility service under the Service Location
 *
 */
module.exports = `
  fieldOnlineSchedulingAvail
  fieldUseFacilityPhoneNumber
  fieldOtherPhoneNumbers {
    entity {
      ... on ParagraphPhoneNumber {
        fieldPhoneNumber
        fieldPhoneNumberType
        fieldPhoneExtension
        fieldPhoneLabel
      }
    }
  }
  fieldOfficeVisits
  fieldApptIntroTextType
  fieldApptIntroTextCustom
`;
