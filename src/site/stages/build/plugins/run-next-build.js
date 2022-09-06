/* eslint-disable no-param-reassign */
const { spawn } = require('child_process');
const { logDrupal } = require('../drupal/utilities-drupal');

const runNextBuild = options => (files, metalsmith, done) => {
  logDrupal(
    'Next build: starting build in child process. Metalsmith will continue.',
  );
  const directory = options['next-build-directory'];
  const runNextExport = new Promise(resolve => {
    const cmd = `yarn export`;
    const child = spawn(cmd, [], {
      shell: true,
      cwd: `${directory}`,
    });

    let scriptOutput;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', data => {
      data = data.toString();
      scriptOutput += data;
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', data => {
      data = data.toString();
      scriptOutput += data;
    });

    // If the child process exits abnormally, exit parent with the same code
    child.on('exit', code => {
      if (code) {
        logDrupal(scriptOutput);
        process.exit(code);
      }
    });

    child.on('close', code => {
      metalsmith.metadata({
        nextBuildSuccess: true,
        nextBuildLog: scriptOutput,
        nextBuildCode: code,
        ...metalsmith.metadata(),
      });
      const exitCodeText = code ? `with code ${code}` : 'successfully';
      logDrupal(
        `Next build: build completed ${exitCodeText}. Log output is available in metalsmith.metadata().nextBuildLog.`,
      );
      resolve();
    });

    // When we ^C out of the parent Node script, also interrupt the child
    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });
  });
  metalsmith.metadata({
    nextBuild: runNextExport,
    ...metalsmith.metadata(),
  });
  done();
};

module.exports = runNextBuild;
