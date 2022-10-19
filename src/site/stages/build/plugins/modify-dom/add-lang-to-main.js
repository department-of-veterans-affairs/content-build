/* eslint-disable no-param-reassign */

/**
 * Adds the language derived from the fileName to the `main` element of each page.
 */

function getLanguageFromFileName(fileName) {
  let pageLang = 'en';
  if (fileName.includes('-esp/') || fileName.includes('-espanol/')) {
    pageLang = 'es';
  } else if (fileName.includes('-tag/') || fileName.includes('-tagalog/')) {
    pageLang = 'tl';
  }
  return pageLang;
}

module.exports = {
  modifyFile(fileName, file) {
    let langAdded = false;

    if (fileName.endsWith('html')) {
      const pageLang = getLanguageFromFileName(fileName);
      const { dom } = file;
      const nodes = dom('main');
      nodes.each((index, el) => {
        const main = dom(el);
        main.attr('lang', pageLang);
        langAdded = true;
      });

      if (langAdded) {
        file.modified = true;
      }
    }
  },
};
