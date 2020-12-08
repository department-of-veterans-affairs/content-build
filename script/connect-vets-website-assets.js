/* eslint-disable no-console */
const path = require('path');
const fs = require('fs-extra');
const { createSymlink } = require('./utils');

const basePath = 'build/localhost/generated';
const vetsWebsiteGenPath = path.resolve('../vets-website/', basePath);
const destinationPath = path.join(__dirname, '../', basePath);
const vetsWebsiteGenPathExists = fs.existsSync(vetsWebsiteGenPath);
const destinationPathExists = fs.existsSync(destinationPath);

// Check if the vets-website path extists before doing anything
if (vetsWebsiteGenPathExists) {
  // Check if the build/localhost/generated path exists
  if (destinationPathExists) {
    // Remove the generated directory so we can create a symlink
    fs.rmdir(destinationPath, { recursive: true }, errRemoval => {
      if (errRemoval) {
        throw errRemoval;
      } else {
        createSymlink(vetsWebsiteGenPath, destinationPath);
      }
    });
  } else {
    // Nothing is there yet, so just make the symlink
    createSymlink(vetsWebsiteGenPath, destinationPath);
  } // if destinationPathExists
} else {
  // Throwing an error if vets-website has not run a build yet
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
} // if vetsWebsiteGenPathExists
