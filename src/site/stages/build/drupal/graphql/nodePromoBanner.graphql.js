const nodePromoBanner = `
fragment nodePromoBanner on NodePromoBanner {
  entityId
  entityPublished
  title
  fieldLink {
    url {
      path
      routed
    }
    title
  }
  fieldPromoType
  fieldTargetPaths
}
`;

const GetNodePromoBanner = `
  ${nodePromoBanner}

  query GetNodePromoBanner($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 1000, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["promo_banner"] }
      ]
    }) {
      entities {
        ... nodePromoBanner
      }
    }
  }
`;

module.exports = {
  fragment: nodePromoBanner,
  GetNodePromoBanner,
};
