const lovellSwitchLinkPages = [
  {
    title: 'System Health Care Page',
    path: '',
  },
  {
    title: 'Locations',
    path: '/locations',
  },
  {
    title: 'Health Services',
    path: '/health-services',
  },
  {
    title: 'Listings (Events)',
    path: '/events',
  },
  {
    title: 'Listings (News Releases)',
    path: '/news-releases',
  },
  {
    title: 'Listings (Stories)',
    path: '/stories',
  },
];

const getLovellUrl = (path, variation) =>
  `${`/lovell-federal-${variation}-health-care`}${path}`;

const lovellVariations = ['va', 'tricare'];

lovellSwitchLinkPages.forEach(page => {
  lovellVariations.forEach(variation => {
    const oppositeVariation = variation === 'va' ? 'tricare' : 'va';

    describe(`Lovell ${variation.toUpperCase()} ${page.title} page`, () => {
      it('has the proper switch link', () => {
        cy.visit(getLovellUrl(`${page.path}/`, variation));
        cy.injectAxeThenAxeCheck();

        cy.get('va-alert').should('have.length', 1);

        cy.get('va-alert').contains(
          `View this page as a ${oppositeVariation.toUpperCase()} beneficiary`,
        );

        cy.get('va-alert a').should(
          'have.attr',
          'href',
          getLovellUrl(page.path, oppositeVariation),
        );
      });
    });
  });
});
