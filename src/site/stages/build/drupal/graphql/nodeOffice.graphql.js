// Relative imports.
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const nodeEvent = require('./nodeEvent.graphql');

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
        ... nodeEvent
      }
    }
  }
`;

const GetNodeOffices = `
  ${nodeEvent.fragment}
  ${nodeOffice}

  query GetNodeOffices($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 1000, filter: {
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

module.exports = {
  fragment: nodeOffice,
  GetNodeOffices,
};
