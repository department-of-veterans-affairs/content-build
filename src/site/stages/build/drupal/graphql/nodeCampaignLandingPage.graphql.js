// Relative imports.
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const fragments = require('./fragments.graphql');
const nodeEvent = require('./nodeEvent.graphql');
const {
  modifiedFragment: landingPageFragment,
} = require('./landingPage.graphql');

// Create NodeCampaignLandingPage fragment.
const nodeCampaignLandingPage = `
  fragment nodeCampaignLandingPage on NodeCampaignLandingPage {
    ${entityElementsFromPages}
    changed
    entityId
    entityBundle
    title
    fieldBenefitCategories {
      entity {
        entityType
        entityBundle
        entityId
        ... landingPage
      }
    }
    fieldClpAudience {
      entity {
        entityType
        entityBundle
        entityId
        ... on TaxonomyTermAudienceBeneficiaries {
          name
        }
        ... on TaxonomyTermAudienceNonBeneficiaries {
          name
        }
      }
    }
    fieldClpEventsHeader
    fieldClpEventsPanel
    fieldClpEventsReferences {
      entity {
        ... nodeEventWithoutBreadcrumbs
      }
    }
    fieldClpFaqCta {
      entity {
        entityType
        entityBundle
        entityId
        ... button
      }
    }
    fieldClpFaqPanel
    fieldClpFaqParagraphs {
      entity {
        entityType
        entityBundle
        entityId
        ... on ParagraphQA {
          fieldAnswer {
            entity {
              entityType
              entityBundle
              entityId
              ... on ParagraphWysiwyg {
                fieldWysiwyg {
                  value
                  format
                  processed
                }
              }
            }
          }
          fieldQuestion
        }
      }
    }
    fieldClpReusableQA {
      entity {
        entityType
        entityBundle
        entityId
        ... on ParagraphQAGroup {
          fieldSectionHeader
          fieldRichWysiwyg {
            processed
          }
          fieldAccordionDisplay
          queryFieldQAs {
            entities {
              entityId
              entityLabel
              entityBundle
              ... on NodeQA {
                fieldAnswer {
                  entity {
                    entityBundle
                    entityId
                    ... on ParagraphRichTextCharLimit1000 {
                      fieldWysiwyg {
                        processed
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    fieldClpResources {
      entity {
        entityType
        entityBundle
        entityId
        ... on MediaDocumentExternal {
          name
          fieldDescription
          fieldMediaExternalFile {
            uri
          }
          fieldMediaInLibrary
          fieldMimeType
        }
      }
    }
    fieldClpResourcesCta {
      entity {
        entityType
        entityBundle
        entityId
        ... button
      }
    }
    fieldClpResourcesHeader
    fieldClpResourcesIntroText
    fieldClpResourcesPanel
    fieldClpSpotlightCta {
      entity {
        entityType
        entityBundle
        entityId
        ... button
      }
    }
    fieldClpSpotlightHeader
    fieldClpSpotlightIntroText
    fieldClpSpotlightLinkTeasers {
      entity {
        entityType
        entityBundle
        entityId
        ... on ParagraphLinkTeaser {
          fieldLink {
            uri
            title
          }
          fieldLinkSummary
        }
      }
    }
    fieldClpSpotlightPanel
    fieldClpStoriesCta {
      uri
      title
    }
    fieldClpStoriesHeader
    fieldClpStoriesIntro
    fieldClpStoriesPanel
    fieldClpStoriesTeasers {
      entity {
        entityType
        entityBundle
        entityId
        ... on ParagraphLinkTeaserWithImage {
          fieldLinkTeaser {
            entity {
              ... on ParagraphLinkTeaser {
                fieldLink {
                  uri
                  title
                }
                fieldLinkSummary
              }
            }
          }
          fieldMedia {
            entity {
              ... on Media {
                name
                thumbnail {
                  derivative(style: _32MEDIUMTHUMBNAIL) {
                    url
                    width
                    height
                  }
                  targetId
                  title
                }
              }
              ... on MediaImage {
                image {
                  alt
                }
              }
            }
          }
        }
      }
    }
    fieldClpVideoPanel
    fieldClpVideoPanelHeader
    fieldClpVideoPanelMoreVideo {
      entity {
        entityType
        entityBundle
        entityId
        ... button
      }
    }
    fieldClpWhatYouCanDoHeader
    fieldClpWhatYouCanDoIntro
    fieldClpWhatYouCanDoPromos {
      entity {
        entityType
        entityBundle
        entityId
        ... on BlockContentPromo {
          fieldImage {
            entity {
              ... on Media {
                name
                thumbnail {
                  derivative(style: _32MEDIUMTHUMBNAIL) {
                    url
                    width
                    height
                  }
                  targetId
                  title
                }
              }
              ... on MediaImage {
                image {
                  alt
                }
              }
            }
          }
          fieldPromoLink {
            entity {
              entityType
              entityBundle
              entityId
              ... on ParagraphLinkTeaser {
                fieldLink {
                  uri
                  title
                }
                fieldLinkSummary
              }
            }
          }
        }
      }
    }
    fieldClpWhyThisMatters
    fieldHeroBlurb
    fieldHeroImage {
      entity {
        entityType
        entityBundle
        entityId
        ... on MediaImage {
          image {
            derivative(style: CROPSQUARE) {
              height
              url
              width
            }
            targetId
            title
          }
        }
        ... on MediaImage {
          image {
            alt
          }
        }
      }
    }
    fieldMedia {
      entity {
        entityType
        entityBundle
        entityId
        ... on MediaVideo {
          fieldDescription
          fieldDuration
          fieldMediaVideoEmbedField
          fieldPublicationDate {
            date
            value
          }
        }
      }
    }
    fieldPrimaryCallToAction {
      entity {
        entityType
        entityBundle
        entityId
        ... button
      }
    }
    fieldRelatedOffice {
      entity {
        ... on NodeOffice {
          fieldExternalLink {
            url {
              path
            }
            title
          }
          fieldEmailUpdatesLink {
            url {
              path
            }
            title
          }
          fieldSocialMediaLinks {
            platformValues
          }
        }
      }
    }
    fieldSecondaryCallToAction {
      entity {
        entityType
        entityBundle
        entityId
        ... button
      }
    }
  }
`;

const GetCampaignLandingPages = `
  ${fragments.button}
  ${fragments.promo}
  ${fragments.listOfLinkTeasers}
  ${fragments.linkTeaser}
  ${fragments.alert}
  ${nodeEvent.fragmentWithoutBreadcrumbs}
  ${landingPageFragment}
  ${nodeCampaignLandingPage}

  query GetCampaignLandingPages($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 100, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["campaign_landing_page"] }
      ]
    }) {
      entities {
        ... nodeCampaignLandingPage
      }
    }
  }
`;

module.exports = {
  fragment: nodeCampaignLandingPage,
  GetCampaignLandingPages,
};
