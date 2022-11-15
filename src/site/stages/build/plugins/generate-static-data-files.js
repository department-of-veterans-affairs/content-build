const generateStaticDataFilesFromDrupal = require('../drupal/static-data-files/generate');

const generateStaticDataFiles = buildOptions => {
  return async (files, metalsmith, done) => {
    await generateStaticDataFilesFromDrupal(files, buildOptions);
    done();
  };
};

module.exports = generateStaticDataFiles;
