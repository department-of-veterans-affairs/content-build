const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  modifyObstructiveCode: false,
  waitForAnimations: false,
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('../src/platform/testing/e2e/cypress/plugins/index')(
        on,
        config,
      );
    },
    baseUrl: 'https://staging.va.gov',
    specPattern: './src/**/tests/**/*.cypress.spec.js?(x)',
    supportFile: 'src/platform/testing/e2e/cypress/support/index.js',
  },
});
