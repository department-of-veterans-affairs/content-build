/**
 * Combines two common, sequentially called functions.
 */
Cypress.Commands.add('injectAxeThenAxeCheck', (context, tempOptions) => {
  Cypress.Commands.overwrite('injectAxe', () => {
    cy.readFile('node_modules/axe-core/axe.min.js').then(source => {
      return cy.window({ log: false }).then(window => {
        window.eval(source);
      });
    });
  });

  cy.injectAxe();

  // axeCheck() context parameter defaults to 'main'
  // axeCheck() tempOptions parameter defaults to {}
  if (tempOptions) {
    cy.axeCheck(context, tempOptions);
  } else if (context) {
    cy.axeCheck(context);
  } else {
    cy.axeCheck();
  }
});
