/**
 * The 'Health Care Local Facility' bundle of the 'Content' entity type.
 */
const HEALTH_SERVICES_RESULTS = `
  entities {
    ... on NodeRegionalHealthCareServiceDes {
      entityId
      entityType
      fieldBody {
        processed
      }

      fieldLocalHealthCareService {
        entity {
          ...on NodeHealthCareLocalHealthService {
            status
            fieldFacilityLocation {
              entity {
                ... on NodeHealthCareLocalFacility {
                  entityUrl {
                    ... on EntityCanonicalUrl {
                      path
                    }
                  }
                  title
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

      fieldServiceNameAndDescripti {
        entity {
          ... on TaxonomyTermHealthCareServiceTaxonomy {
            weight
            entityId
            entityBundle
            fieldAlsoKnownAs
            fieldCommonlyTreatedCondition
            name
            description {
              processed
            }
            parent {
              entity {
                ...on TaxonomyTermHealthCareServiceTaxonomy {
                  weight
                  name
                }
              }
            }

          }
        }
      }
    }
  }
`;

module.exports = `
  fieldClinicalHealthServices: queryFieldClinicalHealthServices(limit:100) {
    ${HEALTH_SERVICES_RESULTS}
  }
`;
