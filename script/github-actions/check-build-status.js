/* eslint-disable no-console */
/* eslint-disable camelcase */
const fetch = require('node-fetch');

const args = process.argv.slice(2);
const headSHA = args[0];
const timeout = 5; // minutes
const checkRunURL = `https://api.github.com/repos/department-of-veterans-affairs/content-build/commits/${headSHA}/check-runs`;
let commitNull = false;

function getLatestCheckRun(URL) {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  return fetch(URL, headers)
    .then(response => response.json())
    .then(({ check_runs }) => {
      const validCheckRuns = check_runs.filter(
        ({ name }) => name !== 'Accessibility Scan',
      );
      for (let i = 0; i < validCheckRuns.length; i++) {
        // html_url specific github key. ignoring camelcase lint
        const { conclusion, html_url, status } = validCheckRuns[i];
        if (conclusion === 'failure' || commitNull === true) {
          const headerMessage = commitNull
            ? 'Build aborted due to check runs still in progress on'
            : 'Build aborted due to failed runs detected on';
          throw new Error(`${headerMessage} ${headSHA}.\n\n ${html_url}`);
        } else if (status === 'in_progress' || status === null) {
          commitNull = true;
          return; // break for loop to wait for check_run to finish in progress
        }
      }
    })
    .catch(error => {
      console.log(error);
      process.exit(1);
    });
}

function sleep(minutes) {
  return new Promise(resolve => setTimeout(resolve, minutes * 60 * 1000));
}

async function main() {
  await getLatestCheckRun(checkRunURL);
  if (commitNull) {
    console.log(`Check runs still pending. Sleeping for ${timeout}s`);
    await sleep(timeout);
    await getLatestCheckRun(checkRunURL);
  }
  console.log(`All checks succeeded for ${headSHA}`);
}

main();
