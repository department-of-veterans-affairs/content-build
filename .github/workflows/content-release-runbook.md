# Content release issues runbook

This file collects recurring issues that cause content release to fail, with links to example failed runs, documentation related to the issue, and tickets to remediate the issue if they exist.

## General note on failures
A workflow like Content Release is made up of multiple 'jobs'. In Content Release, 'Validate Build Status', 'Build', 'Deploy' and the like are all jobs.

If a Content Release run 'Deploy' job completes successfully, **a Content Release went out**. Sometimes the Deploy job will complete successfully and then a subsequent cleanup step will fail. This is an example of that:

https://github.com/department-of-veterans-affairs/content-build/actions/runs/5202296582
<img width="1333" alt="image" src="https://github.com/department-of-veterans-affairs/content-build/assets/203623/c8f50b8a-bfda-4c24-ac8d-f7bb3f838938">

In a case like this, it is still important for the CMS Team to monitor Content Release. However, a false failure like this should be taken into account when choosing whether to inform editors, since it represents a successful Content Release even though marked as a failure.

## Runner has received a shutdown signal

**Message:** The runner has received a shutdown signal. This can happen when the runner service is stopped, or a manually started runner is canceled.

**Response:** Wait for subsequent content release, which should begin automatically. 

**Cause:** Runners are provisioned by a system that creates additional instances as needed to handle more work, and then shuts them down when they are no longer needed. However, the system does not properly keep track of whether a runner is currently in use when it decides to shut them down. This can result in a runner shutting down mid-job.

**Remediation:** https://github.com/department-of-veterans-affairs/va.gov-team/issues/55020
