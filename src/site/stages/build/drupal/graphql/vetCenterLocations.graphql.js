const {
  derivativeImage,
} = require('./paragraph-fragments/derivativeMedia.paragraph.graphql');

const draftContentOverride = process.env.UNPUBLISHED_CONTENT === 'true';

const vetCenterLocationsFragment = `
fragment vetCenterLocationsFragment on NodeVetCenterLocationsList {
  entityId
  entityUrl {
    path
    routed
  }
  title
  entityMetatags {
    __typename
    key
    value
  }
  entityBundle
  entityLabel
  fieldIntroText
  fieldLastSavedByAnEditor
  fieldNearbyMobileVetCenters {
    entity {
      ... on NodeVetCenter {
        title
        entityBundle
        fieldOfficialName
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
        fieldFacilityLocatorApiId
        fieldAddress {
          locality
          administrativeArea
          postalCode
          addressLine1
          organization
        }
        fieldPhoneNumber
        ${derivativeImage('_32MEDIUMTHUMBNAIL')}
      }
      ... on NodeVetCenterOutstation {
        title
        entityBundle
        fieldOfficialName
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
        fieldFacilityLocatorApiId
        fieldAddress {
          locality
          administrativeArea
          postalCode
          addressLine1
          organization
        }
        fieldPhoneNumber
        ${derivativeImage('_32MEDIUMTHUMBNAIL')}
      }
      ... on NodeVetCenterCap {
        title
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
        fieldFacilityLocatorApiId
        entityBundle
        fieldAddress {
          locality
          administrativeArea
          postalCode
          addressLine1
          organization
        }
        ${derivativeImage('_32MEDIUMTHUMBNAIL')}
      }
      ... on NodeVetCenterMobileVetCenter {
        title
        entityBundle
        fieldFacilityLocatorApiId
        fieldAddress {
          locality
          administrativeArea
          postalCode
          addressLine1
          organization
        }
        fieldPhoneNumber
        ${derivativeImage('_32MEDIUMTHUMBNAIL')}
      }
    }
  }
  fieldOffice {
    entity {
      ... on NodeVetCenter {
        reverseFieldOfficeNode(limit: 500, filter: {
          conditions: [
            { field: "type", value: ["vet_center_outstation", "vet_center_cap", "vet_center_mobile_vet_center"] },
            { field: "status", value: ["1"], enabled: $onlyPublishedContent }
          ]}) {
          entities {
            ... on NodeVetCenterCap {
              title
              entityBundle
              fieldFacilityLocatorApiId
              fieldVetcenterCapHoursOptIn
              fieldOperatingStatusFacility
              fieldOperatingStatusMoreInfo
              ${derivativeImage('_32MEDIUMTHUMBNAIL')}
              fieldAddress {
                locality
                administrativeArea
                postalCode
                addressLine1
                addressLine2
                organization
              }
              fieldOfficeHours {
                day
                starthours
                endhours
                comment
              }
            }
            ... on NodeVetCenterOutstation {
              fieldOfficeHours {
                day
                starthours
                endhours
                comment
              }
              title
              entityBundle
              fieldFacilityLocatorApiId
              fieldOfficialName
              fieldOperatingStatusFacility
              fieldOperatingStatusMoreInfo
              ${derivativeImage('_32MEDIUMTHUMBNAIL')}
              fieldAddress {
                locality
                administrativeArea
                postalCode
                addressLine1
                addressLine2
                organization
              }
              fieldPhoneNumber
            }
            ... on NodeVetCenterMobileVetCenter {
              title
              entityBundle
              fieldFacilityLocatorApiId
              ${derivativeImage('_32MEDIUMTHUMBNAIL')}
              fieldAddress {
                locality
                administrativeArea
                postalCode
                addressLine1
                addressLine2
                organization
              }
              fieldPhoneNumber
            }
          }
        }
        title
        fieldAddress {
          countryCode
          administrativeArea
          locality
          postalCode
          addressLine1
          addressLine2
          organization
        }
        fieldFacilityLocatorApiId
        fieldPhoneNumber
        fieldOfficialName
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
        ${derivativeImage('_32MEDIUMTHUMBNAIL')}
        fieldOfficeHours {
          starthours
          endhours
          day
          comment
        }
      }
    }
  }
}`;

const GetVetCenterLocations = `
  ${vetCenterLocationsFragment}

  query GetVetCenterLocations${
    !draftContentOverride ? '($onlyPublishedContent: Boolean!)' : ''
  } {
    nodeQuery(limit: 1000, filter: {
      conditions: [
        ${
          !draftContentOverride
            ? '{ field: "status", value: ["1"], enabled: $onlyPublishedContent },'
            : ''
        }
        { field: "type", value: ["vet_center_locations_list"] }
      ]
    }) {
      entities {
        ... vetCenterLocationsFragment
      }
    }
  }
`;

module.exports = {
  fragment: vetCenterLocationsFragment,
  GetVetCenterLocations,
};
