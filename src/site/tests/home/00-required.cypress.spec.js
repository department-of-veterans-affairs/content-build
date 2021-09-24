const path = require('path');

Cypress.Commands.add('verifyGoogleAnalytics', () => {
  const filePath = path.join(
    __dirname,
    '../../assets/js/google-analytics/',
    `${process.env.BUILDTYPE}.js`,
  );
  cy.get('[data-e2e="analytics-script"]').should(
    'contain',
    cy.readFile(filePath),
  );
});

Cypress.Commands.add('verifyElementCount', (selector, expectedLength) => {
  cy.get(selector).should('have.length', expectedLength);
});

describe('Homepage Test', () => {
  it('has the right elements and analytics', () => {
    cy.visit('/');

    cy.verifyElementCount('[data-e2e="bucket"]', 4);
    cy.verifyElementCount('[data-e2e="hub"]', 11);
    cy.verifyElementCount('[data-e2e="news"]', 3);
    cy.verifyGoogleAnalytics();
  });
});
