/* eslint-disable no-console */
const args = process.argv.slice(2);
const headSHA = args[0];
const fetch = require('node-fetch');

const headers = { Accept: 'application/vnd.github.v3+json' };

// try getting check_runs for x amount of times
// if check_runs are not done (aka not null)
// wait for a few mins and retry again
// else if fail -- throw error
// else we gucci

fetch(
  `https://api.github.com/repos/department-of-veterans-affairs/content-build/commits/${headSHA}/check-runs`,
  headers,
)
  .then(res => res.json())
  .then(githubObject => {
    console.log(githubObject);
    for (let i = 0; i < Object.keys(githubObject.check_runs); i++) {
      if (githubObject.check_runs[i].status === 'failure') {
        // throw/return error causing this script to fail to fail onto GH
        console.log('fail');
      } else if (
        githubObject.check_runs[i].status === 'in_progress' ||
        githubObject.check_runs[i].status === null
      ) {
        // need to wait for the job to finish. what do
        console.log('wait');
        // break?
      }
    }
  });
