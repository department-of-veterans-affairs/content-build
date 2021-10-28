const medicalRecordsOfficeFragment = `
  fragment medicalRecordsOfficeFragment on NodeVamcSystemMedicalRecordsOffi {
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
    fieldCcGetRecordsInPerson {
      fetched
      fetchedBundle
    }
    fieldCcReactWidget {
      fetched
      fetchedBundle
    }
    fieldCcGetRecordsMailOrFax {
      fetched
      fetchedBundle
    }
    fieldCcHowWeShareRecords {
      fetched
      fetchedBundle
    }
    fieldCcFaqs {
      fetched
      fetchedBundle
    }
    fieldCcRelatedLinks {
      fetched
      fetchedBundle
    }
    fieldOffice {
      entity {
        ... on NodeHealthCareRegionPage {
          entityLabel
          title
        }
      }
    }
  }
`;

const GetMedicalRecordsOfficePages = `
  ${medicalRecordsOfficeFragment}
  
query GetMedicalRecordsOfficePages($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 500, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },      
        { field: "type", value: ["vamc_system_medical_records_offi"] }
      ]
    }) {
      entities {
        ... medicalRecordsOfficeFragment
      }
    }
  }
`;

module.exports = {
  fragment: medicalRecordsOfficeFragment,
  GetMedicalRecordsOfficePages,
};
