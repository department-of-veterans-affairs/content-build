const locationsOperatingStatus = `
  fragment locationsOperatingStatus on NodeHealthCareLocalFacility {
    entityId
    title
    fieldOperatingStatusFacility
    fieldOperatingStatusMoreInfo
    fieldRegionPage {
      targetId
    }
  }
`;

const GetLocationsOperatingStatus = `

  ${locationsOperatingStatus}

  query GetLocationsOperatingStatus($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 100000, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["health_care_local_facility"] }
      ]
    }) {
      entities {
        ... locationOperatingStatus
      }
    }
  }
`;

module.exports = {
  fragment: locationsOperatingStatus,
  GetLocationsOperatingStatus,
};
