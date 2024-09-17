// Cypress test for checking that the static data files exist
describe('Static Data Files Test', () => {
  /* This is not a visual test -- no accessibility involvement */
  /* eslint-disable @department-of-veterans-affairs/axe-check-required */
  it('has the EHR JSON static file', () => {
    cy.deleteFileOrDir('../cypress/downloads/vamc-ehr.json');
    cy.fileOrDirExists('cypress/downloads/vamc-ehr.json').should('eq', false);
    cy.downloadFile(
      'http://localhost:3002/data/cms/vamc-ehr.json',
      '../cypress/downloads',
      'vamc-ehr.json',
    );
    cy.readFile('cypress/downloads/vamc-ehr.json').should('exist');
  });
  it('has the Supplemental Status JSON static file', () => {
    cy.deleteFileOrDir(
      '../cypress/downloads/vamc-facility-supplemental-status.json',
    );
    cy.fileOrDirExists(
      'cypress/downloads/vamc-facility-supplemental-status.json',
    ).should('eq', false);
    cy.downloadFile(
      'http://localhost:3002/data/cms/vamc-facility-supplemental-status.json',
      '../cypress/downloads',
      'vamc-facility-supplemental-status.json',
    );
    cy.readFile(
      'cypress/downloads/vamc-facility-supplemental-status.json',
    ).should('exist');
    cy.downloadFile(
      'http://localhost:3002/data/cms/vamc-system.json',
      '../cypress/downloads',
      'vamc-system.json',
    );
    cy.readFile('cypress/downloads/vamc-system.json').should('exist');
  });
  it('has the VAMC Police JSON static file', () => {
    // relative to current working directory
    cy.deleteFileOrDir('../cypress/downloads/vamc-police.json');
    // relative to the cy task
    cy.fileOrDirExists('cypress/downloads/vamc-police.json').should(
      'eq',
      false,
    );
    cy.downloadFile(
      'http://localhost:3002/data/cms/vamc-police.json',
      '../cypress/downloads',
      'vamc-police.json',
    );
    cy.readFile('cypress/downloads/vamc-police.json').should('exist');
  });
  it('has the VA Healthcare Services JSON static file', () => {
    cy.deleteFileOrDir('../cypress/downloads/va-healthcare-services.json');
    cy.fileOrDirExists('cypress/downloads/va-healthcare-services.json').should(
      'eq',
      false,
    );
    cy.downloadFile(
      'http://localhost:3002/data/cms/va-healthcare-services.json',
      '../cypress/downloads',
      'va-healthcare-services.json',
    );
    cy.readFile('cypress/downloads/va-healthcare-services.json').should(
      'exist',
    );
  });
});
