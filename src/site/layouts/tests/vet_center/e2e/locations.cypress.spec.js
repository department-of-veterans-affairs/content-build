import { automatedData, automatedNearbyFeatureToggles } from './fixtures/data';

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
