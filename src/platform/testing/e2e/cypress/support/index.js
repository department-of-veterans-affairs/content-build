import '@testing-library/cypress/add-commands';
import 'cypress-axe';
import 'cypress-plugin-tab';
import 'cypress-real-events/support';

import './commands';

Cypress.on('uncaught:exception', () => {
  return false;
});
