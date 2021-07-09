/* eslint-disable no-param-reassign, no-console */
const fs = require('fs');
const path = require('path');

function getUpdatedLayouts(filePath, updatedLayouts, watchFiles) {
  const fileName = path.basename(filePath);
  const fileDirectory = path.basename(path.dirname(filePath));

  if (fileDirectory === 'layouts' && !updatedLayouts.includes(fileName)) {
    updatedLayouts.push(fileName);
    return;
  }

  watchFiles.forEach(watchFile => {
    if (watchFile !== filePath) {
      const fileContents = fs.readFileSync(watchFile, 'utf8');
      const relativeFilePath = path.relative('../content-build', filePath);

      if (fileContents.includes(relativeFilePath)) {
        getUpdatedLayouts(watchFile, updatedLayouts, watchFiles);
      }
    }
  });
}

function getFilesToUpdate(buildOptions) {
  return (files, metalsmith, done) => {
    const watchDirectories = buildOptions.watchPaths.map(watchPath =>
      path.dirname(watchPath).replace('**', ''),
    );

    const watchFiles = watchDirectories.reduce((acc, directory) => {
      const directoryFiles = fs
        .readdirSync(directory, { withFileTypes: true })
        .filter(layoutPath => layoutPath.isFile())
        .map(layoutPath => directory + layoutPath.name);

      return acc.concat(...directoryFiles);
    }, []);

    const updatedLayouts = [];
    getUpdatedLayouts(global.updatedFilePath, updatedLayouts, watchFiles);

    console.log(`Layouts updated:\n${updatedLayouts.join('\n')}\n`);

    const numStartingFiles = Object.keys(files).length;

    // Copy necessary cached file objects to Metalsmith files object for rebuild
    Object.keys(global.metalsmithFiles)
      .filter(fileName =>
        updatedLayouts.includes(global.metalsmithFiles[fileName].layout),
      )
      .forEach(fileName => {
        files[fileName] = global.metalsmithFiles[fileName];

        // Remove file contents for files that use layouts to avoid duplicating contents
        files[fileName].contents = '';

        if (files[fileName]?.entityUrl?.breadcrumb) {
          // Remove last element of breadcrumb array since it gets added in the rebuild
          files[fileName].entityUrl.breadcrumb.pop();
        }
      });

    const numFilesChanged = Object.keys(files).length - numStartingFiles;

    console.log(`Files associated with template change: ${numFilesChanged}`);

    done();
  };
}

module.exports = getFilesToUpdate;
