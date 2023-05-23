const { lovellPageHasVariantUrl } = require('./helpers');
const { processLovellPages } = require('../process-lovell-pages');

const LOVELL_TRICARE_HOMEPAGE = '49011';
const LOVELL_VA_HOMEPAGE = '49451';

const LOVELL_FEDERAL_STORY_LISTING = '36321';
const LOVELL_TRICARE_STORY_LISTING = '49630';
const LOVELL_VA_STORY_LISTING = '49631';

const LOVELL_FEDERAL_EVENT_LISTING = '36319';
const LOVELL_TRICARE_EVENT_LISTING = '49454';
const LOVELL_VA_EVENT_LISTING = '49455';

const LOVELL_FEDERAL_PRESS_RELEASE_LISTING = '36320';
const LOVELL_TRICARE_PRESS_RELEASE_LISTING = '49628';
const LOVELL_VA_PRESS_RELEASE_LISTING = '49629';

const nodeDependencies = {
  [LOVELL_TRICARE_HOMEPAGE]: [
    LOVELL_FEDERAL_STORY_LISTING,
    LOVELL_TRICARE_STORY_LISTING,
    LOVELL_FEDERAL_EVENT_LISTING,
    LOVELL_TRICARE_EVENT_LISTING,
  ],
  [LOVELL_VA_HOMEPAGE]: [
    LOVELL_FEDERAL_STORY_LISTING,
    LOVELL_VA_STORY_LISTING,
    LOVELL_FEDERAL_EVENT_LISTING,
    LOVELL_VA_EVENT_LISTING,
  ],
  [LOVELL_TRICARE_STORY_LISTING]: [LOVELL_FEDERAL_STORY_LISTING],
  [LOVELL_VA_STORY_LISTING]: [LOVELL_FEDERAL_STORY_LISTING],
  [LOVELL_TRICARE_EVENT_LISTING]: [LOVELL_FEDERAL_EVENT_LISTING],
  [LOVELL_VA_EVENT_LISTING]: [LOVELL_FEDERAL_EVENT_LISTING],
  [LOVELL_TRICARE_PRESS_RELEASE_LISTING]: [
    LOVELL_FEDERAL_PRESS_RELEASE_LISTING,
  ],
  [LOVELL_VA_PRESS_RELEASE_LISTING]: [LOVELL_FEDERAL_PRESS_RELEASE_LISTING],
};

const getLovellPreviewNodeDependencies = nodeId =>
  nodeDependencies[nodeId] || [];

const processLovellPagesForPreview = drupalData => {
  //  `processLovellPages` expects nodes to be at drupalData.data.nodeQuery,
  //  so we first create a reference to drupalData.data.nodes.

  /* eslint-disable-next-line no-param-reassign */
  drupalData.data.nodeQuery = drupalData.data.nodes;
  processLovellPages(drupalData);
};

const getLovellPreviewPage = (drupalData, nodeId, variant) => {
  // Get pages that match nodeId of originally requested node.
  // If more than one page is returned here, it's because the page was
  // cloned during Lovell-specific processing. In that case, we need
  // to grab the VA or TRICARE version based on a query parameter.
  // Default to 'va'.
  const lovellVariant = variant === 'tricare' ? 'tricare' : 'va';
  return drupalData?.data?.nodes?.entities
    .filter?.(entity => entity.entityId === nodeId)
    .find?.(page => lovellPageHasVariantUrl(page, lovellVariant));
};

module.exports = {
  getLovellPreviewNodeDependencies,
  processLovellPagesForPreview,
  getLovellPreviewPage,
};
