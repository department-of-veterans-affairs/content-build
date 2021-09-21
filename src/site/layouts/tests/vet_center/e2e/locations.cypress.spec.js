// Cypress.Commands.add('checkElements', (page, isMobile) => {
//   cy.visit(page);
// });

describe('Vet Center Locations page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/v0/feature_toggles?*', []);
    cy.intercept('GET', '/v0/maintenance_windows', []);
  });

  it('renders expected elements on mobile', () => {});
});
