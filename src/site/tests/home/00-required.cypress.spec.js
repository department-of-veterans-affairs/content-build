// gtm_auth values must match src/site/assets/js/google-analytics/*.js (see google-analytics.liquid).
const GTM_AUTH_MARKER_DEV = 'gtm_auth=N9BisSDKAwJENFQtQIEvXQ';
const GTM_AUTH_MARKER_STAGING = 'gtm_auth=inC4EKQce9vlWpRVcowiyQ';

Cypress.Commands.add('verifyGoogleAnalytics', () => {
  const envBuildtype = Cypress.env('buildtype') || 'vagovdev';
  const effective = envBuildtype === 'localhost' ? 'vagovdev' : envBuildtype;

  const analyticsScript = () => cy.get('[data-e2e="analytics-script"]');

  if (effective === 'vagovprod') {
    analyticsScript()
      .should('contain', 'GTM-WFJWBD')
      .should('contain', 'googletagmanager.com/gtm.js')
      .should('not.contain', 'gtm_auth');
    return;
  }

  const gtmAuthMarker =
    effective === 'vagovstaging'
      ? GTM_AUTH_MARKER_STAGING
      : GTM_AUTH_MARKER_DEV;

  analyticsScript().should('contain', gtmAuthMarker);
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
