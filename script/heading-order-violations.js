/* eslint-disable no-console */
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const glob = require('glob');

const optionDefinitions = [{ name: 'dir', alias: 'd' }];
const options = commandLineArgs(optionDefinitions);

function handleError(error) {
  console.log(error);
}

function main() {
  if (options.help || !options.dir) {
    process.exit(0);
  }

  const htmlFiles = glob.sync(`${options.dir}/**/*.html`);

  htmlFiles.forEach(fname => {
    /* eslint-disable-next-line consistent-return */
    fs.readFile(fname, 'utf8', (err, data) => {
      if (err) {
        return handleError(err);
      }

      const h1ToNextHeading = data
        .match(new RegExp(/<h1.+(^\s*<h[3-6])+/, 'gsm'))
        ?.join();

      if (!!h1ToNextHeading && !h1ToNextHeading?.includes('<h2')) {
        console.log(fname.slice(1));
      }
    });
  });
}
main();
