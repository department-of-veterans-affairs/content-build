/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

/**
 * The intention of this file is to check the DOM for accordions generated with incorrect
 * Heading Hierachies and correct this issue by modifying the DOM.
 * */

module.exports = {
  initialize() {
    console.time('Force Correct Accordion Level');
  },
  conclude() {
    console.timeEnd('Force Correct Accordion Level');
  },
  modifyFile(fileName, file) {
    let didModifyHeaders = false;

    if (!fileName.endsWith('html')) {
      return;
    }

    const { dom } = file;

    // Bail early if page doesnt have an Accordion
    if (dom("[data-template='paragraphs/collapsible_panel']").length < 1) {
      return;
    }

    const findPreviousHeaderLevel = node => {
      // Returns the header level when the last header is in a wysiwyg div
      const previousHeaderLevelParent = dom(node)
        .prevAll('div[data-template="paragraphs/wysiwyg"]:has(:header)')
        .first();

      const lastHeader = previousHeaderLevelParent.find(':header').last()[0];
      if (lastHeader) {
        return lastHeader?.tagName;
      }

      // Returns the last header level for when there is no header nested in a wysiwyg
      const fallbackPreviousHeader = dom(node)
        .prevAll('h1, h2, h3, h4, h5, h6')
        .first()[0];

      if (fallbackPreviousHeader) {
        return fallbackPreviousHeader?.tagName;
      }

      // Fallback for when no proper headers are provided
      return 'h2';
    };

    const collapsiblePanelNodes = dom(
      `[data-template="paragraphs/collapsible_panel"]`,
    );

    // Starts at each collapsible panel, steps back to the most recent wysiwyg header, and reassigns based on that
    collapsiblePanelNodes.each((index, node) => {
      const previousHeaderLevel = findPreviousHeaderLevel(node);
      // in the case that there is a known previous header level in a wysiwyg div
      let incrementedHeaderLevel =
        parseInt(previousHeaderLevel?.substring(1), 10) + 1;
      const accordionHeaders = dom(node).find(':header');

      // Prevents attempted to make a header larger than an H6
      if (incrementedHeaderLevel > 6) incrementedHeaderLevel = 6;

      // only reassign header level if incrementedHeaderLevel is actually a number
      if (incrementedHeaderLevel && typeof incrementedHeaderLevel === 'number')
        accordionHeaders.each((_, header) => {
          dom(header).prop('tagName', `h${incrementedHeaderLevel}`);
          didModifyHeaders = true;
        });
    });

    if (didModifyHeaders) {
      file.modified = true;
    }
  },
};
