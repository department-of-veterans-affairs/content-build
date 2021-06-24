const SitemapHelpers = require('./sitemap-helpers');
const Timeouts = require('../../../testing/e2e/timeouts.js');

module.exports = {
  'sitemap 3/4': client => {
    // Setting a large timeout so reduced memory doesn't cause failures
    client.timeoutsAsyncScript(Timeouts.verySlow);
    SitemapHelpers.sitemapURLs().then(function runThirdAxeCheck({
      urls,
      onlyTest508Rules,
    }) {
      const mark = Math.ceil(urls.length / 4);
      const segment = urls.splice(mark * 2, mark);
      SitemapHelpers.runTests(client, segment, onlyTest508Rules);
      client.end();
    });
  },
};
