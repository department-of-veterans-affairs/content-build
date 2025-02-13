const {
  derivativeImage,
} = require('./paragraph-fragments/derivativeMedia.paragraph.graphql');
const { generatePaginatedQueries } = require('../individual-queries-helpers');

const draftContentOverride = process.env.UNPUBLISHED_CONTENT === 'true';

const vetCenterFragment = `
      fragment vetCenterFragment on NodeVetCenter {
        entityId
        entityUrl {
          path
          routed
        }
        entityMetatags {
          __typename
          key
          value
        }
        entityBundle
        entityLabel
        title
        fieldOfficialName
        fieldIntroText
        fieldFacilityLocatorApiId
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
        fieldLastSavedByAnEditor
        fieldVetCenterFeatureContent {
           entity {
                ... on ParagraphFeaturedContent {
                  fieldDescription {
                      value
                      format
                      processed
                  }
                  fieldSectionHeader
                  fieldCta {
                  targetId
                  targetRevisionId
                  entity {
                     ... on ParagraphButton {
                        fieldButtonLink {
                            uri
                            url {
                              path
                            }
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
        fieldCcVetCenterFeaturedCon {
          fetched
          fetchedBundle
        }
        fieldCcVetCenterFaqs {
          fetched
          fetchedBundle
        }
        fieldCcNonTraditionalHours {
          fetched
          fetchedBundle
        }
        fieldCcVetCenterCallCenter {
          fetched
          fetchedBundle
        }
        ${derivativeImage('_32MEDIUMTHUMBNAIL')}
        fieldPhoneNumber
        fieldAddress {
         countryCode
         locality
         postalCode
         administrativeArea
         addressLine1
         addressLine2
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
        # Other locations link:
        reverseFieldOfficeNode(limit: 500, filter:{conditions: [{field: "type", value: ["vet_center_locations_list"]}]}) {
          entities {
            ... on NodeVetCenterLocationsList {
              entityUrl {
                path
                routed
              }
            }
          }
        }        
        fieldPrepareForVisit {
          entity {
            ... on ParagraphBasicAccordion {
              entityBundle
              entityId
              fieldHeader
              fieldRichWysiwyg {
                processed
              }
            }
          }
        }        
        fieldHealthServices {
          entity {
            status
            ... on NodeVetCenterFacilityHealthServi {
             fieldBody {
                processed
              }
              fieldServiceNameAndDescripti {
                entity {
                  ... on TaxonomyTermHealthCareServiceTaxonomy {
                    name
                    fieldVetCenterTypeOfCare
                    fieldVetCenterFriendlyName
                    fieldAlsoKnownAs
                    fieldVetCenterComConditions
                    fieldCommonlyTreatedCondition
                    fieldVetCenterServiceDescrip
                    description {
                      processed
                    }
                  }
                }
              }
            }
          }
        }
        fieldMissionExplainer {
          fetched
        }
      }`;

const getVetCenterSlice = (operationName, offset, limit) => {
  return `
    ${vetCenterFragment}
    
    query GetVetCenters${
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
            { field: "type", value: ["vet_center"] }
          ]
        }) {
        entities {
          ... vetCenterFragment
        }
      }
    }
`;
};

const getVetCenterQueries = entityCounts => {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetVetCenter',
    entitiesPerSlice: 25,
    totalEntities: entityCounts.data.vetCenters.count,
    getSlice: getVetCenterSlice,
  });
};

module.exports = {
  fragment: vetCenterFragment,
  getVetCenterQueries,
};
