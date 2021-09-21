/* eslint-disable no-console, no-await-in-loop */
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const { sleep } = require('../../../../script/utils');

// Number of simultaneous files to read/write
const NUM_CONCURRENT_FILES = 10;

// Omit these keys from the file object when creating debug info
const KEYS_TO_IGNORE = [
  'breadcrumb_path',
  'collection',
  'contents',
  'filename',
  'isDrupalPage',
  'shouldAddDebugInfo',
  'layout',
  'modified',
  'nav_children',
  'nav_path',
  'path',
  'private',
  'next',
];

function writeFile(fileName, fileObject, buildtype) {
  return new Promise(resolve => {
    const filePath = path.join('build', buildtype, fileName);
    const contents = fs.readFileSync(filePath, 'utf8');

    // `window.contentData = null` is added to Drupal pages from the debug.drupal.liquid template
    // when the `debug` key doesn't exist in the Metalsmith file entry.
    // We want to replace all instances of that with the debug object.
    const oldString = 'window.contentData = null;';
    const debugInfo = _.omit(fileObject, KEYS_TO_IGNORE);

    try {
      const newString = `window.contentData = ${JSON.stringify(debugInfo)};`;
      const newContents = contents.toString().replace(oldString, newString);
      fs.writeFileSync(filePath, newContents, { overwrite: true });
    } catch (err) {
      console.error(err);
    }

    resolve();
  });
}

async function addDebugInfo(files, buildtype) {
  const timeString = 'Debug info time';

  try {
    console.log('\nAdding debug info to Drupal pages...\n');
    console.time(timeString);

    const shouldAddDebugInfo = fileName =>
      files[fileName].isDrupalPage || files[fileName].shouldAddDebugInfo;
    const drupalFileNames = Object.keys(files).filter(shouldAddDebugInfo);

    while (drupalFileNames.length) {
      const promises = [];

      // Limit the number of simultaneous open files. This increases speed and
      // reduces peak memory use.
      for (let i = 1; i <= NUM_CONCURRENT_FILES; i++) {
        const fileName = drupalFileNames.pop();
        if (fileName) {
          promises.push(writeFile(fileName, files[fileName], buildtype));
        }
      }
      await Promise.all(promises);

      // Pause for garbage collection to reduce peak memory use
      await sleep(1);
    }
  } catch (error) {
    console.error('Error adding debug info to files.\n', error);
  } finally {
    if (global.verbose) console.timeEnd(timeString);
    console.log('Finished adding debug info to Drupal pages.\n');
  }
}

module.exports = addDebugInfo;
