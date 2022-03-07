/* eslint-disable no-console */
import { run } from 'axe-core';

let scanRuleset;

if (process.env.A11Y_HEADER_CHECK === true) {
  scanRuleset = {
    type: 'rule',
    values: ['heading-order'],
  };
  console.log('A11Y_HEADER_CHECK TRUE');
} else {
  scanRuleset = {
    type: 'tag',
    values: ['section508', 'wcag2a', 'wcag2aa'],
  };
  console.log('A11Y_HEADER_CHECK FALSE');
}

const logViolations = violations => {
  /* eslint-disable no-console */
  console.log(
    'Please Note: An axe-core smoke test is expected to report 6 violations.',
  );

  console.log(
    `\n${violations.length} Accessibility Violation${
      violations.length === 1 ? ' Was' : 's Were'
    } Detected`,
  );

  violations.forEach((violation, violationIdx) => {
    console.log(`\nAxe Violation ${violationIdx + 1}:\n`, violation);

    violation.nodes.forEach((node, nodeIdx) => {
      console.log(`\nNode ${nodeIdx + 1}:\n`, node);
    });
  });

  /* eslint-enable no-console */
};

const axeCheck = container => {
  const options = {
    runOnly: scanRuleset,
    rules: {
      // the 'bypass' check is disabled because it may give a false-positive
      // for lists of 4-5 links
      bypass: {
        enabled: false,
      },
      // the css file isn't referenced when the html document is created
      // so the 'color-contrast' check is disabled
      'color-contrast': {
        enabled: false,
      },
      // when testing liquid template include files, the title tag likely won't
      // be present in the html document so the 'document-title' check is disabled
      'document-title': {
        enabled: false,
      },
    },
  };

  return new Promise((resolve, reject) =>
    run(container, options, (error, { violations }) => {
      if (error) {
        reject(error);
      } else {
        if (violations.length) {
          logViolations(violations);
        }

        resolve(violations);
      }
    }),
  );
};

export default axeCheck;
