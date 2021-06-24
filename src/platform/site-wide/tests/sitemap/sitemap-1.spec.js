// nightwatch is capable of running tests in parallel, but only if the
// test definitions are in separate files. This runs accessibility tests
// over the first 1/4 of urls in the sitemap, while `sitemap-2-4.spec.js`
// runs over the others. Crude, but this enables nightwatch to parallelize these.

const SitemapHelpers = require('./sitemap-helpers');
const Timeouts = require('../../../testing/e2e/timeouts.js');

module.exports = {
  'sitemap 1/4': client => {
    // Setting a large timeout so reduced memory doesn't cause failures
    client.timeoutsAsyncScript(Timeouts.verySlow);
    SitemapHelpers.sitemapURLs().then(function runFirstAxeCheck({
      urls,
      onlyTest508Rules, // eslint-disable-line no-unused-vars
    }) {
      const mark = Math.ceil(urls.length / 4);
      // eslint-disable-next-line no-unused-vars
      const segment = urls.splice(0, mark);
      SitemapHelpers.runTests(client, segment, onlyTest508Rules);
      client.end();
    });
  },
};
