/* eslint-disable no-param-reassign */

function ignoreAssets() {
  return (files, metalsmith, done) => {
    Object.entries(files)
      .filter(
        ([fileName, file]) =>
          file.isDrupalAsset ||
          (fileName.includes('generated/') &&
            fileName !== 'generated/headerFooter.json' &&
            fileName !== 'generated/file-manifest.json'),
      )
      .forEach(([fileName]) => {
        delete files[fileName];
      });
    done();
  };
}

module.exports = ignoreAssets;
