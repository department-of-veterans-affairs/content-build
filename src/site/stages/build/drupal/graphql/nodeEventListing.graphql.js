// Relative imports.
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const nodeEvent = require('./nodeEvent.graphql');
const { generatePaginatedQueries } = require('../individual-queries-helpers');

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
        ... nodeEventWithoutBreadcrumbs
      }
    }
    reverseFieldListingNode(limit: 5000, filter: { conditions: [{ field: "status", value: "1", operator: EQUAL, enabled: $onlyPublishedContent }, { field: "moderation_state", value: "archived", operator: NOT_EQUAL }, { field: "type", value: "event" }]}, sort: {field: "changed", direction: DESC}) {
      entities {
        ... nodeEventWithoutBreadcrumbs
      }
    }
    reverseFieldAdditionalListingsNode(limit: 5000, filter: { conditions: [{ field: "status", value: "1", operator: EQUAL, enabled: $onlyPublishedContent }, { field: "moderation_state", value: "archived", operator: NOT_EQUAL }, { field: "type", value: "event" }]}, sort: {field: "changed", direction: DESC}) {
      entities {
        ... nodeEventWithoutBreadcrumbs
      }
    }
    fieldOffice {
      entity {
        ...on NodeHealthCareRegionPage {
          entityLabel
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

function getNodeEventListingPageSlice(operationName, offset, limit) {
  return `
  ${nodeEvent.fragmentWithoutBreadcrumbs}
  ${nodeEventListing}

  query ${operationName}($today: String!,$onlyPublishedContent: Boolean!) {
    nodeQuery(limit: ${limit}, offset: ${offset}, filter: {
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
}

function getNodeEventListingQueries(entityCounts) {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetNodeEventListings',
    entitiesPerSlice: 5,
    totalEntities: entityCounts.data.eventListing.count,
    getSlice: getNodeEventListingPageSlice,
  });
}

module.exports = {
  fragment: nodeEventListing,
  getNodeEventListingQueries,
};
