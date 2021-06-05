/* eslint-disable no-param-reassign */

function ignoreAssets() {
  return (files, metalsmith, done) => {
    Object.entries(files)
      .filter(
        ([fileName, file]) =>
          file.isDrupalAsset || fileName.includes('generated/'),
      )
      .forEach(([fileName]) => {
        delete files[fileName];
      });
    done();
  };
}

module.exports = ignoreAssets;
