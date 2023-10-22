// Cypress test for checking that the static data files exist
describe('Static Data Files Test', () => {
  /* This is not a visual test -- no accessibility involvement */
  /* eslint-disable @department-of-veterans-affairs/axe-check-required */
  it('has the EHR JSON static file', () => {
    cy.deleteFileOrFolder('../cypress/downloads/vamc-ehr.json');
    cy.downloadFile(
      'http://localhost:3002/data/cms/vamc-ehr.json',
      '../cypress/downloads',
      'vamc-ehr.json',
    );
    cy.readFile('cypress/downloads/vamc-ehr.json').should('exist');
  });
  it('has the Supplemental Status JSON static file', () => {
    cy.deleteFileOrFolder(
      '../cypress/downloads/vamc-facility-supplemental-status.json',
    );
    cy.downloadFile(
      'http://localhost:3002/data/cms/vamc-facility-supplemental-status.json',
      '../cypress/downloads',
      'vamc-facility-supplemental-status.json',
    );
    cy.readFile(
      'cypress/downloads/vamc-facility-supplemental-status.json',
    ).should('exist');
  });
  it('has the VAMC Police JSON static file', () => {
    cy.deleteFileOrFolder('../cypress/downloads/vamc-police.json');
    cy.downloadFile(
      'http://localhost:3002/data/cms/vamc-police.json',
      '../cypress/downloads',
      'vamc-police.json',
    );
    cy.readFile('cypress/downloads/vamc-police.json').should('exist');
  });
});
