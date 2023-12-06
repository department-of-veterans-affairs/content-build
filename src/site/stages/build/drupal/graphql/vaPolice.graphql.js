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
                entityLabel
                title
              }
            }
          }
          title
          entityLabel
          fieldCcFaq {
            fetched
          }
          fieldCcVaPoliceOverview {
            fetched
          }
          fieldCcTermDefinitionsNation {
            fetched
          }
          fieldCcPoliceReport{
            fetched
          }
          fieldAdministration {
            entity{
              name
              path {
                alias
                pid
                langcode
                pathauto
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
