Cypress.Commands.add('checkElements', page => {
  cy.visit(page);
  cy.get('#other-resources,#related-information').should('exist');
  cy.get('.field_related_links')
    .find('a')
    .its('length')
    .should('be.gte', 1);
});

describe.skip('VAMC health services detail page', () => {
  const pagesToTest = [
    '/pittsburgh-health-care/health-services/caregiver-support',
    '/pittsburgh-health-care/health-services/homeless-veteran-care',
    '/pittsburgh-health-care/health-services/lgbt-veteran-care',
    '/pittsburgh-health-care/health-services/mental-health-care',
    '/pittsburgh-health-care/health-services/minority-veteran-care',
    '/pittsburgh-health-care/health-services/patient-advocates',
    '/pittsburgh-health-care/health-services/returning-service-member-care',
    '/pittsburgh-health-care/health-services/suicide-prevention',
    '/pittsburgh-health-care/health-services/women-veteran-care',
  ];

  pagesToTest.forEach(page => {
    it(`${page} has expected elements on mobile`, () => {
      cy.viewport(481, 1000);
      cy.checkElements(page, true);
    });

    it(`${page} has expected elements on desktop`, () => {
      cy.checkElements(page, false);
    });
  });
});
