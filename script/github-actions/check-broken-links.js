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
  const color = shouldFail ? '#D33834' : '#FFCC00'; // danger or warning, needs to be in hex
  const heading = `@cmshelpdesk ${brokenLinks.brokenLinksCount} broken links found in the ${envName} build on ${BRANCH_NAME} \n\n${SERVER_URL}\n\n`;
  const slackBlocks = `[{"type": "section", "text": {"type": "plain_text", "text": "${heading}"}}]`;
  const slackAttachments = `[{"color": "${color}", "text": "${brokenLinks.summary}"}]`;

  console.log(
    `${brokenLinks.brokenLinksCount} broken links found. \n ${brokenLinks.summary}`,
  );

  console.log(`::set-output name=SLACK_BLOCKS::${slackBlocks}`);
  console.log(`::set-output name=SLACK_ATTACHMENTS::${slackAttachments}`);

  if (!IS_PROD_BRANCH && !contentOnlyBuild) {
    // Ignore the results of the broken link checker unless
    // we are running either on the master branch or during
    // a Content Release. This way, if there is a broken link,
    // feature branches aren't affected, so VFS teams can
    // continue merging.
    return;
  }
  // Only emit this flag if ran against master branch or during Content Release.
  if (shouldFail) {
    console.log(`::set-output name=SHOULD_FAIL::${shouldFail}`);
    throw new Error('Broken links found');
  }
} else {
  console.log('No broken links found!');
}
throw new Error('Froce error');
