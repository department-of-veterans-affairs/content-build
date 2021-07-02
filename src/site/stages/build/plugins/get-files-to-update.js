/* eslint-disable no-param-reassign, no-console */
const fs = require('fs');
const path = require('path');

function getFilesToUpdate() {
  return (files, metalsmith, done) => {
    const updatedLayouts = [];

    if (path.basename(path.dirname(global.updatedFilePath)) === 'layouts') {
      updatedLayouts.push(path.basename(global.updatedFilePath));
    } else {
      // Array of all layout paths
      const layoutPaths = fs
        .readdirSync(path.join(__dirname, '../../../layouts'), {
          withFileTypes: true,
        })
        .filter(layoutPath => layoutPath.isFile())
        .map(layoutPath => layoutPath.name);

      // Relative path of updated file
      const relativePath = path.relative(
        '../content-build',
        global.updatedFilePath,
      );

      layoutPaths.forEach(layoutPath => {
        const layout = fs.readFileSync(
          path.join(__dirname, '../../../layouts', layoutPath),
          'utf8',
        );

        // If the updated file is referenced in the layout,
        // add layout to the array of layouts to update
        if (layout.includes(relativePath)) {
          updatedLayouts.push(layoutPath);
        }
      });

      console.log('Layouts updated:\n', updatedLayouts.join('\n'), '\n');
    }

    const numStartingFiles = Object.keys(files).length;

    Object.keys(global.metalsmithFiles)
      .filter(fileName =>
        updatedLayouts.includes(global.metalsmithFiles[fileName].layout),
      )
      .forEach(key => {
        files[key] = global.metalsmithFiles[key];
      });

    const numFilesChanged = Object.keys(files).length - numStartingFiles;

    console.log(`Files associated with template change: ${numFilesChanged}`);
    done();
  };
}

module.exports = getFilesToUpdate;
