const path = require('path');

Cypress.Commands.add('verifyGoogleAnalytics', () => {
  const filePath = path.join(
    'content-build',
    __dirname,
    '..',
    '..',
    'assets/js/google-analytics/',
    `${Cypress.env('buildtype') || 'vagovdev'}.js`,
  );
  cy.readFile(filePath).then(str => {
    cy.get('[data-e2e="analytics-script"]')
      .invoke('html')
      .then(value => {
        expect(value.replace(/\s/g, '')).to.contain(str.replace(/\s/g, ''));
      });
  });
});

Cypress.Commands.add('verifyElementCount', (selector, expectedLength) => {
  cy.get(selector).should('have.length', expectedLength);
});

describe('Homepage Test', () => {
  it('has the right analytics', () => {
    cy.visit('/');
    cy.injectAxeThenAxeCheck();
    cy.verifyGoogleAnalytics();
  });
  it('has the right elements', () => {
    cy.visit('/');
    cy.verifyElementCount('[data-e2e="hero"]', 1);
    cy.verifyElementCount('[data-e2e="common"]', 1);
    cy.verifyElementCount('[data-e2e="news"]', 1);
    cy.verifyElementCount('[data-e2e="hubs"]', 1);
    cy.injectAxeThenAxeCheck();
  });
});
