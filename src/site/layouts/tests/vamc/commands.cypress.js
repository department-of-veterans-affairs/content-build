Cypress.Commands.add('checkSideNav', isMobile => {
  if (isMobile) {
    cy.get('#sidenav-menu').should('be.visible');
  } else {
    cy.get('#sidenav-menu').should('not.be.visible');
  }
});
