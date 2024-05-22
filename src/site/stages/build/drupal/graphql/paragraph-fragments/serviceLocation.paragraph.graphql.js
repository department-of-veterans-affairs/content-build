const appointmentServiceLocationItems = require('../file-fragments/appointmentServiceLocationItems.graphql');

/*
 *
 * A service location for a facility service.
 *
 */
module.exports = `
  fieldServiceLocation {
    entity {
      ... on ParagraphServiceLocation {
        ${appointmentServiceLocationItems}
        status
        fieldServiceLocationAddress {
          entity {
            ... on ParagraphServiceLocationAddress {
              fieldUseFacilityAddress
              fieldClinicName
              fieldBuildingNameNumber
              fieldWingFloorOrRoomNumber
              fieldAddress {
                addressLine1
                addressLine2
                additionalName
                administrativeArea
                postalCode
                locality
                organization
                dependentLocality
                countryCode
                sortingCode
              }
            }
          }
        }
        fieldEmailContacts {
          entity {
            ... on ParagraphEmailContact {
              fieldEmailAddress
              fieldEmailLabel
            }
          }
        }
        fieldOfficeHours {
          day
          starthours
          endhours
          comment
        }
        fieldHours
        fieldAdditionalHoursInfo
        fieldPhone {
          entity {
            ... on ParagraphPhoneNumber {
              fieldPhoneExtension
              fieldPhoneLabel
              fieldPhoneNumber
              fieldPhoneNumberType
            }
          }
        }
        fieldUseMainFacilityPhone
      }
    }
  }
`;
