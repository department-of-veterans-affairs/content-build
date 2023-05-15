/**
 * Global footer from Drupal.
 * GetFooterColumns represents the first 3 columns of footer data
 * GetBottomRail represents the bottom section of links beginning with Accessibility
 */

const getLinksFragment = `
  fragment MenuItem on MenuLink {
    expanded
    description
    label
    url {
      path
    }
    entity {
      parent
      ... on MenuLinkContent {
        linkedEntity(language_fallback: true, bypass_access_check: true) {
          ... on Node {
            entityPublished
            moderationState
          }
        }
      }
    }
  }
`;

const GetFooterColumns = `
  ${getLinksFragment}
  query {
    vaGovFooterQuery:menuByName(name: "va-gov-footer") {
      name
      description
      links {
        ...MenuItem
        links {
          ...MenuItem
        }
      }
    }
  }
`;

const GetBottomRail = `
  ${getLinksFragment}
  query {
    vaGovFooterBottomRailQuery:menuByName(name: "footer-bottom-rail") {
      name
      description
      links {
        ...MenuItem
        links {
          ...MenuItem
        }
      }
    }
  }
`;

module.exports = {
  GetFooterColumns,
  GetBottomRail,
};
