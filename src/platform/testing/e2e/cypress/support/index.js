import '@testing-library/cypress/add-commands';
import 'cypress-axe';
import 'cypress-plugin-tab';

import './commands';

Cypress.on('uncaught:exception', () => {
  return false;
});