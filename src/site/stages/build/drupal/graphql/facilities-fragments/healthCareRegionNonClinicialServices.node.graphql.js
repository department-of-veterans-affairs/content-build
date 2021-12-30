/**
 * Non-clincial services at all facilities within a health care system
 */
const FIELD_ADDRESS = `
  fieldAddress {
    addressLine1
    addressLine2
    postalCode
    locality
    administrativeArea
  }
`;

module.exports = `
  entity {
    entityId
    entityLabel
    reverseFieldRegionPageNode(limit: 50, filter: {conditions: [{field: "type", value: ["health_care_local_facility"]}]}) {
      entities {
        ... on NodeHealthCareLocalFacility {
          entityLabel
          fieldFacilityHours {
            value
          }
          ${FIELD_ADDRESS}
          reverseFieldFacilityLocationNode(limit: 50, filter: {
            conditions: [
              {
                field: "type", value: ["vha_facility_nonclinical_service"]
              }
            ]
          }) {
            entities {
              ... on NodeVhaFacilityNonclinicalService {
                entityId
                fieldServiceNameAndDescripti {
                  entity {
                    entityId
                    entityLabel
                    name
                  }
                  targetId
                }
                fieldServiceLocation {
                  entity {
                    status
                  ... on ParagraphServiceLocation {
                    fieldAdditionalHoursInfo
                    fieldEmailContacts {
                      entity {
                        ... on ParagraphEmailContact {
                        	fieldEmailLabel
                          fieldEmailAddress
                        }
                      }
                    }
                    fieldFacilityServiceHours {
                      value
                    }
                    fieldHours
                    fieldPhone {
                      entity {
                        ... on ParagraphPhoneNumber {
                          fieldPhoneLabel
                          fieldPhoneNumber
                          fieldPhoneExtension
                          fieldPhoneNumberType
                        }
                      }
                    }
                    fieldUseMainFacilityPhone
                      fieldServiceLocationAddress {
                        entity {
                          ... on ParagraphServiceLocationAddress {
                            fieldUseFacilityAddress
                            fieldBuildingNameNumber
                            fieldClinicName
                            fieldUseFacilityAddress
                            fieldWingFloorOrRoomNumber
                            ${FIELD_ADDRESS}
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
