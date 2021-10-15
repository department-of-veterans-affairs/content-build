const medicalRecordsFragment = `
  fragment medicalRecordsFragment on NodeVamcSystemMedicalRecords {
    title
    status
    entityBundle
    fieldOffice {
      entity {
        ... on NodeHealthCareRegionPage {
          entityLable
          title
        }
      }
    }
  }
`;

const GetMedicalRecordsPages = `
  ${medicalRecordsFragment}
  
query GetMedicalRecordsPages($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 500, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },      
        { field: "type", value: ["vamc_system_medical_records_page"] }
      ]
    }) {
      entities {
        ... medicalRecordsFragment
      }
    }
  }
`;

module.exports = {
  fragment: medicalRecordsFragment,
  GetMedicalRecordsPages,
};
