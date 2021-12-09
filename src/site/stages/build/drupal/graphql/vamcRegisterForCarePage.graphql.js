const healthCareRegionNonClinicialServices = require('./facilities-fragments/healthCareRegionNonClinicialServices.node.graphql');

const registerForCareFragment = `
  fragment registerForCareFragment on NodeVamcSystemRegisterForCare {
    title
    status
    changed
    entityBundle
    entityUrl {
      path
    }
    fieldCcTopOfPageContent {
      fetched
      fetchedBundle
    }
    fieldCcRelatedLinks {
      fetched
      fetchedBundle
    }
    fieldCcBottomOfPageContent {
      fetched
      fetchedBundle
    }
    fieldOffice {
      ${healthCareRegionNonClinicialServices}
    }
  }
`;

const GetRegisterForCarePages = `
  ${registerForCareFragment}
  
query GetRegisterForCarePages($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 500, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },      
        { field: "type", value: ["vamc_system_register_for_care"] }
      ]
    }) {
      entities {
        ... registerForCareFragment
      }
    }
  }
`;

module.exports = {
  fragment: registerForCareFragment,
  GetRegisterForCarePages,
};
