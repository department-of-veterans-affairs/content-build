const generate = require('../drupal/static-data-files/generate');

const generateStaticDataFiles = buildOptions => {
  return async (files, metalsmith, done) => {
    await generate.generateStaticDataFilesFromDrupal(files, buildOptions);
    await generate.generateStaticDataFilesFromCurl(files, buildOptions);
    done();
  };
};

module.exports = generateStaticDataFiles;
