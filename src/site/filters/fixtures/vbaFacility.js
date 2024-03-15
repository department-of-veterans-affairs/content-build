// One item of reverseFieldOfficeNode.entities or reverseFieldVbaRegionFacilityListNode.entities array
const vbaRegionFacilityOrOfficeNode = fieldService => {
  return {
    entityId: '64397',
    entityLabel: 'Cleveland VA Regional Benefit Office - Veterans Pension',
    title: 'Cleveland VA Regional Benefit Office - Veterans Pension',
    reverseFieldVbaServiceRegionsTaxonomyTerm: {
      count: 1,
      entities: [
        {
          entityType: 'taxonomy_term',
          name: 'Home loans',
          tid: 1131,
          entityId: '1131',
          entityLabel: 'Home loans',
          fieldFacilityServiceHeader:
            'Get help requesting a COE or filling out paperwork',
          fieldRegionalServiceHeader:
            'Get help checking the status of your COE',
          fieldRegionalServiceDescripti:
            'Check the status of your COE by calling a VA home loan representative at a Regional Loan Center.',
          fieldShowForVbaFacilities: true,
          fieldVbaTypeOfCare: 'vba_veteran_benefits',
          fieldOnlineSelfService: {
            url: {
              path: '/housing-assistance/home-loans',
            },
            uri: 'entity:node/752',
          },
          fieldVbaServiceDescrip:
            'We can help you learn about eligibility for VA home loans and request a VA home loan Certificate of Eligibility (COE). \r\n\r\nIf you have a service-connected disability, we can help you find out if you’re eligible for housing grants.',
        },
      ],
    },
    entityBundle: 'vba_facility_service',
    fieldServiceLocation: [
      {
        entity: {
          fieldServiceLocationAddress: {
            entity: {
              fieldUseFacilityAddress: true,
              fieldAddress: {
                addressLine1: '',
                addressLine2: '',
                organization: null,
                additionalName: null,
                givenName: null,
                postalCode: '',
              },
            },
          },
          fieldUseMainFacilityPhone: true,
          fieldPhone: [
            {
              entity: {
                fieldPhoneNumber: '123-456-7890',
              },
            },
          ],
          fieldEmailContacts: [
            {
              entity: {
                entityLabel:
                  'Cleveland VA Regional Benefit Office - Veterans Pension > Service locations > Email contacts',
              },
            },
          ],
          fieldOfficeHours: [
            {
              day: 1,
              allDay: false,
              starthours: 600,
              endhours: 1000,
              comment: '',
            },
          ],
        },
      },
      {
        entity: {
          fieldServiceLocationAddress: {
            entity: {
              fieldUseFacilityAddress: true,
              fieldAddress: {
                addressLine1: '',
                addressLine2: '',
                organization: null,
                additionalName: null,
                givenName: null,
                postalCode: '',
              },
            },
          },
          fieldUseMainFacilityPhone: true,
          fieldPhone: [],
          fieldEmailContacts: [],
          fieldOfficeHours: [],
        },
      },
    ],
    fieldServiceNameAndDescripti: {
      entity: {
        name: 'Veterans Pension',
        entityBundle: 'health_care_service_taxonomy',
        fieldFacilityServiceDescripti: 'Pension description',
        fieldFacilityServiceHeader: 'Pension header',
        fieldVbaTypeOfCare: 'vba_veteran_benefits',
        fieldShowForVbaFacilities: true,
        fieldVbaServiceDescrip:
          'VA helps Veterans and their families cope with financial challenges by providing supplemental income through the Veterans Pension and Survivors Pension benefit programs.',
        description: {
          value: null,
          format: null,
          processed: '<html><head></head><body></body></html>',
        },
        ...fieldService,
      },
    },
  };
};

export { vbaRegionFacilityOrOfficeNode };
