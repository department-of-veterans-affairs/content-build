/* eslint-disable no-console */
const path = require('path');
const fs = require('fs-extra');
const { createSymlink } = require('../../../../../script/utils');

function createMetalSmithSymlink(options) {
  const basePath = `build/${options.buildtype}/generated`;
  const vetsWebsiteGenPath = path.resolve('../vets-website/', basePath);
  const vetsWebsiteGenPathExists = fs.existsSync(vetsWebsiteGenPath);
  const destinationPath = path.join(__dirname, '../../../../../', basePath);
  const destinationPathExists = fs.existsSync(destinationPath);

  // As long as vetsWebsiteGenPath exists, go ahead and create the symlink
  if (vetsWebsiteGenPathExists) {
    createSymlink(vetsWebsiteGenPath, destinationPath);
  } else {
    console.log(' ');
    console.log('/**');
    console.error(' * ATTN: Cannot create symlink with vets-website.');
    console.error(` * Path: ${vetsWebsiteGenPath} does not exist.`);
    console.error(
      ' * Please run "yarn build" in vets-wesbite to create this directory.',
    );
    console.log(' */');
    console.log(' ');
    process.exit(1);
  }

  return () => {
    if (destinationPathExists) {
      // If the directory exists, just make sure it's the symlink
      createSymlink(vetsWebsiteGenPath, destinationPath);
    }
  };
}

module.exports = createMetalSmithSymlink;
