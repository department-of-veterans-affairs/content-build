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
  entityBundle
  entityLabel
  fieldIntroText
  fieldNearbyVetCenters {
    entity {
      ... on NodeVetCenter {
        fieldFacilityLocatorApiId
        entityPublished
        title
        entityBundle
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
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
        fieldFacilityLocatorApiId
        entityPublished
        title
        entityBundle
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
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
        fieldFacilityLocatorApiId
        entityPublished
        title
        entityBundle
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
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
        fieldFacilityLocatorApiId
        entityPublished
        title
        entityBundle              
        fieldAddress {
          locality
          administrativeArea
          postalCode
          addressLine1
          addressLine2          
          organization
        }      
        fieldPhoneNumber
        ${derivativeImage('_32MEDIUMTHUMBNAIL')}                            
      }              
    } 
  }
  fieldNearbyMobileVetCenters {
    entity {
      ... on NodeVetCenter {
        title
        entityBundle
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
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
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
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
        reverseFieldOfficeNode(limit: 500, filter: {conditions: [{field: "type", value: ["vet_center_outstation", "vet_center_cap", "vet_center_mobile_vet_center"]}]}) {
          entities {
            ... on NodeVetCenterCap {
              title
              entityBundle
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
            }
            ... on NodeVetCenterOutstation {
              title
              entityBundle
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
        fieldPhoneNumber
        fieldOperatingStatusFacility
        fieldOperatingStatusMoreInfo
        ${derivativeImage('_32MEDIUMTHUMBNAIL')}
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
