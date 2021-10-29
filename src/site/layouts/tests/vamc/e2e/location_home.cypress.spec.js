import path from 'path';
import mockFacilityData from '../fixtures/mock-facility-data-v1.json';
import './commands.cypress';

Cypress.Commands.add('checkElements', (page, isMobile) => {
  cy.visit(page);
  // TODO: Determine if this can be removed.
  // cy.get('#modal-announcement-title').should('exist');
  // cy.get('button')
  //   .contains('Continue to the website')
  //   .click()
  //   .then(() => {
  //     cy.get('#modal-announcement-title').should('not.exist');
  //   });
  cy.get('a.usa-button').contains('Make an appointment');
  cy.get('a.usa-button').contains('View all health services');
  cy.get('a.usa-button').contains('Register for care');
  cy.checkSideNav(isMobile);
  cy.get('#sidebar-nav-trigger').should('not.exist');
  cy.get('h1').contains('Locations');
  cy.get('h2').contains('Main locations');
  cy.get('h2').contains('Health clinic locations');
  cy.get('h2').contains('Other nearby VA locations');
  cy.get('h3').contains('Pittsburgh VA Medical Center-University Drive');
  cy.get('h3').contains(
    'H. John Heinz III Department of Veterans Affairs Medical Center',
  );
});

describe('VAMC location home page', () => {
  before(function() {
    cy.syncFixtures({
      fixtures: path.join(__dirname, '../fixtures'),
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/v1/facilities/va/*', mockFacilityData);
    cy.intercept('GET', '/v0/feature_toggles?*', { data: { features: [] } });
  });

  it('has expected elements on desktop', () => {
    cy.checkElements('/pittsburgh-health-care/locations/', false);
  });

  it('has expected elements on mobile', () => {
    cy.viewport(481, 1000);
    cy.checkElements('/pittsburgh-health-care/locations/', true);
  });
});
