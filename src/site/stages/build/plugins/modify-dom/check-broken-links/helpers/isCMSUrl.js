const url = require('url');

const getApiClient = require('../../../../drupal/api');

/**
 * Checks if a URL points to the CMS.
 *
 * @param {*} link The HREF/SRC value to be validated.
 * @param {*} file The HTML file from the Metalsmith pipeline.
 * @param {*} buildOptions The build options.
 * @returns {boolean} Does this URL point to the CMS.
 */
function isCMSUrl(link, file, buildOptions) {
  if (!link) return false;

  const parsed = url.parse(link);
  if (!parsed.hostname) return false;

  // If asset paths are not being replaced then do not do
  // asset checks since all asset urls will include cms.va.gov
  const api = getApiClient(buildOptions);
  if (api.shouldReplaceAssetPath()) {
    return false;
  }

  return !!(file.isDrupalPage && parsed.hostname.includes('cms.va.gov'));
}

module.exports = isCMSUrl;
