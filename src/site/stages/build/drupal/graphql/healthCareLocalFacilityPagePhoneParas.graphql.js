const fragments = require('./fragments.graphql');
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const socialMediaFields = require('./facilities-fragments/healthCareSocialMedia.fields.graphql');
const serviceLocation = require('./paragraph-fragments/serviceLocation.paragraph.graphql');
const mhTelephonePara = require('./paragraph-fragments/mhTelephone.paragraph.graphql');
const appointmentItems = require('./file-fragments/appointmentItems.graphql');

const { generatePaginatedQueries } = require('../individual-queries-helpers');

const healthCareLocalFacilityPageFragmentPhoneParas = `
  fragment healthCareLocalFacilityPage on NodeHealthCareLocalFacility {
    ${entityElementsFromPages}
    changed
    fieldFacilityLocatorApiId
    title
    fieldIntroText
    fieldSupplementalStatus {
      entity {
        ... on TaxonomyTermFacilitySupplementalStatus {
          name
          fieldStatusId
          description {
            processed
          }
          fieldGuidance {
            processed
          }
        }
      }
    }
    fieldSupplementalStatusMoreI {
      value
      format
      processed
    }
    fieldOperatingStatusFacility
    fieldLocationServices {
      entity {
        ... on ParagraphHealthCareLocalFacilityServi {
          entityId
          entityBundle
          fieldTitle
          fieldWysiwyg {
            processed
          }
        }
      }
    }

    fieldAddress {
      addressLine1
      locality
      administrativeArea
      postalCode
    }
    fieldGeolocation {
      lat
      lon
    }
    fieldPhoneNumber
    ${mhTelephonePara}
    fieldOfficeHours {
      day
      starthours
      endhours
      comment
    }
    fieldMainLocation
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
    fieldRegionPage {
      entity {
        ... on NodeHealthCareRegionPage {
          fieldVamcEhrSystem
          entityBundle
          entityId
          entityPublished
          title
          fieldVaHealthConnectPhone
          fieldRelatedLinks {
            entity {
              ... listOfLinkTeasers
            }
          }
          ${socialMediaFields}
          fieldGovdeliveryIdEmerg
          fieldGovdeliveryIdNews
          fieldOperatingStatus {
            url {
              path
            }
          }
        }
      }
    }
    fieldLocalHealthCareService {
      entity {
        ... on NodeHealthCareLocalHealthService {
          status
          ${serviceLocation}
          ${appointmentItems}
          fieldAdministration {
            entity {
              name
            }
          }
          fieldRegionalHealthService
          {
            entity {
              ... on NodeRegionalHealthCareServiceDes {
                status
                entityBundle
                fieldBody {
                  processed
                }
                fieldServiceNameAndDescripti {
                  entity {
                    ... on TaxonomyTermHealthCareServiceTaxonomy {
                      entityId
                      entityBundle
                      fieldAlsoKnownAs
                      fieldCommonlyTreatedCondition
                      name
                      description {
                        processed
                      }
                      fieldTricareDescription
                      parent {
                        entity {
                          ...on TaxonomyTermHealthCareServiceTaxonomy {
                            name
                          }
                        }
                      }
                      fieldHealthServiceApiId
                    }
                  }
                }
              }
            }
          }
          fieldAdministration {
            entity{
              ... on TaxonomyTermAdministration {
                entityId
              }
            }
          }
        }
      }
    }
    fieldAdministration {
      entity{
        ... on TaxonomyTermAdministration {
          entityId
        }
      }
    }
  }
`;

function getNodeHealthCareLocalFacilityPagesSlice(
  operationName,
  offset,
  limit,
) {
  return `
    ${fragments.listOfLinkTeasers}
    ${fragments.linkTeaser}
    ${healthCareLocalFacilityPageFragmentPhoneParas}

    query ${operationName}($onlyPublishedContent: Boolean!) {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        sort: { field: "nid", direction:  ASC }
        filter: {
          conditions: [
            { field: "status", value: ["1"], enabled: $onlyPublishedContent },
            { field: "type", value: ["health_care_local_facility"] }
          ]
      }) {
        entities {
          ... healthCareLocalFacilityPage
        }
      }
    }
  `;
}

function getNodeHealthCareLocalFacilityPageQueries(entityCounts) {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetNodeHealthCareLocalFacilityPages',
    entitiesPerSlice: 25,
    totalEntities: entityCounts.data.healthCareLocalFacility.count,
    getSlice: getNodeHealthCareLocalFacilityPagesSlice,
  });
}

module.exports = {
  fragment: healthCareLocalFacilityPageFragmentPhoneParas,
  getNodeHealthCareLocalFacilityPageQueries,
};
