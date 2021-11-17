/* eslint-disable no-console */
/* eslint-disable camelcase */
const { Octokit } = require('@octokit/rest');
const { sleep } = require('../../script/utils');

const { GITHUB_TOKEN: auth } = process.env; // GITHUB_REPOSITORY
const timeout = 2; // minutes
const [owner, repo] = 'department-of-veterans-affairs/content-build'.split('/'); // GITHUB_REPOSITORY.split('/');

const octokit = new Octokit({ auth });
const currentWorkflow = 'content-release';

const dailyDeployParams = {
  owner,
  repo,
  workflow_id: 'daily-deploy-production.yml',
  status: 'in_progress',
};

const contentReleaseParams = {
  owner,
  repo,
  workflow_id: 'content-release.yml',
  status: 'in_progress',
};

function getLatestWorkflow(params) {
  return octokit.rest.actions
    .listWorkflowRuns(params)
    .then(response => {
      if (response.status !== 200) {
        throw new Error(
          `Response ${response.status} from ${response.url}. Aborting.`,
        );
      }
      return response.data;
    })
    .then(({ workflow_runs }) => {
      return workflow_runs.length === 0 ? null : workflow_runs[0];
    });
}

function queueWorkflows(dailyDeployWorkflow, contentReleaseWorkflow) {
  if (dailyDeployWorkflow === null) return 'content-release';
  if (contentReleaseWorkflow === null) return 'daily-deploy';

  const [dailyDeployTimestamp, contentReleaseTimestamp] = [
    Date.parse(dailyDeployWorkflow.created_at),
    Date.parse(contentReleaseWorkflow.created_at),
  ];

  if (dailyDeployTimestamp < contentReleaseTimestamp) {
    return 'daily-deploy';
  } else if (contentReleaseTimestamp < dailyDeployTimestamp) {
    return 'content-release';
  }

  throw new Error(
    'Both workflows created at exact same time. Trigger manually',
  );
}

/**
 * Checks Github Actions url. Loops recursively until error is thrown.
 */
async function main() {
  try {
    const ddWorkflow = await getLatestWorkflow(dailyDeployParams);
    const crWorkflow = await getLatestWorkflow(contentReleaseParams);
    const flow = await queueWorkflows(ddWorkflow, crWorkflow);

    if (currentWorkflow !== flow) {
      console.log(
        `${flow} is currently running. Sleeping ${currentWorkflow} for ${timeout} minutes`,
      );
      await sleep(timeout * 60 * 1000);
      await main();
      return;
    } else {
      console.log(`${currentWorkflow} can continue!`);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
