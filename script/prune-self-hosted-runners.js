/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

/**
 * This script performs some lifecycle management tasks on self-hosted runners.
 *
 * It is intended to be run as a scheduled cron job in a GHA workflow, though
 * it can also be run locally.
 *
 * Briefly, the problem is this: We have an issue with our self-hosted runners,
 * which are deployed to EC2 instances controlled by an ASG. If left alone,
 * they sometimes run out of disk space, or lose connection, or in some other
 * way lose their usefulness. If we have the max-lifetime of the ASG set, then
 * they will be killed unceremoniously as soon as they reach that age, without
 * any regard for jobs that may be running on them at the time.
 *
 * It's easier to determine a runner's state, connectivity, idleness, health,
 * etc from GitHub than it is from within the runner itself, so my solution is
 * to use that information to prune aging, ailing runners in a safe way, and
 * rely upon the ASG's lifecycle management only as a last resort.
 */

const { Octokit } = require('@octokit/rest');
const AWS = require('aws-sdk');

// Prevent any changes to the infrastructure.
const DRY_RUN = process.env.DRY_RUN === 'true';

// Increased debugging information.
const DEBUG = process.env.DEBUG === 'true';

// Number of days an instance is allowed to run before termination.
//
// The ASG's max-lifetime is set (as of August 2023) to a value comfortably in
// excess of this, and it should always at least, say, 5-6 hours more than this
// value to allow for scheduling vagaries, long-running jobs, etc.
const THRESHOLD_DAYS = process.env.THRESHOLD_DAYS || 5;

// The owner of the repository.
const GITHUB_OWNER =
  process.env.GITHUB_OWNER || 'department-of-veterans-affairs';
const GITHUB_REPO = process.env.GITHUB_REPO || 'content-build';

// The GitHub token.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// The name of the ASG.
const ASG_NAME = 'dsva-vagov-content-build-gha-runners-asg';

// Milliseconds-to-days conversion factor.
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// Set the default AWS region.
const AWS_DEFAULT_REGION = 'us-gov-west-1';
AWS.config.update({ region: AWS_DEFAULT_REGION });

// The current time.
const NOW = new Date();

/**
 * Log some debugging information.
 */
function debug(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

/**
 * Get the current instances in the given ASG.
 *
 * A given instance data structure looks like this:
 *
 * Instance: {
 *   InstanceId: 'i-0fe66f30785a4190e',
 *   InstanceType: 'm6i.4xlarge',
 *   AvailabilityZone: 'us-gov-west-1c',
 *   LifecycleState: 'InService',
 *   HealthStatus: 'Healthy',
 *   LaunchTemplate: {
 *     LaunchTemplateId: 'lt-001a10f785f2aeafd',
 *     LaunchTemplateName: 'dsva-vagov-content-build-gha-runner-lt',
 *     Version: '81'
 *   },
 *   ProtectedFromScaleIn: true
 * }
 */
async function getASGInstances(asgName) {
  const asg = new AWS.AutoScaling();
  const response = await asg
    .describeAutoScalingGroups({
      AutoScalingGroupNames: [asgName],
    })
    .promise();
  const result = response.AutoScalingGroups[0].Instances;
  debug('ASG instances:', result);
  return result;
}

/**
 * Get the current self-hosted runners.
 *
 * A given runner data structure looks like this:
 *
 * Runner: {
 *   id: 37902,
 *   name: '0WUqD2i-01cfc6179d3ca8ca3',
 *   os: 'Linux',
 *   status: 'online',
 *   busy: true,
 *   labels: [
 *     { id: 1, name: 'self-hosted', type: 'read-only' },
 *     { id: 2, name: 'Linux', type: 'read-only' },
 *     { id: 3, name: 'X64', type: 'read-only' },
 *     { id: 16273, name: 'Ubuntu20', type: 'custom' },
 *     { id: 16274, name: 'asg', type: 'custom' }
 *   ]
 * }
 */
async function getRunners(token, owner, repo) {
  const octokit = new Octokit({
    auth: token,
  });
  const response = await octokit.actions.listSelfHostedRunnersForRepo({
    owner,
    repo,
  });
  const result = response.data.runners;
  debug('Runners:', result);
  return result;
}

/**
 * Get the details of the EC2 instances.
 */
async function getInstancesDetails(instances) {
  const ec2 = new AWS.EC2();
  const response = await ec2
    .describeInstances({
      InstanceIds: instances.map(instance => instance.InstanceId),
    })
    .promise();
  // Merge the instances of all of the reservations into a single array.
  const instanceDetails = response.Reservations.reduce(
    (accumulator, reservation) => {
      return accumulator.concat(reservation.Instances);
    },
    [],
  );
  // Merge the instance details into the instances.
  const result = instances.map(instance => {
    const instanceDetail = instanceDetails.find(
      details => instance.InstanceId === details.InstanceId,
    );
    return {
      ...instance,
      ...instanceDetail,
    };
  });
  debug('Instances details:', result);
  return result;
}

/**
 * Determine the list of runners on a given instance.
 *
 * Each runner has a name that is composed of (as of 08/2023):
 * - a random string
 * - a hyphen
 * - the instance ID
 *
 * Thus any runner containing the instance ID is running on that instance.
 */
function getRunnersOnInstance(runners, instanceId) {
  const result = runners.filter(runner => runner.name.includes(instanceId));
  debug('Runners on instance:', result);
  return result;
}

/**
 * Determine whether a given instance is old.
 */
function isOldInstance(instance, thresholdDays) {
  const launchTime = instance.LaunchTime;
  const age = NOW - new Date(launchTime);
  const result = age > thresholdDays * MILLISECONDS_PER_DAY;
  debug('Instance age:', age, 'Old?', result);
  return result;
}

/**
 * Determine whether a given instance is idle.
 */
function isIdleInstance(instance, runners) {
  const { InstanceId: instanceId } = instance;
  const myRunners = getRunnersOnInstance(runners, instanceId);
  const isBusy = myRunners.some(runner => runner.busy);
  return !isBusy;
}

/**
 * Determine the list of doomed runners.
 */
function getDoomedRunners(instances, runners) {
  const result = [];
  for (const instance of instances) {
    const { InstanceId: instanceId } = instance;
    const myRunners = getRunnersOnInstance(runners, instanceId);
    result.push(...myRunners);
  }
  debug('Doomed runners:', result);
  return result;
}

/**
 * Delete the given runners.
 */
async function deleteRunners(runners, token, owner, repo, dryRun) {
  if (dryRun) {
    debug('Dry run: Not deleting runners.');
    return;
  }
  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });
  for (const runner of runners) {
    const { id: runnerId } = runner;
    const response = await octokit
      .request('DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}', {
        owner,
        repo,
        runner_id: runnerId,
      })
      .catch(err => {
        console.error(err);
      });
    debug('Delete runner response:', response);
  }
}

