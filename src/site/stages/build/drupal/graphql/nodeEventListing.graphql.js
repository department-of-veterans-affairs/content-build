// Relative imports.
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const nodeEvent = require('./nodeEvent.graphql');

// Create NodeEventListing fragment.
const nodeEventListing = `
  fragment nodeEventListing on NodeEventListing {
    ${entityElementsFromPages}
    changed
    title
    fieldIntroText
    entityId
    pastEvents: reverseFieldListingNode(limit: 5000, filter: { conditions: [{ field: "status", value: "1", operator: EQUAL, enabled: $onlyPublishedContent }, { field: "moderation_state", value: "archived", operator: NOT_EQUAL }, { field: "type", value: "event" }, { field: "field_datetime_range_timezone", value: [$today], operator: SMALLER_THAN }]}, sort: {field: "changed", direction: DESC}) {
      entities {
        ... nodeEvent
      }
    }
    reverseFieldListingNode(limit: 5000, filter: { conditions: [{ field: "status", value: "1", operator: EQUAL, enabled: $onlyPublishedContent }, { field: "moderation_state", value: "archived", operator: NOT_EQUAL }, { field: "type", value: "event" }]}, sort: {field: "changed", direction: DESC}) {
      entities {
        ... nodeEvent
      }
    }
    fieldOffice {
      entity {
        ...on NodeHealthCareRegionPage {
          entityLabel
        }
      }
    }
  }
`;

const GetNodeEventListingPage = `
  ${nodeEvent.fragment}
  ${nodeEventListing}

  query GetNodeEventListingPage($today: String!,$onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 5000, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["event_listing"] }
      ]
    }) {
      entities {
        ... nodeEventListing
      }
    }
  }
`;

module.exports = {
  fragment: nodeEventListing,
  GetNodeEventListingPage,
};
