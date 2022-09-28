/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const fs = require('fs-extra');
const recursiveRead = require('recursive-readdir');

/*
  This plugin allows Metalsmith to read an arbitrary directory of files and
  add them to the build. The file naming and contents are intact. Overwrites of
  existing files already in the Metalsmith build are possible.
*/

const addDirectoryFiles = (directory, overwrite = false) => (
  files,
  metalsmith,
  done,
) => {
  // If we do not overwrite, then we pass existing file keys to recursiveRead.
  const existingFiles = overwrite ? [] : Object.keys(files);
  recursiveRead(directory, existingFiles, (err, readFiles) => {
    try {
      console.log(`Adding files from directory: ${directory}`);
      for (const filePath of readFiles) {
        const outputFilePath = filePath.replace(directory, '');
        fs.readFile(filePath, (error, data) => {
          try {
            files[outputFilePath] = {
              contents: data,
            };
            console.log(`Added to build: ${outputFilePath}`);
          } catch {
            done(error);
          }
        });
      }
    } catch {
      done(err);
    }
  });
  done();
};

module.exports = addDirectoryFiles;
