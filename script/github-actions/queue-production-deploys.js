/* eslint-disable no-console */
/* eslint-disable camelcase */
const { Octokit } = require('@octokit/rest');
const { sleep } = require('../utils');

const { GITHUB_TOKEN: auth, GITHUB_REPOSITORY } = process.env;
const args = process.argv.slice(2);
const timeout = 2; // minutes
const [owner, repo] = GITHUB_REPOSITORY.split('/');

const octokit = new Octokit({ auth });
const currentWorkflow = args[0];

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

/**
 * uses octokit request for github action to get workflow with status in_progress
 * @param {object} params
 */
function getLatestInProgressWorkflow(params) {
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

/**
 * Returns workflow that has priority
 * @param {object} ddWorkflow
 * @param {object} crWorkflow
 */
function getPriorityWorkflow(ddWorkflow, crWorkflow) {
  if (ddWorkflow === null) return 'content-release';
  if (crWorkflow === null) return 'daily-deploy';

  const [dailyDeployTimestamp, contentReleaseTimestamp] = [
    Date.parse(ddWorkflow.created_at),
    Date.parse(crWorkflow.created_at),
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
    const dailyDeployWorkflow = await getLatestInProgressWorkflow(
      dailyDeployParams,
    );
    const contentReleaseWorkflow = await getLatestInProgressWorkflow(
      contentReleaseParams,
    );
    const priorityWorkflow = await getPriorityWorkflow(
      dailyDeployWorkflow,
      contentReleaseWorkflow,
    );

    if (currentWorkflow !== priorityWorkflow) {
      console.log(
        `${priorityWorkflow} is currently running. Sleeping ${currentWorkflow} for ${timeout} minutes`,
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
