describe('VAMC System - VA Police', () => {
  it('Has VA Police in the sidebar', () => {
    cy.visit('/maine-health-care');
    cy.injectAxeThenAxeCheck();
    cy.get('.va-sidenav')
      .find('.va-sidenav-level-1')
      .should('be.visible')
      .should('have.length', 3);
    cy.findByText('VA police')
      .should('be.visible')
      .click();
    cy.location('pathname', { timeout: 6000 }).should('include', '/va-police');
  });
  it('Has VA Police page', () => {
    cy.visit('/maine-health-care/va-police');
    cy.injectAxeThenAxeCheck();
    cy.contains('h1', 'VA police');
    cy.contains('.va-introtext', 'VA police officers');
    cy.get('va-on-this-page')
      .shadow()
      .find('a')
      .should('have.length', 3);
  });
});
