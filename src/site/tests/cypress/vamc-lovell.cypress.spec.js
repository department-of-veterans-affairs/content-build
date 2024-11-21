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

describe('VAMC Lovell - All TRICARE pages with expected MHS Genesis Patient Portal Top Task have it', () => {
  it('TRICARE system has MHS Genesis Patient Portal link', () => {
    cy.visit('/lovell-federal-health-care-tricare/');
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'MHS Genesis Patient Portal',
      'https://my.mhsgenesis.health.mil/',
    );
    verifyActionLink(
      'View all health services',
      '/lovell-federal-health-care-tricare/health-services',
    );
    verifyActionLink(
      'Register for care',
      '/lovell-federal-health-care-tricare/register-for-care',
    );
  });

  it('TRICARE Health services has MHS Genesis Patient Portal link', () => {
    cy.visit('/lovell-federal-health-care-tricare/health-services');
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'MHS Genesis Patient Portal',
      'https://my.mhsgenesis.health.mil/',
    );
    verifyActionLink(
      'Register for care',
      '/lovell-federal-health-care-tricare/register-for-care',
    );
    verifyActionLink(
      'Learn about pharmacy services',
      '/lovell-federal-health-care-tricare/pharmacy',
    );
  });

  it('TRICARE Locations has MHS Genesis Patient Portal link', () => {
    cy.visit('/lovell-federal-health-care-tricare/locations');
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'MHS Genesis Patient Portal',
      'https://my.mhsgenesis.health.mil/',
    );
    verifyActionLink(
      'View all health services',
      '/lovell-federal-health-care-tricare/health-services',
    );
    verifyActionLink(
      'Register for care',
      '/lovell-federal-health-care-tricare/register-for-care',
    );
  });

  it('TRICARE Captain James A. Lovell Location has MHS Genesis Patient Portal link', () => {
    cy.visit(
      '/lovell-federal-health-care-tricare/locations/captain-james-a-lovell-federal-health-care-center/',
    );
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'MHS Genesis Patient Portal',
      'https://my.mhsgenesis.health.mil/',
    );
    verifyActionLink(
      'Register for care',
      '/lovell-federal-health-care-tricare/register-for-care',
    );
    verifyActionLink(
      'Learn about pharmacy services',
      '/lovell-federal-health-care-tricare/pharmacy',
    );
  });
});

describe('VAMC Lovell - All VA pages with expected Make an appointment Top Task have it', () => {
  it('VA system has Make an appointment link', () => {
    cy.visit('/lovell-federal-health-care-va/');
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'Make an appointment',
      '/lovell-federal-health-care-va/make-an-appointment',
    );
    verifyActionLink(
      'View all health services',
      '/lovell-federal-health-care-tricare/health-services',
    );
    verifyActionLink(
      'Register for care',
      '/lovell-federal-health-care-tricare/register-for-care',
    );
  });

  it('VA Health services has Make an appointment link', () => {
    cy.visit('/lovell-federal-health-care-va/health-services/');
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'Make an appointment',
      '/lovell-federal-health-care-va/make-an-appointment',
    );
    verifyActionLink(
      'Register for care',
      '/lovell-federal-health-care-tricare/register-for-care',
    );
    verifyActionLink(
      'Learn about pharmacy services',
      '/lovell-federal-health-care-tricare/pharmacy',
    );
  });

  it('VA Locations has Make an appointment link', () => {
    cy.visit('/lovell-federal-health-care-va/locations/');
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'Make an appointment',
      '/lovell-federal-health-care-va/make-an-appointment',
    );
    verifyActionLink(
      'View all health services',
      '/lovell-federal-health-care-tricare/health-services',
    );
    verifyActionLink(
      'Register for care',
      '/lovell-federal-health-care-tricare/register-for-care',
    );
  });

  it('VA Captain James A. Lovell Location has Make an appointment link', () => {
    cy.visit(
      '/lovell-federal-health-care-va/locations/captain-james-a-lovell-federal-health-care-center/',
    );
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'Make an appointment',
      '/lovell-federal-health-care-va/make-an-appointment',
    );
    verifyActionLink(
      'Register for care',
      '/lovell-federal-health-care-tricare/register-for-care',
    );
    verifyActionLink(
      'Learn about pharmacy services',
      '/lovell-federal-health-care-tricare/pharmacy',
    );
  });
});

describe('VAMC Lovell - VA Make an appointment page does not have TRICARE experience switcher', () => {
  it('VA Make an appointment page does not have TRICARE experience switcher', () => {
    cy.visit('/lovell-federal-health-care-va/make-an-appointment/');
    cy.injectAxeThenAxeCheck();
    cy.findByTestId('lovell-switch-link').should('not.exist');
  });
});
