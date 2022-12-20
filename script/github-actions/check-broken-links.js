/* eslint-disable no-console */
// https://cms-nc3gdbj3c2p9pizhf1sm8czjvtfeg1ik.demo.cms.va.gov -- Tugboat CMS with 2 broken links
const fs = require('fs');

const args = process.argv.slice(2);
const envName = args[0];
const contentOnlyBuild = !!args[1];
const reportPath = `./logs/${envName}-broken-links.json`;
const SERVER_URL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const BRANCH_NAME = process.env.GITHUB_REF;
const IS_PROD_BRANCH = BRANCH_NAME.replace('refs/heads/', '') === 'main';
const maxBrokenLinks = 5000;

// broken links detected
if (fs.existsSync(reportPath)) {
  const brokenLinksReport = fs.readFileSync(reportPath, 'utf8');
  const brokenLinks = JSON.parse(brokenLinksReport);
  const shouldFail =
    brokenLinks.isHomepageBroken ||
    brokenLinks.brokenLinksCount >
      (brokenLinks.maxBrokenLinks ?? maxBrokenLinks);
  const color = shouldFail ? '#D33834' : '#FFCC00'; // danger or warning, needs to be in hex
  const { summary } = brokenLinks;
  const heading = `<!subteam^S010U41C30V|cms-helpdesk> ${brokenLinks.brokenLinksCount} broken links found in ${envName} \\n\\n <${SERVER_URL}> \\n`;
  const slackAttachments = `{"attachments": [{"color": "${color}","blocks": [{"type": "section","text": {"type": "mrkdwn","text": "${heading}\\n${summary
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"')}"}}]}]}`; // format summary according to slack api
  console.log(
    `${brokenLinks.brokenLinksCount} broken links found. \n ${brokenLinks.summary}`,
  );
  console.log(`SLACK_ATTACHMENTS=${slackAttachments} >> $GITHUB_OUTPUT`);

  if (!IS_PROD_BRANCH && !contentOnlyBuild) {
    // Ignore the results of the broken link checker unless
    // we are running either on the main branch or during
    // a Content Release. This way, if there is a broken link,
    // feature branches aren't affected, so VFS teams can
    // continue merging.
    return;
  }

  /*
   * Only emit this variable if ran against main branch or during Content Release.
   * Meets the following condition: blocks & attachments & IS_PROD_BRANCH
   */
  console.log(`UPLOAD_AND_NOTIFY=1 >> $GITHUB_OUTPUT`);

  if (shouldFail) {
    throw new Error('Broken links found');
  }
} else {
  console.log('No broken links found!');
  console.log(`UPLOAD_AND_NOTIFY=0 >> $GITHUB_OUTPUT`);
}
