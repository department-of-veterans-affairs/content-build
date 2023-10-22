import './axeCheck';
import './syncFixtures';
import './upload';
import './injectAxeThenAxeCheck';
import './hasCount';
import './keyboard';
import 'cy-mobile-commands';
import 'cypress-wait-until';
import 'cypress-downloadfile/lib/downloadFileCommand';

Cypress.Commands.add('deleteFileOrFolder', folderOrFileName => {
  return cy.task('deleteFileOrFolder', folderOrFileName);
});
