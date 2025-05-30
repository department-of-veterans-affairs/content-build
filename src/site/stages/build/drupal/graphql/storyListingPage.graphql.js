/**
 * An event detail page
 * Example: /pittsburgh-health-care/events/example-event
 */
const entityElementsFromPages = require('./entityElementsForPages.graphql');

const storyListingPage = `
  fragment storyListingPage on NodeStoryListing {
    ${entityElementsFromPages}
    fieldIntroText
    reverseFieldListingNode(limit: 500, filter: {conditions: [{field: "type", value: "news_story"}, {field: "status", value: "1", operator: EQUAL}]}, sort: {field: "created", direction: DESC}) {
      entities {
        ... on NodeNewsStory {
          entityId
          title
          fieldFeatured
          entityUrl {
            path
          }
          uid {
            targetId
            ... on FieldNodeUid {
              entity {
                name
                timezone
              }
            }
          }
          promote
          created
          fieldAuthor {
            entity {
              ...on NodePersonProfile {
                title
                fieldDescription
              }
            }
          }
          fieldImageCaption
          fieldIntroText
          fieldMedia {
            entity {
              ... on MediaImage {
                image {
                  alt
                  title
                  derivative(style: _21MEDIUMTHUMBNAIL) {
                    url
                    width
                    height
                  }
                }
              }
            }
          }
          fieldFullStory {
            processed
          }
        }
      }
    }
    fieldOffice {
      targetId
      entity {
        title
        ... on NodeHealthCareRegionPage {
          entityId
          entityLabel
          title
          fieldVamcEhrSystem
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

const GetNodeStoryListingPages = `
  ${storyListingPage}

  query GetNodeStoryListingPages($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 1000, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["story_listing"] }
      ]
    }) {
      entities {
        ... storyListingPage
      }
    }
  }
`;

module.exports = {
  fragment: storyListingPage,
  GetNodeStoryListingPages,
};
