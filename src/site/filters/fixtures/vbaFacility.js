const vbaFacilityOfficeNode = fieldService => {
  return {
    entityId: '64141',
    entityLabel: 'Cleveland VA Regional Benefit Office - Veterans Pension',
    title: 'Cleveland VA Regional Benefit Office - Veterans Pension',
    reverseFieldVbaServiceRegionsTaxonomyTerm: {
      entities: [],
    },
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
          fieldPhone: [],
          fieldEmailContacts: [],
          fieldOfficeHours: [],
        },
      },
    ],
    entityBundle: 'vba_facility_service',
    fieldServiceNameAndDescripti: {
      entity: {
        name: 'Veterans Pension',
        entityBundle: 'health_care_service_taxonomy',
        fieldFacilityServiceDescripti: null,
        fieldFacilityServiceHeader: null,
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

const vbaRegionFacilityNode = taxonomy => {
  return {
    entityId: '61786',
    entityLabel: 'Regional Loan Center in Cleveland',
    entityBundle: 'service_region',
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
          ...taxonomy,
        },
      ],
    },
  };
};

export { vbaFacilityOfficeNode, vbaRegionFacilityNode };
