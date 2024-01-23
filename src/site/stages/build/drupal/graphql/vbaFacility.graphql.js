const { generatePaginatedQueries } = require('../individual-queries-helpers');

const draftContentOverride = process.env.UNPUBLISHED_CONTENT === 'true';
const entityElementsFromPages = require('./entityElementsForPages.graphql');

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
          reverseFieldVbaRegionFacilityListNode {
            count
            entities {
              entityId
              entityLabel
              ... on NodeServiceRegion {
                entityBundle
                reverseFieldVbaServiceRegionsTaxonomyTerm {
                  count
                  entities {
                    entityType
                    ... on TaxonomyTermHealthCareServiceTaxonomy {
                      name
                      tid
                      entityId
                      entityLabel
                      fieldFacilityServiceHeader
                      fieldRegionalServiceHeader
                      fieldRegionalServiceDescripti
                      fieldShowForVbaFacilities
                      fieldVbaTypeOfCare
                      fieldOnlineSelfService {
                        url {
                          path
                        }
                        uri
                      }
                      fieldVbaServiceDescrip
                    }
                  }
                }
              }
            }
          }
          reverseFieldOfficeNode(
            filter: {conditions: [{field: "type", value: ["vba_facility_service"]}]}
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
                    ... on ParagraphServiceLocation {
                      fieldServiceLocationAddress {
                        entity {
                          ... on ParagraphServiceLocationAddress {
                            fieldUseFacilityAddress
                            fieldAddress {
                              addressLine1
                              addressLine2
                              organization
                              additionalName
                              givenName
                              postalCode
                            }
                          }
                        }
                      }
                      fieldUseMainFacilityPhone
                      fieldPhone {
                        entity {
                          ... on ParagraphPhoneNumber {
                            fieldPhoneNumber
                          }
                        }
                      }
                      fieldEmailContacts {
                        ... on FieldParagraphServiceLocationFieldEmailContacts {
                          entity {
                            entityLabel
                          }
                        }
                      }
                      fieldOfficeHours {
                        day
                        allDay
                        starthours
                        endhours
                        comment
                      }
                      fieldUseMainFacilityPhone
                    }
                  }
                }
                entityBundle
                fieldServiceNameAndDescripti {
                  entity {
                    name
                    entityBundle
                    ... on TaxonomyTermHealthCareServiceTaxonomy {
                      fieldFacilityServiceDescripti
                      fieldFacilityServiceHeader
                      fieldVbaTypeOfCare
                      fieldShowForVbaFacilities
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
          reverseFieldVbaRegionFacilityListNode {
            count
            entities {
              ... on NodeServiceRegion {
                entityId
                entityLabel
                reverseFieldVbaServiceRegionsTaxonomyTerm {
                  count
                  entities {
                    ... on TaxonomyTermHealthCareServiceTaxonomy {
                      entityId
                      entityLabel
                      fieldRegionalServiceHeader
                      fieldRegionalServiceDescripti
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
