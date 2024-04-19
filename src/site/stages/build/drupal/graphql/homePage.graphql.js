/**
 * Home page
 */

const hubListMenu = 'home-page-hub-list';
const hubListCreateAccountQueue = 'v2_home_page_create_account';
const homePageHeroQueue = 'home_page_hero';
const homePageNewsSpotlightQueue = 'home_page_news_spotlight';
const homePagePopularLinksMenu = 'popular-on-va-gov';
const otherSearchToolsMenu = 'other-search-tools';

const linksQueryPartial = `
  name
  links {
    label
    url {
      path
    }
  }
`;
const query = `
  homePageHubListMenuQuery:menuByName(name: "${hubListMenu}") {
    name
    description
    links {
      ... on MenuLink {
        enabled
        label
        url {
          path
        }
        entity {
          parent
          ... on MenuLinkContentHomePageHubList {
            fieldIcon
            fieldLinkSummary
            linkedEntity(language_fallback: true, bypass_access_check: true) {
              ... on Node {
                entityPublished
                moderationState
              }
            }
          }
        }
      }
    }
  }
  homePageHeroQuery: entitySubqueueById(id: "${homePageHeroQueue}") {
    ... on EntitySubqueueHomePageHero {
      itemsOfEntitySubqueueHomePageHero {
        entity {
          ... on BlockContentBenefitPromo {
            entityId
            entityLabel
            fieldPromoHeadline
            fieldPromoText
            fieldPromoCta {
              entity {
                ... on ParagraphButton {
                  fieldButtonLink {
                    url {
                      path
                    }
                  }
                  fieldButtonLabel
                }
              }
            }
          }
        }
      }
    }
  }
  homePageNewsSpotlightQuery: entitySubqueueById(id: "${homePageNewsSpotlightQueue}") {
    ... on EntitySubqueueHomePageNewsSpotlight {
      itemsOfEntitySubqueueHomePageNewsSpotlight {
        entity {
          ... on BlockContentNewsPromo {
            entityId
            entityLabel
            fieldPromoHeadline
            fieldPromoText
            fieldLink {
              url {
                path
              }
            }
            fieldLinkLabel
            fieldImage {
              entity {
                ... on MediaImage {
                  image {
                    alt
                    derivative(style: CROPSQUARE) {
                      url
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
  homePagePopularOnVaGovMenuQuery:  menuByName(name: "${homePagePopularLinksMenu}") {
    ${linksQueryPartial}
  }
  homePageOtherSearchToolsMenuQuery:  menuByName(name: "${otherSearchToolsMenu}") {
    ${linksQueryPartial}
  }
  homePageCreateAccountQuery: entitySubqueueById(id: "${hubListCreateAccountQueue}") {
    ... on EntitySubqueueV2HomePageCreateAccount {
      itemsOfEntitySubqueueV2HomePageCreateAccount {
        entity {
          entityId
          ... on BlockContentCtaWithLink {
            entityId
            entityLabel
            fieldCtaSummaryText
            fieldPrimaryCtaButtonText
            fieldRelatedInfoLinks {
              title
              url {
                path
              }
            }
          }
        }
      }
    }
  }
`;

const GetHomepage = `
  query {
    ${query}
  }
`;

module.exports = {
  partialQuery: query,
  GetHomepage,
};
