const url = require('url');

/**
 * Checks if a URL points to the CMS.
 *
 * @param {*} link The HREF/SRC value to be validated.
 * @param {*} file The HTML file from the Metalsmith pipeline.
 * @returns {boolean} Does this URL point to the CMS.
 */
function isCMSUrl(link, file) {
  if (!link) return false;

  const parsed = url.parse(link);
  if (!parsed.hostname) return false;

  return !!(file.isDrupalPage && parsed.hostname.includes('cms.va.gov'));
}

module.exports = isCMSUrl;
