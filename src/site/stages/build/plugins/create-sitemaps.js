const metalsmithSitemap = require('metalsmith-sitemap');

function createSitemaps(BUILD_OPTIONS) {
  const hostname = BUILD_OPTIONS.hostUrl;

  const now = new Date();
  const metalsmithSitemapOptions = {
    hostname,
    omitIndex: true,
    modifiedProperty: 'stats.mtime',
    lastmod: now,
    output: 'sitemap-cb.xml',
  };

  return (files, metalsmith, done) => {
    // generate dynamic sitemap
    metalsmithSitemap(metalsmithSitemapOptions)(files, metalsmith, done);
  };
}

module.exports = createSitemaps;
