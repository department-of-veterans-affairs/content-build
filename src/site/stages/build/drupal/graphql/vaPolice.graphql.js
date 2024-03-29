const { generatePaginatedQueries } = require('../individual-queries-helpers');

const draftContentOverride = process.env.UNPUBLISHED_CONTENT === 'true';
const entityElementsFromPages = require('./entityElementsForPages.graphql');

const vaPoliceFragment = `
      fragment vaPoliceFragment on NodeVamcSystemVaPolice {
        ${entityElementsFromPages}
        ... on NodeVamcSystemVaPolice  {
          fieldOffice {
            entity {
              ... on NodeHealthCareRegionPage {
                entityId
                entityLabel
                title
                fieldVamcEhrSystem
              }
            }
          }
          title
          entityLabel
          fieldCcFaq {
            fetched
            fetchedBundle
          }
          fieldCcVaPoliceOverview {
            fetched
            fetchedBundle
          }
          fieldCcTermDefinitionsNation {
            fetched
            fetchedBundle
          }
          fieldCcTermDefinitions{
            fetched
            fetchedBundle
          }
          fieldCcPoliceReport{
            fetched
            fetchedBundle
          }
          fieldPhoneNumbersParagraph {
            entity {
              ... on ParagraphPhoneNumber {
                fieldPhoneExtension
                fieldPhoneLabel
                fieldPhoneNumber
                fieldPhoneNumberType
              }
            }
          }
          fieldAdministration {
            entity {
              ... on TaxonomyTermAdministration {
        	      entityId
        	      name
              }
            }
          }
        }
      }`;

const getVaPoliceSlice = (operationName, offset, limit) => {
  return `
    ${vaPoliceFragment}

    query GetVaPolicePages${
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
            { field: "type", value: ["vamc_system_va_police"] }
          ]
        }) {
        entities {
          ... vaPoliceFragment
        }
      }
    }
`;
};

const getVaPoliceQueries = entityCounts => {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetVaPolicePages',
    entitiesPerSlice: 25,
    totalEntities: entityCounts.data.vaPolicePage.count,
    getSlice: getVaPoliceSlice,
  });
};

module.exports = {
  fragment: vaPoliceFragment,
  getVaPoliceQueries,
};
