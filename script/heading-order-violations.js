/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const glob = require('glob');

const optionDefinitions = [{ name: 'dir', alias: 'd' }];
const options = commandLineArgs(optionDefinitions);

if (options.help || !options.dir) {
  process.exit(0);
}

const htmlFiles = glob.sync(`${options.dir}/**/*.html`);

htmlFiles.forEach((filename, index, array) => {
  console.error(`Processing file ${index} of ${array.length}`);
  try {
    const data = fs.readFileSync(filename, 'utf8');
    const badHeadings = data
      .match(
        new RegExp(
          /(<h1((?!<h[12]).)*<h[3-6]|<h2((?!<h[1-3]).)*<h[4-6]|<h3((?!<h[1-4]).)*<h[56]|<h4((?!<h[1-5]).)*<h6)/,
          'gsm',
        ),
      )
      ?.join();
    if (badHeadings) {
      console.log(filename);
    }
  } catch (err) {
    console.error(err);
  }
});
