const SitemapHelpers = require('./sitemap-helpers');
const Timeouts = require('../../../testing/e2e/timeouts.js');

module.exports = {
  'sitemap 2/4': client => {
    // Setting a large timeout so reduced memory doesn't cause failures
    client.timeoutsAsyncScript(Timeouts.extremelySlow);
    SitemapHelpers.sitemapURLs().then(function runSecondAxeCheck({
      urls,
      onlyTest508Rules,
    }) {
      const mark = Math.ceil(urls.length / 4);
      const segment = urls.splice(mark, mark);
      SitemapHelpers.runTests(client, segment, onlyTest508Rules);
      client.end();
    });
  },
};
