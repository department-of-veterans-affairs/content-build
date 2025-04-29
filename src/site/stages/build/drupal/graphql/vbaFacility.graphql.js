const { generatePaginatedQueries } = require('../individual-queries-helpers');

const draftContentOverride = process.env.UNPUBLISHED_CONTENT === 'true';
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const appointmentServiceLocationItems = require('./file-fragments/appointmentServiceLocationItems.graphql');

const vbaFacilityFragment = `
      fragment vbaFacilityFragment on NodeVbaFacility {
        ${entityElementsFromPages}
        entityLabel
        ... on NodeVbaFacility {
          title
          changed
          entityUrl {
            ... on EntityCanonicalUrl {
              breadcrumb {
                text
                url {
                  path
                  routed
                }
              }
            }
          }
          fieldCcVbaFacilityOverview {
            fetched
          }
          fieldShowBanner
          fieldAlertType
          fieldDismissibleOption
          fieldBannerTitle
          fieldBannerContent {
            value
            format
            processed
          }
          fieldIntroText
          fieldFacilityLocatorApiId
          fieldOperatingStatusFacility
          fieldOperatingStatusMoreInfo
          fieldPhoneNumber
          fieldCcBenefitsHotline {
            fetched
          }
          fieldCcCantFindBenefits {
           fetched
          }
          fieldAddress {
            addressLine1
            addressLine2
            countryCode
            locality
            postalCode
            administrativeArea
          }
          fieldGeolocation {
            lat
            lon
          }
          fieldOfficeHours {
            day
            starthours
            endhours
            comment
          }
          fieldCcNationalSpotlight1 {
            fetched
          }
          fieldLocalSpotlight {
            entity {
              ... on ParagraphFeaturedContent {
                id
                fieldDescription {
                  value
                  processed
                  format
                }
                fieldSectionHeader
                fieldCta {
                  entity {
                    ... on ParagraphButton {
                      fieldButtonLink {
                        url {
                          path
                        }
                        uri
                        title
                        options
                      }
                      fieldButtonLabel
                    }
                  }
                }
              }
            }
          }
          fieldCcGetUpdatesFromVba {
            fetched
          }
          fieldMedia {
            entity {
              ... on MediaImage {
                image {
                  alt
                  title
                  derivative(style: _32MEDIUMTHUMBNAIL) {
                    url
                    width
                    height
                  }
                }
              }
            }
          }
          fieldPrepareForVisit {
            entity {
              id
              entityBundle
              ... on ParagraphBasicAccordion {
                id
                fieldHeader
                fieldRichWysiwyg {
                  processed
                }
              }
            }
          }
          reverseFieldOfficeNode(
            filter: {conditions: [
              {field: "type", value: ["vba_facility_service"]},
              {field: "status", value: ["1"]}
            ]},
            limit: 500
          ) {
            entities {
              ... on NodeVbaFacilityService {
                entityId
                entityLabel
                title
                reverseFieldVbaServiceRegionsTaxonomyTerm {
                  entities {
                    entityLabel
                  }
                }
                fieldServiceLocation {
                  entity {
                    entityId
                    ... on ParagraphServiceLocation {
                      id
                      entityId
                      fieldHours
                      ${appointmentServiceLocationItems}
                      fieldOfficeHours {
                        starthours
                        endhours
                        day
                        comment
                        allDay
                      }
                      fieldUseMainFacilityPhone
                      fieldPhone {
                        entity {
                          ... on ParagraphPhoneNumber {
                            fieldPhoneNumber
                            fieldPhoneNumberType
                            fieldPhoneExtension
                            fieldPhoneLabel
                          }
                        }
                      }
                      fieldAdditionalHoursInfo
                      fieldEmailContacts {
                        entity {
                          id
                          ... on ParagraphEmailContact {
                            id
                            fieldEmailAddress
                            fieldEmailLabel
                          }
                        }
                      }
                      fieldServiceLocationAddress {
                        targetId
                        entity {
                          ... on ParagraphServiceLocationAddress {
                            id
                            fieldAddress {
                              addressLine1
                              addressLine2
                              administrativeArea
                              countryCode
                              postalCode
                              locality
                            }
                            fieldBuildingNameNumber
                            fieldClinicName
                            fieldUseFacilityAddress
                            fieldWingFloorOrRoomNumber
                          }
                        }
                      }
                    }
                  }
                }
                entityBundle
                fieldServiceNameAndDescripti {
                  entity {
                    name
                    tid
                    entityId
                    entityLabel
                    entityBundle
                    ... on TaxonomyTermHealthCareServiceTaxonomy {
                      fieldFacilityServiceHeader
                      fieldRegionalServiceHeader
                      fieldFacilityServiceDescripti
                      fieldRegionalServiceDescripti
                      fieldShowForVbaFacilities
                      fieldVbaTypeOfCare
                      fieldOnlineSelfService {
                        title
                        url {
                          path
                        }
                        uri
                      }
                      fieldVbaServiceDescrip
                      description {
                        value
                        format
                        processed
                      }
                    }
                  }
                }
              }
            }
          }
          reverseFieldVbaRegionFacilityListNode (
            filter: {conditions: [
              {field: "status", value: ["1"]}
            ]},
            limit: 500
          ){
            count
            entities {
              entityId
              entityLabel
              ... on NodeServiceRegion {
                entityBundle
                fieldServiceNameAndDescripti {
                  entity {
                    name
                    tid
                    entityId
                    entityLabel
                    entityBundle
                    ... on TaxonomyTermHealthCareServiceTaxonomy {
                      fieldFacilityServiceHeader
                      fieldRegionalServiceHeader
                      fieldFacilityServiceDescripti
                      fieldRegionalServiceDescripti
                      fieldShowForVbaFacilities
                      fieldVbaTypeOfCare
                      fieldOnlineSelfService {
                        title
                        url {
                          path
                        }
                        uri
                      }
                      fieldVbaServiceDescrip
                      description {
                        value
                        format
                        processed
                      }
                    }
                  }
                }
                fieldServiceLocation {
                  entity {
                    entityId
                    ... on ParagraphServiceLocation {
                      id
                      entityId
                      ${appointmentServiceLocationItems}
                      fieldHours
                      fieldAdditionalHoursInfo
                      fieldOfficeHours {
                        starthours
                        endhours
                        day
                        comment
                        allDay
                      }
                      fieldUseMainFacilityPhone
                      fieldPhone {
                        entity {
                          ... on ParagraphPhoneNumber {
                            fieldPhoneNumberType
                            fieldPhoneNumber
                            fieldPhoneExtension
                            fieldPhoneLabel
                          }
                        }
                      }
                      fieldAdditionalHoursInfo
                      fieldEmailContacts {
                        entity {
                          id
                          ... on ParagraphEmailContact {
                            id
                            fieldEmailAddress
                            fieldEmailLabel
                          }
                        }
                      }
                      fieldServiceLocationAddress {
                        targetId
                        entity {
                          ... on ParagraphServiceLocationAddress {
                            id
                            fieldAddress {
                              addressLine1
                              addressLine2
                              administrativeArea
                              countryCode
                              postalCode
                              locality
                            }
                            fieldBuildingNameNumber
                            fieldClinicName
                            fieldUseFacilityAddress
                            fieldWingFloorOrRoomNumber
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
      }`;

const getVbaFacilitySlice = (operationName, offset, limit) => {
  return `
    ${vbaFacilityFragment}

    query GetVbaFacilitys${
      !draftContentOverride ? '($onlyPublishedContent: Boolean!)' : ''
    } {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        filter: {
          conditions: [
            ${
              !draftContentOverride
                ? '{ field: "status", value: ["1"], enabled: $onlyPublishedContent },'
                : ''
            }
            { field: "type", value: ["vba_facility"] }
          ]
        }) {
        entities {
          ... vbaFacilityFragment
        }
      }
    }
`;
};

const getVbaFacilityQueries = entityCounts => {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetVbaFacility',
    entitiesPerSlice: 25,
    totalEntities: entityCounts.data.vbaFacilities.count,
    getSlice: getVbaFacilitySlice,
  });
};

module.exports = {
  fragment: vbaFacilityFragment,
  getVbaFacilityQueries,
};
