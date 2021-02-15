/* eslint-disable no-console */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs-extra');

const runCommand = (cmd, forcedExitCode = null) => {
  const child = spawn(cmd, [], { shell: true, stdio: 'inherit' });
  child.on('exit', code => {
    process.exit(forcedExitCode === null ? code : forcedExitCode);
  });

  // When we ^C out of the parent Node script, also interrupt the child
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });
};

const runCommandSync = cmd => {
  const child = spawnSync(cmd, [], { shell: true, stdio: 'inherit' });
  return child.status;
};

/**
 * Utility to create a symlink using fs-extra's ensureSymlink()
 * @param {string} src filepath to original content
 * @param {string} dest filepath where you want the symlink
 */
const createSymlink = (src, dest) => {
  fs.ensureSymlink(src, dest)
    .then(() => {
      console.log(`A symbolic link to ${src} has been created`);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
};

module.exports = {
  runCommand,
  runCommandSync,
  createSymlink,
};
