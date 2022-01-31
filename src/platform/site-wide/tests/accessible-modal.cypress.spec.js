const overlay = '#modal-crisisline';
const firstModalItem = 'a[href="tel:18002738255"]';
const closeControl = '.va-crisis-panel.va-modal-inner button';
const secondOpenControl = '.homepage-button.vcl.va-overlay-trigger';
const lastModalItem = 'a[href="https://www.veteranscrisisline.net/"]';

describe('Accessible Modal Test', () => {
  it('Modal behaves appropriately in line with key presses', () => {
    cy.visit('/');
    cy.injectAxeThenAxeCheck();

    // Open modal
    cy.get(secondOpenControl)
      .focus()
      .realPress('Enter');

    // Trap backward traversal
    cy.get(firstModalItem)
      .should('be.focused')
      .repeatKey(['Shift', 'Tab'], 2);
    cy.get(lastModalItem).should('be.focused');

    // Trap forward traversal
    cy.realPress('Tab');
    cy.get(closeControl).should('be.focused');

    // Escape modal
    cy.realPress('Escape');
    cy.get(overlay).should('not.have.class', 'va-overlay--open');
    cy.get('body').should('not.have.class', 'va-pos-fixed');

    // REturn focus to appropriate open controls
    cy.get(secondOpenControl).should('be.focused');
  });
});
