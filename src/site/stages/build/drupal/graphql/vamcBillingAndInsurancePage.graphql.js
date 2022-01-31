const healthCareRegionNonClinicialServices = require('./facilities-fragments/healthCareRegionNonClinicialServices.node.graphql');

const billingAndInsuranceFragment = `
  fragment billingAndInsuranceFragment on NodeVamcSystemBillingInsurance {
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
    fieldCcBottomOfPageContent {
      fetched
      fetchedBundle
    }
    fieldCcRelatedLinks {
      fetched
      fetchedBundle
    }
    fieldOffice {
      ${healthCareRegionNonClinicialServices}
    }
  }
`;

const GetBillingAndInsurancePages = `
  ${billingAndInsuranceFragment}

  query GetBillingAndInsurancePages($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 500, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["vamc_system_billing_insurance"] }
      ]
    }) {
      entities {
        ... billingAndInsuranceFragment
      }
    }
  }
`;

module.exports = {
  fragment: billingAndInsuranceFragment,
  GetBillingAndInsurancePages,
};
