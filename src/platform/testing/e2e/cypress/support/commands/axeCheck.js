const table = require('table').table;

const tableConfig = {
  columns: {
    0: { width: 15 },
    1: { width: 100 },
  },
};

/**
 * Callback from a11y check that logs aXe violations to console output.
 *
 * https://github.com/avanslaars/cypress-axe/tree/61631c14a0190329cebc8f8ac9e8f81f1f1ce071#using-the-violationcallback-argument
 *
 * @param {Array} violations - Array of violations returned from the a11y check.
 */
const processAxeCheckResults = violations => {
  const violationMessage = `${violations.length} accessibility violation${
    violations.length === 1 ? ' was' : 's were'
  } detected`;

  const violationData = violations.map(
    ({ id, impact, description, nodes, help, helpUrl }) => [
      ['id', id],
      ['impact', impact],
      ['description', description],
      ['help', help],
      ['help URL', helpUrl],
      ['target', nodes.map(node => node.target).join('\n\n')],
      ['html', nodes.map(node => node.html).join('\n\n')],
      ['failure summary', nodes.map(node => node.failureSummary).join('\n\n')],
      ['nodes', nodes.length],
    ],
  );

  if (Cypress.env('STEP')) {
    cy.url().then(url => {
      const prodURL = url.replace(
        Cypress.config().baseUrl,
        `https://www.va.gov`,
      );
      cy.readFile('a11y_failures.csv').then(str => {
        if (!str.includes(prodURL)) {
          let formattedStr = '';
          for (const violation of violationData) {
            formattedStr += `${prodURL},${violation[0][1]}\n`;
          }
          cy.writeFile('a11y_failures.csv', formattedStr, {
            encoding: 'utf8',
            flag: 'a',
          });
        }
      });
    });
  }

  cy.url().then(url => {
    const prodURL = url.replace(Cypress.config().baseUrl, `https://www.va.gov`);
    assert.fail(
      violations.length,
      0,
      `\n\n${prodURL}\n\n${violationMessage}\n\n${violationData.map(violation =>
        table(violation, tableConfig),
      )}`,
    );
  });
};

/**
 * Checks the passed selector and children for axe violations.
 * @param {string} [context=main] - CSS/HTML selector for the container element to check with aXe.
 * @param {Object} [tempOptions={}] - Rules object to enable _13647 exception or modify aXe config.
 */
Cypress.Commands.add('axeCheck', (context = 'main', tempOptions = {}) => {
  const { _13647Exception } = tempOptions;

  /**
   * Default required ruleset to meet Section 508 compliance.
   * Do not remove values[] entries. Only add new rulesets like 'best-practices'.
   *
   * See https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
   * for available rulesets.
   */

  let axeBuilder;

  if (Cypress.env('RUN_HEADINGS') === true) {
    axeBuilder = {
      runOnly: {
        type: 'tag',
        values: ['section508', 'wcag2a', 'wcag2aa'],
      },
      rules: {
        'color-contrast': {
          enabled: false,
        },
        'heading-order': {
          enabled: true,
        },
      },
    };
  } else {
    axeBuilder = {
      runOnly: {
        type: 'tag',
        values: ['section508', 'wcag2a', 'wcag2aa'],
      },
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    };
  }

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
   */
  axeBuilder = Object.assign(axeBuilder, tempOptions);

  const axeConfig = _13647Exception
    ? { includedImpacts: ['critical'] }
    : axeBuilder;

  Cypress.log();
  cy.checkA11y(context, axeConfig, processAxeCheckResults, {
    skipFailures: true,
  });
});
