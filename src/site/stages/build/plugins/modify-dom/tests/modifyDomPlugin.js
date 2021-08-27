const path = require('path');
const cheerio = require('cheerio');

const modifyDom = domModifiers => async files => {
  const BUILD_OPTIONS = {};

  for (const modifier of domModifiers) {
    if (modifier.initialize) {
      modifier.initialize(BUILD_OPTIONS, files);
    }
  }

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
    }
  }

  for (const modifier of domModifiers) {
    if (modifier.conclude) {
      modifier.conclude(BUILD_OPTIONS, files);
    }
  }
};

module.exports = modifyDom;
