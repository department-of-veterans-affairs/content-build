// Relative imports.
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const nodeEvent = require('./nodeEvent.graphql');
const { generatePaginatedQueries } = require('../individual-queries-helpers');

// Create NodeOffice fragment.
const nodeOffice = `
  fragment nodeOffice on NodeOffice {
    ${entityElementsFromPages}
    changed
    title
    fieldDescription
    fieldBody { processed }
    reverseFieldOfficeNode {
      entities {
        ... nodeEventWithoutBreadcrumbs
      }
    }
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

function getNodeOfficeSlice(operationName, offset, limit) {
  return `
    ${nodeEvent.fragmentWithoutBreadcrumbs}
    ${nodeOffice}

    query ${operationName}($onlyPublishedContent: Boolean!) {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        sort: { field: "nid", direction:  ASC }
        filter: {
          conditions: [
            { field: "status", value: ["1"], enabled: $onlyPublishedContent },
            { field: "type", value: ["office"] }
          ]
      }) {
        entities {
          ... nodeOffice
        }
      }
    }
`;
}

function getNodeOfficeQueries(entityCounts) {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetNodeOffice',
    entitiesPerSlice: 25,
    totalEntities: entityCounts.data.office.count,
    getSlice: getNodeOfficeSlice,
  });
}

module.exports = {
  fragment: nodeOffice,
  getNodeOfficeQueries,
};
