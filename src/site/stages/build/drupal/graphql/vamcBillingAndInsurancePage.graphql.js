const healthCareRegionNonClinicialServices = require('./facilities-fragments/healthCareRegionNonClinicialServices.node.graphql');
const entityElementsFromPages = require('./entityElementsForPages.graphql');
const phoneNumberParagraphGraphql = require('./paragraph-fragments/phoneNumber.paragraph.graphql');

const billingAndInsuranceFragment = `
  fragment billingAndInsuranceFragment on NodeVamcSystemBillingInsurance {
    ${entityElementsFromPages}
    title
    status
    changed
    entityBundle
    entityUrl {
      path
    }
    fieldTelephone {
      ... on FieldNodeVamcSystemBillingInsuranceFieldTelephone {
        entity {
          ... phoneNumber
        }
      }
    }
    fieldOfficeHours {
      day
      starthours
      endhours
      comment
    }
    fieldCcAboveTopOfPage {
      fetched
      fetchedBundle
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
    fieldAdministration {
      entity{
        ... on TaxonomyTermAdministration {
          entityId
        }
      }
    }
  }
`;

const GetBillingAndInsurancePages = `
  ${phoneNumberParagraphGraphql}
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
