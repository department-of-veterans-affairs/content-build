/* eslint-disable no-console */
/* eslint-disable camelcase */
const fetch = require('node-fetch');

const args = process.argv.slice(2);
const repo = args[0];
const headSHA = args[1];
const timeout = 2; // minutes
const checkRunURL = `https://api.github.com/repos/${repo}/commits/${headSHA}/check-runs?filter=latest`;

/**
 * fetch request to github action URL provided
 * @param {string} url
 */
function getLatestCheckRun(url) {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  return fetch(url, headers)
    .then(response => {
      if (!response.ok) {
        return Promise.reject(
          Error(`Response not okay with ${url}. Aborting.`),
        );
      }
      return response.json();
    })
    .then(({ check_runs }) => {
      const validCheckRuns = check_runs.filter(
        ({ name }) => name !== 'Accessibility Scan',
      );
      for (let i = 0; i < validCheckRuns.length; i++) {
        // html_url specific github key. ignoring camelcase lint
        const { conclusion, html_url, status } = validCheckRuns[i];
        if (conclusion === 'failure') {
          return Promise.reject(
            Error(
              `Build aborted due to failed runs detected on ${headSHA}.\n\n ${html_url}`,
            ),
          );
        } else if (status === 'in_progress' || status === null) {
          return Promise.reject({});
        }
      }
      console.log(`All checks succeeded for ${headSHA}`);
      return Promise.resolve();
    });
}

function sleep(minutes) {
  return new Promise(resolve => setTimeout(resolve, minutes * 60 * 1000));
}

/**
 * Checks Github Actions url. Loops recursively until error is thrown.
 */
async function main() {
  try {
    return await getLatestCheckRun(checkRunURL);
  } catch (e) {
    if (e.name !== undefined && e.name === 'Error') {
      console.log(e);
      process.exit(1);
    }
    console.log(`Check runs still pending. Sleeping for ${timeout} minutes`);
    await sleep(timeout);
    return main();
  }
}

main();
