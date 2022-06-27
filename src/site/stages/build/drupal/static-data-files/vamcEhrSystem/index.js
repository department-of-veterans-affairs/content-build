const query = `
  query($onlyPublishedContent: Boolean!) {
    nodeQuery(
      limit: 250,
      filter: {
        conditions: [
          { field: "status", value: "1", enabled: $onlyPublishedContent},
          { field: "type", value: "health_care_local_facility" },
          { field: "field_main_location", value: "1" },
          { field: "field_region_page.entity.field_vamc_ehr_system", value: ["cerner", "cerner_staged"], operator: IN }
        ]
      }
    ) {
      count,
      entities {
        ... on NodeHealthCareLocalFacility {
          title,
          fieldFacilityLocatorApiId,
          fieldRegionPage {
            entity {
              title,
              ... on NodeHealthCareRegionPage {
                fieldVamcEhrSystem
              }
            }
          },
        }
      }
    }
  }
`;

const postProcess = queryResult => {
  // Ex:
  // return queryResult?.data?.nodeQueries?.entities?.slice(0, 2);

  return queryResult;
};

module.exports = {
  query,
  postProcess,
};
