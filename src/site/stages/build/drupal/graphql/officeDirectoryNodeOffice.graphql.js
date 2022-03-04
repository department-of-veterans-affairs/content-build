// Relative imports.
const { generatePaginatedQueries } = require('../individual-queries-helpers');

// Create NodeOffice fragment.
const officeDirectoryNodeOffice = `
  fragment officeDirectoryNodeOffice on NodeOffice {
    entityId
    title
    fieldOfficeId
    fieldParentOffice {
      entity {
        ...on NodeOffice {
          entityId
          title
        }
      }
    }
    reverseFieldParentOfficeNode {
      entities {
        ... on NodeOffice {
          entityId
          title
        }
      }
    }
  }
`;

function getOfficeDirectoryNodeOfficeSlice(operationName, offset, limit) {
  return `
    ${officeDirectoryNodeOffice}

    query ${operationName}($onlyPublishedContent: Boolean!) {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        sort: { field: "nid", direction:  ASC }
        filter: {
          conditions: [
            { field: "status", value: ["1"], enabled: $onlyPublishedContent },
            { field: "type", value: ["office"] },
            { field: "field_office_id", value: [null], operator: NOT_EQUAL }
          ]
      }) {
        entities {
          ... officeDirectoryNodeOffice
        }
      }
    }
`;
}

function getOfficeDirectoryNodeOfficeQueries(entityCounts) {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetOfficeDirectoryNodeOffice',
    entitiesPerSlice: 25,
    totalEntities: entityCounts.data.officeDirectoryOffice.count,
    getSlice: getOfficeDirectoryNodeOfficeSlice,
  });
}

module.exports = {
  fragment: officeDirectoryNodeOffice,
  getOfficeDirectoryNodeOfficeQueries,
};
