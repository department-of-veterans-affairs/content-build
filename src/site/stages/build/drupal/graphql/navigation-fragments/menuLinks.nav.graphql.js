/**
 * The Menu Item Extras module allows us to add fields to menu items in Drupal
 * and exposes a query whereby we can request menu items with their associated fields.
 *
 */

const headerQuery = require('./header.nav.graphql');

const menuLinkContentQuery = `
  menuLinkContentQuery(limit: 5000, sort: {field: "weight"}, filter: {conditions: [{field: "enabled", value: "1"}, {field: "menu_name", value: "header-megamenu"}]}) {
    entities {
      entityId
      entityLabel
      ${headerQuery}
    }
  }
`;

const GetMenuLinks = `
  query {
    ${menuLinkContentQuery}
  }
`;

module.exports = {
  partialQuery: menuLinkContentQuery,
  GetMenuLinks,
};
