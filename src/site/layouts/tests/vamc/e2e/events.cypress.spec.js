import './commands.cypress';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const months = [
  'Jan',
  'Feb',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];
const dateRegex = new RegExp(
  `(${daysOfWeek.join('|')}), (${months.join('|')}) \\d{1,2}, \\d{4}`,
);

const timeRegex = new RegExp(`\\d{1,2}:\\d{1,2} [ap]\\.m\\.`);

const timeZoneRegex = new RegExp('[A-Z]{2,3}');

Cypress.Commands.add('checkElements', (page, isMobile) => {
  cy.visit(page);
  cy.checkSideNav(isMobile);
  cy.get('.event-date').contains(dateRegex);
  cy.get('.event-time').contains(timeRegex);
  cy.get('.event-time-zone').contains(timeZoneRegex);
  cy.get('h2 a')
    .first()
    .click();
  cy.get('#sidenav-menu').should('not.exist');
});

describe('VAMC Events page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/v0/feature_toggles?*', { data: { features: [] } });
    cy.intercept('GET', '/v0/maintenance_windows', []);
  });

  it('works on desktop', () => {
    cy.checkElements('/pittsburgh-health-care/events/', false);
  });

  it('works on mobile', () => {
    cy.viewport(481, 1000);
    cy.checkElements('/pittsburgh-health-care/events/', true);
  });
});