/**
 * Remove the given instances.
 *
 * We do this by setting their health status to Unhealthy, which will cause the
 * ASG to terminate them.
 */
async function removeInstances(instances, dryRun) {
  if (dryRun) {
    debug('Dry run: Not marking instances as unhealthy.');
    return;
  }
  const asg = new AWS.AutoScaling();
  for (const instance of instances) {
    await asg
      .setInstanceHealth({
        InstanceId: instance.InstanceId,
        HealthStatus: 'Unhealthy',
        ShouldRespectGracePeriod: true,
      })
      .promise();
  }
}

/**
 * Determine the list of old, idle instances.
 *
 * An instance is considered:
 * - old if it is older than the threshold age
 * - busy if it has any busy runners
 * - idle if it has no busy runners
 *
 * Given the instances and runners, we can determine the list of old, idle
 * instances with the following algorithm:
 *
 * 1. For each instance:
 *  a. If the instance is older than the threshold age:
 *   i. If the instance has any busy runners:
 *    - Do nothing.
 *  ii. If the instance has no busy runners:
 *    - Add the instance to the list of old, idle instances.
 * 2. Return the list of old, idle instances.
 */
async function getOldIdleInstances(instances, runners, thresholdDays) {
  const result = [];
  for (const instance of instances) {
    const isOld = isOldInstance(instance, thresholdDays);
    if (isOld) {
      const isIdle = isIdleInstance(instance, runners);
      if (isIdle) {
        result.push(instance);
      }
    }
  }
  debug('Old idle instances:', result);
  return result;
}

(async () => {
  // Get all of the instances on the ASG...
  let instances = await getASGInstances(ASG_NAME);

  // ... and add their details.
  instances = await getInstancesDetails(instances);

  // Get all of the runners from GitHub.
  const runners = await getRunners(GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO);

  // Determine the old, idle instances.
  const oldIdleInstances = await getOldIdleInstances(
    instances,
    runners,
    THRESHOLD_DAYS,
  );

  if (oldIdleInstances.length === 0) {
    debug('No old, idle instances to delete!');
  } else {
    // Determine the runners we should delete, and delete them.
    const doomedRunners = getDoomedRunners(oldIdleInstances, runners);
    debug('Deleting doomed runners:', doomedRunners);
    deleteRunners(
      doomedRunners,
      GITHUB_TOKEN,
      GITHUB_OWNER,
      GITHUB_REPO,
      DRY_RUN,
    );

    // Mark the instances as unhealthy.
    debug('Setting old idle instances unhealthy:', oldIdleInstances);
    removeInstances(oldIdleInstances, DRY_RUN);
  }
})();
