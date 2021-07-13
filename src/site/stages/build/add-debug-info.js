/* eslint-disable no-console, no-await-in-loop */
const fs = require('fs-extra');
const _ = require('lodash');
const { sleep } = require('../../../../script/utils');

const NUM_CONCURRENT_FILES = 10;

const keysToIgnore = [
  'breadcrumb_path',
  'collection',
  'contents',
  'filename',
  'isDrupalPage',
  'layout',
  'modified',
  'nav_children',
  'nav_path',
  'path',
  'private',
];

async function writeFile(fileName, fileObject, buildtype) {
  if (!fileName) return;

  const filePath = `build/${buildtype}/${fileName}`;
  console.log(`file ${fileName}`);
  const originalContents = await fs.readFileSync(filePath, 'utf8');
  console.log('+ read file');
  const debugInfo = _.omit(fileObject, keysToIgnore);

  // `window.contentData = null` is added to Drupal pages from the debug.drupal.liquid template
  // when the `debug` key doesn't exist in the Metalsmith file entry.
  // We want to replace all instances of that with the debug object.
  const oldString = 'window.contentData = null;';
  const newString = `window.contentData = ${JSON.stringify(debugInfo)};`;
  const newContents = originalContents.toString().replace(oldString, newString);
  console.log('+ replaced contents');

  await fs.writeFileSync(filePath, newContents, { overwrite: true });
  console.log(`+ wrote file ${filePath}`);
}

async function addDebugInfo(files, buildtype) {
  try {
    console.log('\nAdding debug info to Drupal pages...\n');
    const drupalFileNames = Object.keys(files).filter(
      fileName => files[fileName].isDrupalPage,
    );

    console.log('Looping through drupal filenames...');
    // Limit the number of simultaneous open files with an array of promises.
    // This also limits peak memory use.
    while (drupalFileNames.length) {
      const promises = [];
      for (let i = 1; i <= NUM_CONCURRENT_FILES; i++) {
        const fileName = drupalFileNames.pop();
        promises.push(writeFile(fileName, files[fileName], buildtype));
      }
      await Promise.all(promises);

      // Pause for garbage collection to free unused buffer memory
      await sleep(1);
    }
  } catch (error) {
    console.error('Error adding debug info to files.\n', error);
  } finally {
    console.log('Finished adding debug info to Drupal pages.\n');
  }
}

module.exports = addDebugInfo;
