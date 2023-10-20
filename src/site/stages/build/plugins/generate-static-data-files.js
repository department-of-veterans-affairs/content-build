const generate = require('../drupal/static-data-files/generate');

const generateStaticDataFiles = buildOptions => {
  return async (files, metalsmith, done) => {
    await generate.generateStaticDataFiles(files, buildOptions);
    done();
  };
};

module.exports = generateStaticDataFiles;
