const path = require('path');

Cypress.Commands.add('verifyGoogleAnalytics', () => {
  const filePath = path.join(
    __dirname,
    '../../assets/js/google-analytics/',
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
  it('has the right elements and analytics', () => {
    cy.visit('/');
    expect(process.env.BUILDTYPE).to.equal('vagovprod');
    cy.log(`The build is ${process.env.BUILDTYPE}`);
    cy.verifyElementCount('[data-e2e="bucket"]', 4);
    cy.verifyElementCount('[data-e2e="hub"]', 11);
    cy.verifyElementCount('[data-e2e="news"]', 3);
    cy.verifyGoogleAnalytics();
  });
});
