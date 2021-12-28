/**
 * The top-level page for a health care region.
 * Example: /pittsburgh_health_care_system
 */
// Relative imports.
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const fragments = require('./fragments.graphql');
const healthCareLocalFacilities = require('./facilities-fragments/healthCareLocalFacility.node.graphql');
const healthCareRegionEvents = require('./facilities-fragments/healthCareRegionEvents.node.graphql');
const healthCareRegionHealthServices = require('./facilities-fragments/healthCareRegionHealthServices.node.graphql');
const healthCareRegionNewsStories = require('./facilities-fragments/healthCareRegionNewsStories.node.graphql');
const nodeEvent = require('./nodeEvent.graphql');
const socialMediaFields = require('./facilities-fragments/healthCareSocialMedia.fields.graphql');
const { generatePaginatedQueries } = require('../individual-queries-helpers');

// Create NodeHealthCareRegionPage fragment.
const nodeHealthCareRegionPage = `
  fragment healthCareRegionPage on NodeHealthCareRegionPage {
    ${entityElementsFromPages}
    ${healthCareRegionNewsStories}
    ${healthCareRegionEvents}
    title
    fieldMedia {
      entity {
        ... on MediaImage {
            image {
              alt
              title
              derivative(style: _72MEDIUMTHUMBNAIL) {
                  url
                  width
                  height
              }
            }
          }
      }
    }
    fieldVamcEhrSystem
    fieldGovdeliveryIdEmerg
    fieldGovdeliveryIdNews
    ${socialMediaFields}
    fieldIntroText
	  fieldRelatedLinks {
      entity {
      	... listOfLinkTeasers
      }
    }
    fieldOperatingStatus {
      url {
        path
      }
      title
    }
    reverseFieldRegionPageNode(limit: 100000, filter:{conditions:[{field: "type", value: "health_care_local_facility"}]}) {
      entities {
        ... on NodeHealthCareLocalFacility {
          title
          fieldOperatingStatusFacility
        }
      }
    }
    allPressReleaseTeasers: reverseFieldOfficeNode(filter: {
      conditions: [
        { field: "type", value: "press_release"}
        { field: "status", value: "1"}
      ]} sort: {field: "field_release_date", direction: DESC } limit: 100)
    {
      entities {
        ... on NodePressRelease {
          title
          entityUrl {
            path
          }
          fieldReleaseDate {
            value
          }
          fieldIntroText
        }
      }
    }
    ${healthCareLocalFacilities}
    fieldOtherVaLocations
    ${healthCareRegionHealthServices}
    eventTeasersAll: reverseFieldOfficeNode(limit: 1000, filter: {conditions: [{field: "type", value: "event_listing"}]}) {
      entities {
        ... on NodeEventListing {
          reverseFieldListingNode(sort: {field: "field_datetime_range_timezone", direction: ASC }, limit: 1, filter: {conditions: [{field: "type", value: "event"}, {field: "status", value: "1"}, { field: "field_datetime_range_timezone", value: [$today], operator: GREATER_THAN}]}) {
            entities {
              ... nodeEvent
            }
          }
        }
      }
    }
    eventTeasersFeatured: reverseFieldOfficeNode(limit: 1000, filter: {conditions: [{field: "type", value: "event_listing"}]}) {
      entities {
        ... on NodeEventListing {
          reverseFieldListingNode(limit: 5000, filter: {conditions: [{field: "type", value: "event"}, {field: "status", value: "1"}, {field: "field_featured", value: "1"}, { field: "field_datetime_range_timezone", value: [$today], operator: GREATER_THAN}]}) {
            entities {
              ... nodeEvent
            }
          }
        }
      }
    }
    newsStoryTeasersFeatured: reverseFieldOfficeNode(limit: 1000, filter: {conditions: [{field: "type", value: "story_listing"}]}) {
      entities {
        ... on NodeStoryListing {
          reverseFieldListingNode(limit: 1000, filter: {conditions: [{field: "type", value: "news_story"}, {field: "status", value: "1"}, {field: "field_featured", value: "1"}]}) {
            entities {
              ... on NodeNewsStory {
                title
                fieldFeatured
                fieldIntroText
                fieldMedia {
                  entity {
                    ... on MediaImage {
                      image {
                        alt
                        title
                        derivative(style: _32MEDIUMTHUMBNAIL) {
                          url
                          width
                          height
                        }
                      }
                    }
                  }
                }
                entityUrl {
                  path
                }
              }
            }
          }
        }
      }
    }
  }
`;

function getNodeHealthCareRegionPageSlice(operationName, offset, limit) {
  return `
    ${fragments.linkTeaser}
    ${fragments.listOfLinkTeasers}
    ${nodeEvent.fragment}
    ${nodeHealthCareRegionPage}

    query ${operationName}($today: String!, $onlyPublishedContent: Boolean!) {
      nodeQuery(
        limit: ${limit}
        offset: ${offset}
        sort: { field: "nid", direction:  ASC }
        filter: {
          conditions: [
            { field: "status", value: ["1"], enabled: $onlyPublishedContent },
            { field: "type", value: ["health_care_region_page"] }
          ]
      }) {
        entities {
          ... healthCareRegionPage
        }
      }
    }
`;
}

function getNodeHealthCareRegionPageQueries(entityCounts) {
  return generatePaginatedQueries({
    operationNamePrefix: 'GetNodeHealthCareRegionPage',
    entitiesPerSlice: 5,
    totalEntities: entityCounts.data.healthCareRegionPage.count,
    getSlice: getNodeHealthCareRegionPageSlice,
  });
}

module.exports = {
  fragment: nodeHealthCareRegionPage,
  getNodeHealthCareRegionPageQueries,
};
