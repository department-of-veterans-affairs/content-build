import features from './mocks/features';

describe('home page', () => {
  const verifyElement = selector =>
    cy
      .get(selector)
      .should('exist')
      .should('be.visible');

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

  const verifyLink = (index, linkText, href) => {
    const link = () => cy.get('a').eq(index);

    link()
      .scrollIntoView()
      .should('exist')
      .should('be.visible')
      .contains(linkText)
      .should('have.attr', 'href')
      .and('include', href);
  };

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
          verifyElement('#vetnav');
          verifyElement('.va-crisis-line');

          verifyElement('[data-e2e-id="va-benefits-and-health-care-0"]');
          verifyElement('[data-e2e-id="about-va-1"]');
          verifyElement('[data-e2e-id="find-a-va-location-2"]');
          verifyElement('[data-e2e-id="my-va-3"]');
        });

      // Hero =======================================================
      verifyElement('.homepage-hero');

      const hero = () => cy.get('.homepage-hero');

      hero()
        .scrollIntoView()
        .within(() => {
          verifyText('.homepage-hero__welcome-headline', 'Welcome to VA.gov');

          verifyLinkWithoutSelector(
            0,
            'Learn what the PACT Act means for you',
            '/the-pact-act-and-your-va-benefits',
          );

          verifyText(
            '#the-pact-act-and-your-va-benef',
            'The PACT Act and your VA benefits',
          );

          verifyLinkWithoutSelector(
            1,
            'Learn how an account helps you',
            '/creating-an-account-for-vagov',
          );

          verifyText('#create-an-account-to-manage-yo', 'Create an account');
          verifyButtonText(0, 'Create account');
        });

      // Common tasks ===============================================
      verifyElement('.homepage-common-tasks');

      const commonTasks = () => cy.get('.homepage-common-tasks');

      commonTasks()
        .scrollIntoView()
        .within(() => {
          verifyElement('#search-tools-header');
          verifyElement('[data-widget-type="homepage-search"]');

          verifyText('#other-search-tools', 'Other search tools');
          verifyLink(0, 'Find a VA location', '/find-locations');
          verifyLink(1, 'Find a VA form', '/find-forms');
          verifyLink(2, 'Find benefit resources and support', '/resources');

          verifyText('#top-pages', 'Top pages');
          verifyLink(
            3,
            'Check your claim or appeal status',
            '/claim-or-appeal-status',
          );
          verifyLink(4, 'Review your payment history', '/va-payment-history');
          verifyLink(
            5,
            'File for disability compensation',
            '/file-disability-claim-form-21-526ez',
          );
          verifyLink(
            6,
            'Schedule or manage health appointments',
            '/schedule-view-va-appointments',
          );
          verifyLink(
            7,
            'Refill or track a prescription',
            '/refill-track-prescriptions',
          );
          verifyLink(8, 'Compare GI Bill benefits', '/gi-bill-comparison-tool');
          verifyLink(
            9,
            'Get mental health care',
            '/health-needs-conditions/mental-health',
          );
          verifyLink(
            10,
            'Review or update your dependents',
            '/view-change-dependents',
          );
          verifyLink(
            11,
            'Get reimbursed for travel pay',
            '/get-reimbursed-for-travel-pay',
          );
          verifyLink(
            12,
            'Get your VA medical records',
            '/health-care/get-medical-records',
          );
        });

      // News section ===============================================
      verifyElement('[data-e2e="news"]');

      const news = () => cy.get('[data-e2e="news"]');

      news()
        .scrollIntoView()
        .within(() => {
          verifyText('#va------------news', 'VA NEWS');
          verifyText(
            '#vas-mission-to-better-serve-al a',
            'mission to better serve all',
          );
          verifyLinkWithoutSelector(
            1,
            'Read the full article',
            '/vas-mission-to-better-serve-all',
          );
          verifyLink(2, 'More VA news', 'news.va.gov');
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

          cy.get('[data-e2e="hub"]').should('have.length', 12);
          verifyLink(0, 'Health care', '/health-care');
          verifyLink(1, 'Disability', '/disability');
          verifyLink(2, 'Education and training', '/education');
          verifyLink(3, 'Careers and employment', '/careers-employment');
          verifyLink(4, 'Pension', '/pension');
          verifyLink(5, 'Housing assistance', '/housing-assistance');
          verifyLink(6, 'Life insurance', '/life-insurance');
          verifyLink(7, 'Burials and memorials', '/burials-memorials');
          verifyLink(8, 'Records', '/records');
          verifyLink(9, 'Service member benefits', '/service-member-benefits');
          verifyLink(10, 'Family member benefits', '/family-member-benefits');
          verifyLink(11, 'VA department information', 'department.va.gov');
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
          verifyText(
            'h2#sign-up-to-get-the-latest-va-u',
            'Sign up to get the latest VA updates',
          );

          verifyElement('[name="email"]');
          verifyButtonText(0, 'Sign up');
        });

      // Footer ====================================================
      verifyElement('.footer');

      const footer = () => cy.get('.footer');

      footer()
        .scrollIntoView()
        .within(() => {
          // Column 1
          verifyLink(0, 'Homeless Veterans', '/homeless');
          verifyLink(1, 'Women Veterans', '/womenvet');
          verifyLink(2, 'Minority Veterans', '/centerforminorityveterans');
          verifyLink(3, 'LGBTQ+ Veterans', 'patientcare.va.gov/lgbt');
          verifyLink(4, 'PTSD', 'ptsd.va.gov');
          verifyLink(5, 'Mental health', 'mentalhealth.va.gov');
          verifyLink(
            6,
            'Adaptive sports and special events',
            'department.va.gov/veteran-sports/',
          );
          verifyLink(7, 'VA outreach events', '/outreach-and-events/events/');
          verifyLink(8, 'National Resource Directory', 'nrd.gov/');

          // Column 2
          verifyLink(9, 'VA forms', 'find-forms/');
          verifyLink(
            10,
            'VA health care access and quality',
            'accesstocare.va.gov/',
          );
          verifyLink(
            11,
            'Accredited claims representatives',
            '/ogc/accreditation.asp',
          );
          verifyLink(12, 'VA mobile apps', 'mobile.va.gov/appstore/');
          verifyLink(
            13,
            'State Veterans Affairs offices',
            'department.va.gov/about/state-departments-of-veterans-affairs-office-locations/',
          );
          verifyLink(14, 'Doing business with VA', '/opal/fo/dbwva.asp');
          verifyLink(15, 'Careers at VA', '/jobs/');
          verifyLink(
            16,
            'VA outreach materials',
            '/outreach-and-events/outreach-materials',
          );
          verifyLink(17, 'Your VA welcome kit', '/welcome-kit/');

          // Column 3
          verifyLink(18, 'VA news', 'news.va.gov/');
          verifyLink(19, 'Press releases', '/opa/pressrel/');
          verifyLink(
            20,
            'Email updates',
            'public.govdelivery.com/accounts/USVA/subscriber/new/',
          );
          verifyLink(21, 'Facebook', 'facebook.com/VeteransAffairs');
          verifyLink(22, 'Instagram', 'instagram.com/deptvetaffairs/');
          verifyLink(23, 'Twitter', 'twitter.com/DeptVetAffairs/');
          verifyLink(24, 'Flickr', 'flickr.com/photos/VeteransAffairs/');
          verifyLink(25, 'YouTube', 'youtube.com/user/DeptVetAffairs');
          verifyLink(
            26,
            'All VA social media',
            'digital.va.gov/web-governance/social-media/social-media-sites/',
          );

          // Column 4
          verifyElement('[data-show="#modal-crisisline"]');
          verifyLink(27, 'Resources and support', '/resources');
          verifyLink(28, 'Contact us', '/contact-us');
          verifyLink(29, '800-698-2411', 'tel:18006982411');
          verifyLink(30, 'TTY: 711', 'tel:+1711');
          verifyLink(31, 'Find a VA location', '/find-locations');

          // Language section
          verifyElement('.va-footer-links-bottom').eq(1);

          const languageSection = () => cy.get('.va-footer-links-bottom').eq(1);

          languageSection()
            .scrollIntoView()
            .within(() => {
              verifyText('.va-footer-linkgroup-title', 'Language assistance');
              verifyLinkWithoutSelector(
                0,
                'Español',
                '/asistencia-y-recursos-en-espanol',
              );
              verifyLinkWithoutSelector(
                1,
                'Tagalog',
                '/tagalog-wika-mapagkukunan-at-tulong',
              );
              verifyLinkWithoutSelector(
                2,
                'Other languages',
                '/how-to-get-free-language-assistance-from-va',
              );
            });

          // Logo section (footer)
          verifyElement('.footer-banner');

          // Bottom rail (footer)
          verifyElement('.va-footer-links-bottom').eq(1);

          const bottomRail = () => cy.get('.va-footer-links-bottom').eq(2);

          bottomRail()
            .scrollIntoView()
            .within(() => {
              verifyLinkWithoutSelector(
                0,
                'Accessibility',
                '/accessibility-at-va',
              );
              verifyLinkWithoutSelector(
                1,
                'Civil Rights',
                '/resources/your-civil-rights-and-how-to-file-a-discrimination-complaint/',
              );
              verifyLinkWithoutSelector(
                2,
                'Freedom of Information Act (FOIA)',
                'department.va.gov/foia',
              );
              verifyLinkWithoutSelector(3, 'Harassment', '/report-harassment');
              verifyLinkWithoutSelector(
                4,
                'Office of Inspector General',
                '/oig',
              );
              verifyLinkWithoutSelector(
                5,
                'Plain language',
                '/opa/Plain_Language.asp',
              );
              verifyLinkWithoutSelector(
                6,
                'Privacy, policies, and legal information',
                '/privacy-policy',
              );
              verifyLinkWithoutSelector(7, 'VA Privacy Service', 'oprm.va.gov');
              verifyLinkWithoutSelector(
                8,
                'No FEAR Act Data',
                '/ormdi/NOFEAR_Select.asp',
              );
              verifyLinkWithoutSelector(9, 'USA.gov', 'usa.gov');
              verifyLinkWithoutSelector(
                10,
                'VA performance dashboard',
                '/performance-dashboard',
              );
              verifyLinkWithoutSelector(
                11,
                'Veterans Portrait Project',
                '/veterans-portrait-project',
              );
            });
        });
    });
  });
});
