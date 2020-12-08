/* eslint-disable no-console */
const fs = require('fs-extra');

/**
 * TBD
 * @param {object} buildOptions
 */

function createSymlink() {
  fs.rmdir('./build/localhost/generated', { recursive: true }, err => {
    if (err) {
      throw err;
    }
  });

  fs.symlink(
    '../vets-website/build/localhost/generated',
    './build/localhost/generated',
    'dir',
  );
}

module.exports = createSymlink;
