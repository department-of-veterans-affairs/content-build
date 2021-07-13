/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const { sleep } = require('../../../../script/utils');

function addDebugInfo(files, buildtype) {
  try {
    console.log('\nAdding debug info to Drupal pages...');

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

    Object.keys(files)
      .filter(fileName => files[fileName].isDrupalPage)
      .forEach(fileName => {
        const filePath = `build/${buildtype}/${fileName}`;
        const tmpFilepath = `tmp/${filePath}`;
        const tmpFileDir = path.dirname(tmpFilepath);

        if (!fs.existsSync(tmpFileDir)) {
          fs.mkdirSync(tmpFileDir, { recursive: true });
        }

        const readStream = fs.createReadStream(filePath, {
          encoding: 'utf8',
          autoClose: true,
        });

        const outputStream = fs.createWriteStream(tmpFilepath, {
          encoding: 'utf8',
          autoClose: true,
        });

        // `window.contentData = null` is added to Drupal pages from the debug.drupal.liquid template
        // when the `debug` key doesn't exist in the Metalsmith file entry.
        // We want to replace all instances of that with the debug object.
        readStream.on('data', data => {
          const debugInfo = Object.fromEntries(
            Object.entries(files[fileName]).filter(
              key => !keysToIgnore.includes(key[0]),
            ),
          );

          outputStream.write(
            data
              .toString()
              .replace(
                'window.contentData = null;',
                `window.contentData = ${JSON.stringify(debugInfo)};`,
              ),
          );
          console.log('- read/replaced contentData');
        });

        readStream.on('end', () => {
          outputStream.end();
          console.log('readStream "end" event');
        });

        outputStream.on('finish', async () => {
          // Overwrite original file with new file
          fs.moveSync(tmpFilepath, filePath, { overwrite: true });
          console.log(`- completed ${filePath}`);

          // Pause for garbage collection to free unused buffer memory
          await sleep(1);
        });

        console.log(`+ initiated ${filePath}`);
      });
  } catch (error) {
    console.error('Error adding debug info to files.\n', error);
  } finally {
    console.log('Finished adding debug info to Drupal pages.\n');
  }
}

module.exports = addDebugInfo;
