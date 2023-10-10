const cheerio = require('cheerio');

const _isBrokenLink = require('./isBrokenLink');
const isCMSUrl = require('./isCMSUrl');

/**
 * Parses the <a> and <img> elements from an HTML file, validating each HREF/SRC value.
 * @param {*} file The HTML file from the Metalsmith pipeline
 * @param {Set<string>} allPaths The paths of all files in the website. Used to confirm the existence of a file.
 */
function getBrokenLinks(
  file,
  allPaths,
  isBrokenLink = _isBrokenLink,
  buildType,
) {
  const $ = file.dom;
  const elements = $('a, img, script');
  const currentPath = file.path;

  const linkErrors = [];

  elements.each((index, node) => {
    const $node = $(node);

    let target = null;

    if ($node.is('a')) {
      target = $node.attr('href');

      if (target === undefined) {
        return;
      }
    } else if ($node.is('img')) {
      target = $node.attr('src') || $node.attr('data-src');
    } else if ($node.is('script')) {
      target = $node.attr('src');

      const isInlineScript = target === undefined && !!$node.html().trim();
      if (isInlineScript) {
        return;
      }
      // On local builds, vets-website files are not downloaded and do not
      // become part of the build, but instead are accessed by symlink. This
      // means that broken link checking fails if it looks for those files.
      if (buildType === 'localhost') {
        const generatedTest = /^\/generated\/.*?\.js/;
        if (target && generatedTest.test(target)) {
          return;
        }
      }
    }

    const isBroken = isBrokenLink(target, currentPath, allPaths);
    const isCMS = isCMSUrl(target, file);

    if (isBroken || isCMS) {
      const html = cheerio.html($node);
      linkErrors.push({
        html,
        target,
      });
    }
  });

  return linkErrors;
}

module.exports = getBrokenLinks;
