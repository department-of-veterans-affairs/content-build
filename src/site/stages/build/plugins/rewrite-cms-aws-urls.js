/* eslint-disable no-param-reassign, no-continue */
const _ = require('lodash');

function rewriteAWSUrls(options) {
  return (files, metalsmith, done) => {
    if (options['drupal-address']) {
      const drupalAddressPattern = _.escapeRegExp(options['drupal-address']);
      const regex = new RegExp(drupalAddressPattern, 'g');

      Object.keys(files)
        .filter(
          fileName => fileName.endsWith('html') && files[fileName].isDrupalPage,
        )
        .forEach(fileName => {
          const file = files[fileName];
          let contents = file.contents.toString();
          contents = contents.replace(regex, file.drupalSite);

          file.contents = Buffer.from(contents);
        });
    }
    done();
  };
}

module.exports = rewriteAWSUrls;
