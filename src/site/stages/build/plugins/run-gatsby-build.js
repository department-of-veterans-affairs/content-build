/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const { spawn } = require('child_process');

const runGatsbyBuild = directory => (files, metalsmith, done) => {
  console.log(
    'Gatsby build: starting build in child process. Metalsmith will continue.',
  );
  const runGatsby = new Promise(resolve => {
    const cmd = `yarn clean && yarn build`;
    const child = spawn(cmd, [], {
      shell: true,
      cwd: `${directory}`,
    });

    let scriptOutput;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
      data = data.toString();
      scriptOutput += data;
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
      data = data.toString();
      scriptOutput += data;
    });

    // If the child process exits abnormally, exit parent with the same code
    child.on('exit', code => {
      if (code) {
        console.log(scriptOutput);
        process.exit(code);
      }
    });

    child.on('close', code => {
      metalsmith.metadata({
        gatsbyBuildSuccess: true,
        gatsbyBuildLog: scriptOutput,
        gatsbyBuildCode: code,
        ...metalsmith.metadata(),
      });
      const exitCodeText = code ? `with code ${code}` : 'successfully';
      console.log(
        `Gatsby build: build completed ${exitCodeText}. Log output is available in metalsmith.metadata().gatsbyBuildLog.`,
      );
      resolve();
    });

    // When we ^C out of the parent Node script, also interrupt the child
    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });
  });
  metalsmith.metadata({
    gatsbyBuild: runGatsby,
    ...metalsmith.metadata(),
  });
  done();
};

module.exports = runGatsbyBuild;
