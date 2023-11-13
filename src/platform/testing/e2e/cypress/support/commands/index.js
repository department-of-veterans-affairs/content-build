import './axeCheck';
import './syncFixtures';
import './upload';
import './injectAxeThenAxeCheck';
import './hasCount';
import './keyboard';
import 'cy-mobile-commands';
import 'cypress-wait-until';
import 'cypress-downloadfile/lib/downloadFileCommand';

Cypress.Commands.add('deleteFileOrDir', fileOrDirName => {
  return cy.task('deleteFileOrDir', fileOrDirName);
});

Cypress.Commands.add('fileOrDirExists', fileOrDirName => {
  return cy.task('fileOrDirExists', fileOrDirName);
});
