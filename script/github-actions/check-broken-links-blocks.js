/* eslint-disable no-console */
const fs = require('fs');

const args = process.argv.slice(2);
const envName = args[0];
const contentOnlyBuild = !!args[1];
const reportPath = `./logs/${envName}-broken-links.json`;
const SERVER_URL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const BRANCH_NAME = process.env.GITHUB_REF;
const IS_PROD_BRANCH = BRANCH_NAME.replace('refs/heads/', '') === 'master';
const maxBrokenLinks = 10;

// broken links detected
if (fs.existsSync(reportPath)) {
  const brokenLinksReport = fs.readFileSync(reportPath, 'utf8');
  const brokenLinks = JSON.parse(brokenLinksReport);
  const shouldFail =
    brokenLinks.isHomepageBroken ||
    brokenLinks.brokenLinksCount > maxBrokenLinks;
  const payload = {
    blocks: [],
  };
  const icon = shouldFail ? ':bangbang:' : ':warning:';
  payload.blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${icon} *<!subteam^S010U41C30V|cms-helpdesk> ${brokenLinks.brokenLinksCount} broken links found in ${envName}*\n\n Workflow run: <${SERVER_URL}>`,
    },
  });
  const linkBlocks = brokenLinks.brokenPages.map((page, idx) => {
    const problemMarkup = page.linkErrors.map(error => {
      const destination =
        error.target.substring(0, 1) === '/'
          ? `https://va.gov${error.target}`
          : error.target;
      return `*  Broken link:* ${destination} \`\`\`${error.html}\`\`\``;
    });
    const destination = `https://prod.cms.va.gov/${page.path}`;
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Source ${idx + 1}: ${destination} *\n${problemMarkup.join(
          '\n',
        )}\n\n`,
      },
    };
  });
  const blocksWithDividers = [];
  for (let i = 0; i < linkBlocks.length; i += 1) {
    blocksWithDividers.push({
      type: 'divider',
    });
    blocksWithDividers.push(linkBlocks[i]);
  }

  payload.blocks = [...payload.blocks, ...blocksWithDividers];
  // Slack's API has a limit of 50 blocks, so limit the number of blocks and
  // splice in a message directing the user to the workflow.
  if (payload.blocks.length > 50) {
    payload.blocks = payload.blocks.slice(0, 49);
    const truncateWarning = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          'The list is too long to display in its entirety. Please visit the workflow run link above to see the full list.',
      },
    };
    payload.blocks.splice(1, 0, truncateWarning);
  }

  console.log(`::set-output name=SLACK_BLOCKS::${JSON.stringify(payload)}`);

  if (!IS_PROD_BRANCH && !contentOnlyBuild) {
    // Ignore the results of the broken link checker unless
    // we are running either on the master branch or during
    // a Content Release. This way, if there is a broken link,
    // feature branches aren't affected, so VFS teams can
    // continue merging.
    return;
  }

  /*
   * Only emit this variable if ran against master branch or during Content Release.
   * Meets the following condition: blocks & attachments & IS_PROD_BRANCH
   */
  console.log(`::set-output name=UPLOAD_AND_NOTIFY::1`);

  if (shouldFail) {
    throw new Error('Broken links found');
  }
} else {
  console.log('No broken links found!');
  console.log(`::set-output name=UPLOAD_AND_NOTIFY::0`);
}
