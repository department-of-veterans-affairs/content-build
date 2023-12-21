describe('VAMC System - VA Police Sidebar', () => {
  it('Has VA Police in the sidebar', () => {
    cy.visit('/maine-health-care');
    cy.injectAxeThenAxeCheck();
    cy.get('.va-sidenav')
      .find('.va-sidenav-level-1')
      .should('be.visible')
      .should('have.length', 3);
    cy.findByText('VA police').should('be.visible');
  });
});
