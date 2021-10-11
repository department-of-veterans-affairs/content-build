/**
 * The alerts that appear above content.
 */

const partialQuery = `
    alerts:   blockContentQuery(filter: {conditions: [{field: "type", value: "alert"}, {field: "status", value: "1"}]},
    sort: {field: "field_node_reference", direction: DESC}
    limit: 100) {
    entities {
      ... on BlockContentAlert {
        id
        entityPublished
        fieldAlertType
        fieldAlertTitle
        fieldAlertContent {
          entity {
            entityRendered
          }
        }
      }
    }
  }
`;

const GetAlerts = `
  query {
    ${partialQuery}
  }
`;

module.exports = {
  partialQuery,
  GetAlerts,
};
