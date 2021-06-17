/* eslint-disable no-console */
const fetch = require('node-fetch');

const args = process.argv.slice(2);
const headSHA = args[0];
const timeout = args[1] ? args[1] : 120;
const checkRunURL = `https://api.github.com/repos/department-of-veterans-affairs/content-build/commits/${headSHA}/check-runs`;
let commitNull = false;

function getLatestCheckRun(URL) {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  return fetch(URL, headers)
    .then(response => response.json())
    .then(githubObject => {
      for (let i = 0; i < Object.keys(githubObject.check_runs).length; i++) {
        if (
          githubObject.check_runs[i].conclusion === 'failure' ||
          commitNull === true
        ) {
          const headerMessage = commitNull
            ? 'Build aborted due to failed runs detected on'
            : 'Build aborted due to check runs still in progress on';
          throw new Error(
            `${headerMessage} ${headSHA}.\n\n ${githubObject.check_runs[i].html_URL}`,
          );
        } else if (
          githubObject.check_runs[i].status === 'in_progress' ||
          githubObject.check_runs[i].status === null
        ) {
          commitNull = true;
          return;
        }
      }
    })
    .catch(error => {
      console.log(error);
      process.exit(1);
    });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

async function main() {
  await getLatestCheckRun(checkRunURL);
  if (!commitNull) {
    await sleep(timeout);
    await getLatestCheckRun(checkRunURL);
  }
  console.log(`All checks succeeded for ${headSHA}`);
}

main();
