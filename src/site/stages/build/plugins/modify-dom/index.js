/* eslint-disable no-param-reassign */
const path = require('path');
const cheerio = require('cheerio');
const { sleep } = require('../../../../../../script/utils');
const addNonceToScripts = require('./add-nonce-to-scripts');
const processEntryNames = require('./process-entry-names');
const addSubheadingsIds = require('./add-id-to-subheadings');
const checkBrokenLinks = require('./check-broken-links');
const injectAxeCore = require('./inject-axe-core');
const addLangToMain = require('./add-lang-to-main');
const forceCorrectAccordionHeaders = require('./force-correct-accordion-headers');

const getDomModifiers = BUILD_OPTIONS => {
  if (BUILD_OPTIONS.liquidUnitTestingFramework) {
    return [
      processEntryNames,
      addSubheadingsIds,
      injectAxeCore,
      addLangToMain,
      forceCorrectAccordionHeaders,
    ];
  }

  return [
    addNonceToScripts,
    processEntryNames,
    addSubheadingsIds,
    checkBrokenLinks,
    injectAxeCore,
    addLangToMain,
    forceCorrectAccordionHeaders,
  ];
};

const modifyDom = BUILD_OPTIONS => async files => {
  const domModifiers = getDomModifiers(BUILD_OPTIONS);

  for (const modifier of domModifiers) {
    if (modifier.initialize) {
      modifier.initialize(BUILD_OPTIONS, files);
    }
  }

  // Store only one `file.dom` in memory at a time
  // because storing the virtual DOM of every .html file in memory
  // at once would cause a massive amount of memory to be consumed.
  let numProcessed = 0;
  for (const [fileName, file] of Object.entries(files)) {
    if (path.extname(fileName) === '.html') {
      file.dom = cheerio.load(file.contents);
      for (const modifier of domModifiers) {
        modifier.modifyFile(fileName, file, files, BUILD_OPTIONS);
      }
      if (file.modified) {
        file.contents = Buffer.from(file.dom.html());
      }
      delete file.dom;
      numProcessed++;

      // Pause for garbage collection to free unused buffer memory
      // eslint-disable-next-line no-await-in-loop
      if (numProcessed % 100 === 0) await sleep(1);
    }
  }

  for (const modifier of domModifiers) {
    if (modifier.conclude) {
      modifier.conclude(BUILD_OPTIONS, files);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\nParsed and created DOM for ${numProcessed} files.`);
};

module.exports = modifyDom;
