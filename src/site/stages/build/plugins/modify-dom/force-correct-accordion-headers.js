/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

/**
 * The intention of this file is to check the DOM for accordions generated with incorrect
 * Heading Hierachies and correct this issue by modifying the DOM.
 * */

const headerHierarchy = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

module.exports = {
  initialize() {
    console.time('Force Correct Accordion Level');
  },
  conclude() {
    console.timeEnd('Force Correct Accordion Level');
  },
  modifyFile(fileName, file) {
    let didModifyHeaders = false;
    if (fileName.endsWith('html')) {
      const { dom } = file;
      const headerNodes = dom(
        '[data-template="paragraphs/wysiwyg"] div h2, [data-template="paragraphs/wysiwyg"] div h3, [data-template="paragraphs/wysiwyg"] div h4, [data-template="paragraphs/wysiwyg"] div h5, [data-template="paragraphs/wysiwyg"] div h6',
      );
      if (headerNodes.length > 0) {
        headerNodes.each((index, el) => {
          const headerLevel = el.tagName;
          const headerLevelIndex = headerHierarchy.indexOf(headerLevel);
          const accordionNodes = dom(el)
            .parent()
            .parent()
            .siblings('[data-template="paragraphs/collapsible_panel"]')
            .children('va-accordion')
            .children('va-accordion-item');
          if (accordionNodes.length > 0) {
            accordionNodes.each((i, accordionNode) => {
              const accordionHeaders = dom(accordionNode).find(
                'h2, h3, h4, h5, h6',
              );
              accordionHeaders.each((_, accordionHeader) => {
                const accordionHeaderTagName = accordionHeader.tagName;
                const currentIndex = headerHierarchy.indexOf(
                  accordionHeaderTagName,
                );
                if (currentIndex - headerLevelIndex >= 2) {
                  accordionHeader.tagName =
                    headerHierarchy[headerLevelIndex + 1];
                  console.log(
                    `changed accordion header ${fileName}-${index}-${i}-${_} from ${accordionHeaderTagName} to ${accordionHeader.tagName}`,
                  );
                  didModifyHeaders = true;
                }
              });
            });
          }
        });
      }
    }
    if (didModifyHeaders) {
      file.modified = true;
    }
  },
};
