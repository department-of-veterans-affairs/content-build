const entityElementsFromPages = require('./entityElementsForPages.graphql');

const vamcOperatingStatusAndAlerts = `
  fragment vamcOperatingStatusAndAlerts on NodeVamcOperatingStatusAndAlerts {
    ${entityElementsFromPages}
    title
    nid
    fieldOffice {
      targetId
      entity {
        ... on NodeHealthCareRegionPage {
          entityLabel
          reverseFieldRegionPageNode(limit: 100000, filter:{conditions:[{field: "status", value: ["1"]},{field: "type", value: "health_care_local_facility"}]}) {
            entities {
              ... on NodeHealthCareLocalFacility {
                title
                entityId
                fieldSupplementalStatus {
                  entity {
                    ... on TaxonomyTermFacilitySupplementalStatus {
                      name
                      fieldStatusId
                      description {
                        processed
                      }
                      fieldGuidance {
                        processed
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    fieldLinks {
      uri
      title
    }
    fieldOperatingStatusEmergInf {
      processed
    }
    fieldBannerAlert {
      entity {
        ... on NodeFullWidthBannerAlert {
          status
          title
          fieldBannerAlertSituationinfo {
            processed
          }
          fieldSituationUpdates {
            entity {
              entityId
              ... on ParagraphSituationUpdate {
                fieldDatetimeRangeTimezone {
                  value
                  startTime
                  endValue
                  endTime
                  timezone
                }
                fieldWysiwyg {
                  processed
                }
              }
            }
          }
          fieldBody {
            processed
          }
        }
      }
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

const GetNodeVamcOperatingStatusAndAlerts = `

  ${vamcOperatingStatusAndAlerts}

  query GetNodeVamcOperatingStatusAndAlerts($onlyPublishedContent: Boolean!) {
    nodeQuery(limit: 500, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: $onlyPublishedContent },
        { field: "type", value: ["vamc_operating_status_and_alerts"] }
      ]
    }) {
      entities {
        ... vamcOperatingStatusAndAlerts
      }
    }
  }
`;

module.exports = {
  fragment: vamcOperatingStatusAndAlerts,
  GetNodeVamcOperatingStatusAndAlerts,
};
