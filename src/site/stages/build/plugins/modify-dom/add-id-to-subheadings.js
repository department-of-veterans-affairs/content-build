/* eslint-disable no-param-reassign */

/*
 * Add unique ID to H2s and H3s that aren't in WYSIWYG or accordion buttons
 */
const { ENTITY_BUNDLES } = require('../../../../constants/content-modeling');

const entityBundlesForResourcesAndSupport = new Set([
  ENTITY_BUNDLES.STEP_BY_STEP,
  ENTITY_BUNDLES.FAQ_MULTIPLE_Q_A,
  ENTITY_BUNDLES.Q_A,
  ENTITY_BUNDLES.CHECKLIST,
  ENTITY_BUNDLES.MEDIA_LIST_IMAGES,
  ENTITY_BUNDLES.MEDIA_LIST_VIDEOS,
  ENTITY_BUNDLES.SUPPORT_RESOURCES_DETAIL_PAGE,
]);

function createUniqueId(headingEl, headingOptions) {
  const headingString = headingEl.text();
  const length = 30;
  let anchor = headingString
    .trim()
    .toLowerCase()
    .replace(/[^\w\- ]+/g, '')
    .replace(/\s/g, '-')
    .replace(/-+$/, '')
    .substring(0, length);

  if (headingOptions.previousHeadings.includes(anchor)) {
    anchor += `-${headingOptions.getHeadingId()}`;
  }

  headingOptions.previousHeadings.push(anchor);
  return anchor;
}

module.exports = {
  modifyFile(fileName, file) {
    let idAdded = false;

    if (fileName.endsWith('html')) {
      const { dom } = file;

      const headingOptions = {
        previousHeadings: [],
        previousId: 0,
        getHeadingId() {
          return ++this.previousId;
        },
      };

      let nodes = null;

      if (entityBundlesForResourcesAndSupport.has(file.entityBundle)) {
        nodes = dom('article h2');

        if (nodes.length < 2) {
          return;
        }
      } else {
        nodes = dom('h2, h3');
      }

      nodes.each((index, el) => {
        const heading = dom(el);
        const parent = heading.parents();
        const isInAccordionButton = parent.hasClass('usa-accordion-button');
        const isInAlert = parent.hasClass('usa-alert-body');

        // skip heading if it already has an id
        // skip heading if it's in an accordion button or an alert
        if (!heading.attr('id') && !isInAccordionButton && !isInAlert) {
          const headingID = createUniqueId(heading, headingOptions);
          heading.attr('id', headingID);
          idAdded = true;
        }
      });

      if (idAdded) {
        file.modified = true;
      }
    }
  },
};
