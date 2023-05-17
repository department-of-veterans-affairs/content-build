const { ENTITY_BUNDLES } = require('../../../../constants/content-modeling');

const LOVELL_TITLE_STRING = 'Lovell Federal';
const LOVELL_FEDERAL_ENTITY_ID = '347';
const LOVELL_TRICARE_ENTITY_ID = '1039';
const LOVELL_VA_ENTITY_ID = '1040';
const LOVELL_MENU_KEY = 'lovellFederalHealthCareFacilitySidebarQuery';
const LOVELL_VA_TITLE_VARIATION = 'VA';
const LOVELL_TRICARE_TITLE_VARIATION = 'TRICARE';
const LOVELL_VA_LINK_VARIATION = 'va';
const LOVELL_TRICARE_LINK_VARIATION = 'tricare';
const LOVELL_BASE_URL = '/lovell-federal-health-care';

function isLovellFederalPage(page) {
  return (
    page?.fieldAdministration?.entity?.entityId === LOVELL_FEDERAL_ENTITY_ID
  );
}

function isLovellTricarePage(page) {
  return (
    page?.fieldAdministration?.entity?.entityId === LOVELL_TRICARE_ENTITY_ID
  );
}

function isLovellVaPage(page) {
  return page?.fieldAdministration?.entity?.entityId === LOVELL_VA_ENTITY_ID;
}

function isListingPage(page) {
  const listingPageTypes = [
    ENTITY_BUNDLES.EVENT_LISTING,
    ENTITY_BUNDLES.PRESS_RELEASES_LISTING,
    ENTITY_BUNDLES.STORY_LISTING,
  ];

  return listingPageTypes.includes(page.entityBundle);
}

function isFederalRegionHomepage(page) {
  return (
    isLovellFederalPage(page) &&
    page.entityBundle === ENTITY_BUNDLES.HEALTH_CARE_REGION_PAGE
  );
}

function isTricareRegionHomepage(page) {
  return (
    isLovellTricarePage(page) &&
    page.entityBundle === ENTITY_BUNDLES.HEALTH_CARE_REGION_PAGE
  );
}

function isVaRegionHomepage(page) {
  return (
    isLovellVaPage(page) &&
    page.entityBundle === ENTITY_BUNDLES.HEALTH_CARE_REGION_PAGE
  );
}

function getLovellTitle(variant) {
  return `${LOVELL_TITLE_STRING} health care - ${variant}`;
}

function getLovellTitleVariation(variant) {
  return variant === 'va' || variant.includes('va')
    ? LOVELL_VA_TITLE_VARIATION
    : LOVELL_TRICARE_TITLE_VARIATION;
}

function getLovellUrl(linkVar) {
  return `/lovell-federal-health-care-${linkVar}`;
}

function getLovellVariantOfUrl(path, linkVar) {
  return path.replace(
    /\/lovell-federal-health-care(?:(?:-va|-tricare)?)/i,
    getLovellUrl(linkVar),
  );
}

module.exports = {
  LOVELL_TITLE_STRING,
  LOVELL_FEDERAL_ENTITY_ID,
  LOVELL_TRICARE_ENTITY_ID,
  LOVELL_VA_ENTITY_ID,
  LOVELL_MENU_KEY,
  LOVELL_VA_TITLE_VARIATION,
  LOVELL_TRICARE_TITLE_VARIATION,
  LOVELL_VA_LINK_VARIATION,
  LOVELL_TRICARE_LINK_VARIATION,
  LOVELL_BASE_URL,
  isLovellFederalPage,
  isLovellTricarePage,
  isLovellVaPage,
  isListingPage,
  isFederalRegionHomepage,
  isTricareRegionHomepage,
  isVaRegionHomepage,
  getLovellTitle,
  getLovellTitleVariation,
  getLovellUrl,
  getLovellVariantOfUrl,
};
