const testForLovellSidebar = (section, url = '/') => {
  const pageUrl = `/lovell-federal-health-care-${section}${url}`;

  it('has a sidebar with visible sections with headers', () => {
    cy.visit(pageUrl);
    cy.injectAxeThenAxeCheck();

    const numberOfMenuSections = 3;

    cy.get('.va-sidenav')
      .find('.va-sidenav-level-1')
      .should('be.visible')
      .should('have.length', numberOfMenuSections)
      .find('h2')
      .should('be.visible')
      .should('have.length', numberOfMenuSections);
  });

  it('has a sidebar with clickable links', () => {
    cy.visit(pageUrl);
    cy.injectAxeThenAxeCheck();

    // Top level sidebar links
    cy.get('.va-sidenav')
      .find('.va-sidenav-level-2 a.va-sidenav-item-label')
      .should('be.visible')
      .should('have.length.greaterThan', 0);

    // 2nd level sidebar links for "About Us"
    if (url === '/about-us/') {
      cy.get('.va-sidenav')
        .find('.va-sidenav-level-3 a.va-sidenav-item-label')
        .should('be.visible')
        .should('have.length.greaterThan', 0);
    }
  });
};

describe('Lovell Tricare - Main Page', () => testForLovellSidebar('tricare'));
describe('Lovell Tricare - About Page', () =>
  testForLovellSidebar('tricare', '/about-us/'));

describe('Lovell VA - Main Page', () => testForLovellSidebar('va'));
describe('Lovell VA - About Page', () =>
  testForLovellSidebar('va', '/about-us/'));
