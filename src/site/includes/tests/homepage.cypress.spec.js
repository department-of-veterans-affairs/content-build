import features from './mocks/features';

describe('home page', () => {
  const verifyElement = selector =>
    cy
      .get(selector)
      .should('exist')
      .should('be.visible');

  const verifyHiddenElement = selector => cy.get(selector).should('exist');

  const verifyText = (selector, text) =>
    cy
      .get(selector)
      .should('exist')
      .should('be.visible')
      .contains(text);

  const verifyLinkWithoutSelector = (index, text, href) =>
    cy
      .get('a')
      .eq(index)
      .should('be.visible')
      .should('contain.text', text)
      .should('have.attr', 'href')
      .and('include', href);

  // Used for selecting buttons that don't have easy selectors on them
  const verifyButtonText = (index, text) =>
    cy
      .get('button')
      .eq(index)
      .should('exist')
      .should('be.visible')
      .contains(text);

  Cypress.config({
    includeShadowDom: true,
    waitForAnimations: true,
    pageLoadTimeout: 120000,
    baseUrl: 'http://localhost:3002',
  });

  beforeEach(() => {
    cy.intercept('/v0/feature_toggles*', features).as('features');
    cy.intercept('/v0/maintenance_windows', {
      data: [],
    }).as('maintenanceWindows');
    cy.intercept('POST', 'https://www.google-analytics.com/*', {}).as(
      'analytics',
    );
  });

  describe('loading basic page elements', () => {
    it('should correctly load all of the page elements', () => {
      cy.visit('/');
      cy.injectAxeThenAxeCheck();

      // Global header ==============================================
      verifyElement('.header');

      const header = () => cy.get('.header');

      header()
        .scrollIntoView()
        .within(() => {
          verifyElement('.va-header-logo-wrapper');
          verifyElement('.sitewide-search-drop-down-panel-button');
          verifyLinkWithoutSelector(1, 'Contact us', '/contact-us');
          verifyElement('.sign-in-nav');
          verifyElement('.va-crisis-line');
        });

      // Hero =======================================================
      verifyElement('.homepage-hero');

      const hero = () => cy.get('.homepage-hero');

      hero()
        .scrollIntoView()
        .within(() => {
          verifyText('.homepage-hero__welcome-headline', 'Welcome to VA.gov');
        });

      // Common tasks ===============================================
      verifyElement('.homepage-common-tasks');

      const commonTasks = () => cy.get('.homepage-common-tasks');

      commonTasks()
        .scrollIntoView()
        .within(() => {
          verifyElement('#search-tools-header');
          verifyElement('[data-widget-type="homepage-search"]');

          verifyText('#top-pages', 'Top pages');
        });

      // News section ===============================================
      verifyElement('[data-e2e="news"]');

      const news = () => cy.get('[data-e2e="news"]');

      news()
        .scrollIntoView()
        .within(() => {
          verifyText('#va------------news', 'VA NEWS');
        });

      // Benefits hub section =======================================
      verifyElement('[data-e2e="hubs"]');

      const hubs = () => cy.get('[data-e2e="hubs"]');

      hubs()
        .scrollIntoView()
        .within(() => {
          verifyText(
            '#explore-va-benefits-and-health',
            'Explore VA benefits and health care',
          );
        });

      // Feedback button ============================================
      verifyElement('.last-updated');

      const feedbackSection = () => cy.get('.last-updated');

      feedbackSection()
        .scrollIntoView()
        .within(() => {
          verifyButtonText(0, 'Feedback');
        });

      // Email signup ===============================================
      verifyElement('.homepage-email-update-wrapper');

      const email = () => cy.get('.homepage-email-update-wrapper');

      email()
        .scrollIntoView()
        .within(() => {
          verifyHiddenElement('[name="email"]');
        });

      // Footer ====================================================
      verifyElement('.footer');
    });
  });
});
