const generateStaticDataFilesFromDrupal = require('../drupal/static-data-files/generate');

function generateStaticDataFiles(buildOptions) {
  return files => {
    return generateStaticDataFilesFromDrupal(files, buildOptions);
  };
}

module.exports = generateStaticDataFiles;
