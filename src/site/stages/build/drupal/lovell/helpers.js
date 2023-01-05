const LOVELL_TITLE_STRING = 'Lovell Federal';
const LOVELL_FEDERAL_ENTITY_ID = '347';
const LOVELL_TRICARE_ENTITY_ID = '1039';
const LOVELL_VA_ENTITY_ID = '1040';
const LOVELL_MENU_KEY = 'lovellFederalHealthCareFacilitySidebarQuery';
const LOVELL_VA_TITLE_VARIATION = 'VA';
const LOVELL_TRICARE_TITLE_VARIATION = 'TRICARE';
const LOVELL_VA_LINK_VARIATION = 'va';
const LOVELL_TRICARE_LINK_VARIATION = 'tricare';

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
    'event_listing',
    'press_releases_listing',
    'story_listing',
  ];

  return listingPageTypes.includes(page.entityBundle);
}

function resetToFederalUrlIfNeeded(path, variant) {
  const oppositeVariant =
    variant === 'va' ? LOVELL_TRICARE_LINK_VARIATION : LOVELL_VA_LINK_VARIATION;
  const reverseUrl = `/lovell-federal-${oppositeVariant}-health-care`;

  if (path.includes(reverseUrl)) {
    return path.replace(reverseUrl, `/lovell-federal-health-care`);
  }

  return path;
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
  isLovellFederalPage,
  isLovellTricarePage,
  isLovellVaPage,
  isListingPage,
  resetToFederalUrlIfNeeded,
};
