/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const { sleep } = require('../../../../script/utils');

async function addDebugInfo(files, buildtype) {
  try {
    console.log('\nAdding debug info to Drupal pages...\n');

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

    const drupalFileNames = Object.keys(files).filter(
      fileName => files[fileName].isDrupalPage,
    );

    for (const fileName of drupalFileNames) {
      const filePath = `build/${buildtype}/${fileName}`;
      const tmpFilepath = `tmp/${filePath}`;
      const tmpFileDir = path.dirname(tmpFilepath);

      if (!fs.existsSync(tmpFileDir)) {
        fs.mkdirSync(tmpFileDir, { recursive: true });
      }

      const debugInfo = Object.fromEntries(
        Object.entries(files[fileName]).filter(
          key => !keysToIgnore.includes(key[0]),
        ),
      );
      const oldString = 'window.contentData = null;';
      const newString = `window.contentData = ${JSON.stringify(debugInfo)};`;

      /* eslint-disable-next-line no-await-in-loop */
      const originalContents = await fs.readFileSync(filePath, 'utf8');
      const newContents = originalContents
        .toString()
        .replace(oldString, newString);

      /* eslint-disable-next-line no-await-in-loop */
      await fs.writeFileSync(filePath, newContents, { overwrite: true });

      console.log(`wrote file ${filePath}`);

      // Pause for garbage collection to free unused buffer memory
      // eslint-disable-next-line no-await-in-loop
      await sleep(1);
    }
  } catch (error) {
    console.error('\nError adding debug info to files.\n', error);
  }
}

module.exports = addDebugInfo;
