Cypress.Commands.add('checkElements', (page, automateNearby) => {
  cy.visit(page);
  cy.get('h1').contains('Locations');
  cy.get('h2').contains('Main location');
  cy.get('h3 a').contains('Escanaba Vet Center');
  cy.get('h4').contains('Address');
  cy.get('a').contains('Directions on Google Maps');
  cy.get('h4').contains('Phone');
  cy.get('h2').contains('Satellite locations');
  cy.get('h2#other-near-locations').contains('Other nearby Vet Centers');

  if (automateNearby) {
    cy.get('h3').contains('Traverse City Vet Center');
  } else {
    cy.get('h3').contains('Green Bay Vet Center');
  }
});

const manualNearbyFalseFeatureToggles = {
  data: {
    type: 'feature_toggles',
    features: [
      {
        name: 'facilities_vet_center_automate_nearby',
        value: false,
      },
    ],
  },
};

const automatedNearbyFeatureToggles = {
  data: {
    type: 'feature_toggles',
    features: [
      {
        name: 'facilities_vet_center_automate_nearby',
        value: true,
      },
    ],
  },
};

const manualData = {
  data: [
    {
      id: 'vc_0441V',
      type: 'facility',
      attributes: {
        access: {},
        activeStatus: 'A',
        address: {
          mailing: {},
          physical: {
            zip: '54304',
            city: 'Green Bay',
            state: 'WI',
            address1: '1600 South Ashland Avenue',
            address2: null,
            address3: null,
          },
        },
        classification: null,
        detailedServices: null,
        facilityType: 'vet_center',
        feedback: {},
        hours: {
          friday: '800AM-430PM',
          monday: '800AM-430PM',
          sunday: 'Closed',
          tuesday: '800AM-430PM',
          saturday: 'Closed',
          thursday: '800AM-430PM',
          wednesday: '800AM-430PM',
        },
        id: 'vc_0441V',
        lat: 44.500671,
        long: -88.039521,
        mobile: false,
        name: 'Green Bay Vet Center',
        operatingStatus: {
          code: 'LIMITED',
          additionalInfo:
            "We're currently open for limited in-person service, and screening all visitors for symptoms, due to the coronavirus COVID-19. For individual and group counseling, we recommend using our telehealth services. If you need to talk with someone confidentially, please call us anytime 24/7 at 877-927-8387.",
        },
        operationalHoursSpecialInstructions:
          'If you need to talk to someone or get advice right away, call the Vet Center anytime at 1-877-WAR-VETS (1-877-927-8387).',
        phone: {
          fax: '920-435-5086',
          main: '920-435-5650',
        },
        services: {},
        uniqueId: '0441V',
        visn: '12',
        website: null,
      },
    },
  ],
};

const automatedData = {
  data: [
    {
      id: 'vc_0434V',
      type: 'facility',
      attributes: {
        access: {},
        activeStatus: 'A',
        address: {
          mailing: {},
          physical: {
            zip: '49829',
            city: 'Escanaba',
            state: 'MI',
            address1: '3500 Ludington Street',
            address2: 'Suite 110',
            address3: null,
          },
        },
        classification: null,
        detailedServices: null,
        facilityType: 'vet_center',
        feedback: {},
        hours: {
          friday: '700AM-430PM',
          monday: '700AM-530PM',
          sunday: 'Closed',
          tuesday: '700AM-530PM',
          saturday: 'Closed',
          thursday: '700AM-530PM',
          wednesday: '700AM-530PM',
        },
        id: 'vc_0434V',
        lat: 45.74582402,
        long: -87.09797801,
        mobile: false,
        name: 'Escanaba Vet Center',
        operatingStatus: {
          code: 'NORMAL',
        },
        operationalHoursSpecialInstructions:
          'More hours are available for some services. To learn more, call our main phone number. | If you need to talk to someone or get advice right away, call the Vet Center anytime at 1-877-WAR-VETS (1-877-927-8387).',
        phone: {
          fax: '906-779-7455',
          main: '906-233-0244',
        },
        services: {},
        uniqueId: '0434V',
        visn: '12',
        website: 'https://www.va.gov/escanaba-vet-center/',
      },
    },
    {
      id: 'vc_0445V',
      type: 'facility',
      attributes: {
        access: {},
        activeStatus: 'A',
        address: {
          mailing: {},
          physical: {
            zip: '49684',
            city: 'Traverse City',
            state: 'MI',
            address1: '4960 Skyview Court',
            address2: null,
            address3: null,
          },
        },
        classification: null,
        detailedServices: null,
        facilityType: 'vet_center',
        feedback: {},
        hours: {
          friday: '800AM-430PM',
          monday: '800AM-430PM',
          sunday: 'Closed',
          tuesday: '800AM-430PM',
          saturday: 'Closed',
          thursday: '800AM-430PM',
          wednesday: '800AM-430PM',
        },
        id: 'vc_0445V',
        lat: 44.76051274,
        long: -85.65676572,
        mobile: false,
        name: 'Traverse City Vet Center',
        operatingStatus: {
          code: 'NORMAL',
        },
        operationalHoursSpecialInstructions:
          'More hours are available for some services. To learn more, call our main phone number. | If you need to talk to someone or get advice right away, call the Vet Center anytime at 1-877-WAR-VETS (1-877-927-8387).',
        phone: {
          fax: '231-935-0071',
          main: '231-935-0051',
        },
        services: {},
        uniqueId: '0445V',
        visn: '10',
        website: null,
      },
    },
  ],
};

describe('Vet Center Locations page - manual nearby', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '/v0/feature_toggles?*',
      manualNearbyFalseFeatureToggles,
    );
    cy.intercept('GET', '/v1/facilities/va?*', manualData);
    cy.intercept('GET', '/v0/maintenance_windows', []);
  });

  it('has expected elements on desktop', () => {
    cy.checkElements('/escanaba-vet-center/locations/', false);
  });

  it('has expected elements on mobile', () => {
    cy.viewport(481, 1000);
    cy.checkElements('/escanaba-vet-center/locations/', false);
  });
});

describe('Vet Center Locations page - automated nearby', () => {
  beforeEach(() => {
    cy.intercept('GET', '/v0/feature_toggles?*', automatedNearbyFeatureToggles);
    cy.intercept('GET', '/v1/facilities/va/*', automatedData);
    cy.intercept('GET', '/v0/maintenance_windows', []);
  });

  it('has expected elements on desktop', () => {
    cy.checkElements('/escanaba-vet-center/locations/', true);
  });

  it('has expected elements on mobile', () => {
    cy.viewport(481, 1000);
    cy.checkElements('/escanaba-vet-center/locations/', true);
  });
});
