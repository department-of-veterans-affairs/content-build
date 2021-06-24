const SitemapHelpers = require('./sitemap-helpers');

module.exports = {
  'sitemap 4/4': client => {
    client.timeoutsAsyncScript(1001);
    SitemapHelpers.sitemapURLs().then(function runFourthAxeCheck({
      urls,
      onlyTest508Rules,
    }) {
      const mark = Math.ceil(urls.length / 4);
      const segment = urls.splice(mark * 3);
      SitemapHelpers.runTests(client, segment, onlyTest508Rules);
      client.end();
    });
  },
};
