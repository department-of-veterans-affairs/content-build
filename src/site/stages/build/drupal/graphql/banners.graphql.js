/**
 * The banners that appear above content.
 */

const banners = `
banners: nodeQuery(limit: 500, filter: {conditions: [{ field: "status", value: "1", operator: EQUAL }, { field: "type", value: "banner" }]}) {
  entities {
    ... on NodeBanner {
      body {
        processed
      }
      entityBundle
      entityId
      entityPublished
      fieldAlertType
      fieldTargetPaths
      title
    }
  }
}
`;

const GetBanners = `
 query {
   ${banners}
 }
`;

module.exports = {
  GetBanners,
  partialQuery: banners,
};
