const path = require('path');

Cypress.Commands.add('verifyGoogleAnalytics', () => {
  const analyticsHTML = document.querySelector('[data-e2e="analytics-script"]')
    .innerHTML;
  cy.log(analyticsHTML);
  const filePath = path.join(
    __dirname,
    '../../assets/js/google-analytics/',
    `${process.env.BUILDTYPE || 'vagovdev'}.js`,
  );
  cy.readFile(filePath).then(str => {
    cy.get('[data-e2e="analytics-script"]').contains(str);
  });
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
