import { expect } from 'chai';

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

    cy.findByText('MHS Genesis Patient Portal').then(el => {
      const attr = el.attr('href');
      expect(attr).to.equal('https://my.mhsgenesis.health.mil/');
    });
  });

  it('TRICARE Health services has MHS Genesis Patient Portal link', () => {
    cy.visit('/lovell-federal-health-care-tricare/health-services');
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'MHS Genesis Patient Portal',
      'https://my.mhsgenesis.health.mil/',
    );
  });

  it('TRICARE Locations has MHS Genesis Patient Portal link', () => {
    cy.visit('/lovell-federal-health-care-tricare/locations');
    cy.injectAxeThenAxeCheck();

    cy.findByText('MHS Genesis Patient Portal').then(el => {
      const attr = el.attr('href');
      expect(attr).to.equal('https://my.mhsgenesis.health.mil/');
    });
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
  });
});

describe('VAMC Lovell - All VA pages with expected Make an appointment Top Task have it', () => {
  it('VA system has Make an appointment link', () => {
    cy.visit('/lovell-federal-health-care-va/');
    cy.injectAxeThenAxeCheck();

    cy.findByText('Make an appointment').then(el => {
      const attr = el.attr('href');
      expect(attr.endsWith('make-an-appointment')).to.be.true;
    });
  });

  it('VA Health services has Make an appointment link', () => {
    cy.visit('/lovell-federal-health-care-va/health-services/');
    cy.injectAxeThenAxeCheck();

    verifyActionLink(
      'Make an appointment',
      '/lovell-federal-health-care-va/make-an-appointment',
    );
  });

  it('VA Locations has Make an appointment link', () => {
    cy.visit('/lovell-federal-health-care-va/locations/');
    cy.injectAxeThenAxeCheck();

    cy.findByText('Make an appointment').then(el => {
      const attr = el.attr('href');
      expect(attr.endsWith('make-an-appointment')).to.be.true;
    });
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
  });
});

describe('VAMC Lovell - VA Make an appointment page does not have TRICARE experience switcher', () => {
  it('VA Make an appointment page does not have TRICARE experience switcher', () => {
    cy.visit('/lovell-federal-health-care-va/make-an-appointment/');
    cy.injectAxeThenAxeCheck();
    cy.findByTestId('lovell-switch-link').should('not.exist');
  });
});
