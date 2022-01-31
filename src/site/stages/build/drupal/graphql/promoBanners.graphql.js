/**
 * The promo banners that appear above content.
 */

const promoBanners = `
 promoBanners: nodeQuery(filter: { conditions: [{ field: "status", value: "1", operator: EQUAL }, { field: "type", value: "promo_banner" }] }) {
   entities {
     ... on NodePromoBanner {
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
   }
 }
 `;

const GetPromoBanners = `
  query {
    ${promoBanners}
  }
 `;

module.exports = {
  GetPromoBanners,
  partialQuery: promoBanners,
};
