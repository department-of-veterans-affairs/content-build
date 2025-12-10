const verifyActionLink = (expectedText, expectedHref) =>
  cy
    .get('va-link-action')
    .eq(0)
    .shadow()
    .find('a')
    .should('be.visible')
    .should('have.text', expectedText)
    .should('have.attr', 'href')
    .and('include', expectedHref);

describe('VAMC Lovell - VA Make an appointment page does not have TRICARE experience switcher', () => {
  it('VA Make an appointment page does not have TRICARE experience switcher', () => {
    cy.visit('/lovell-federal-health-care-va/make-an-appointment/');
    cy.injectAxeThenAxeCheck();
    cy.findByTestId('lovell-switch-link').should('not.exist');
  });
});
