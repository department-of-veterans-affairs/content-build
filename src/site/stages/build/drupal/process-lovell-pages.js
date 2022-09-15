/* eslint-disable no-param-reassign, no-console */
const cloneDeep = require('lodash/cloneDeep');

const { camelize } = require('../../../utilities/stringHelpers');

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

function getModifiedLovellPage(page, variant) {
  const fieldOfficeMod =
    variant === 'va'
      ? LOVELL_VA_TITLE_VARIATION
      : LOVELL_TRICARE_TITLE_VARIATION;
  const linkVar =
    variant === 'va' ? LOVELL_VA_LINK_VARIATION : LOVELL_TRICARE_LINK_VARIATION;
  const originalPath = page.entityUrl.path;

  // Add a field for canonical if it has a clone and it's a tricare variant
  if (variant === 'tricare' && isLovellFederalPage(page)) {
    page.canonicalLink = page.entityUrl.path.replace(
      '/lovell-federal-health-care',
      `/lovell-federal-va-health-care`,
    );
  }

  // Modify the path
  page.entityUrl.path = originalPath.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${linkVar}-health-care`,
  );

  page.entityUrl.switchPath = originalPath.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${
      variant === 'va'
        ? LOVELL_TRICARE_LINK_VARIATION
        : LOVELL_VA_LINK_VARIATION
    }-health-care`,
  );

  // Modify the title used for querying the menus
  const variantFind = variant === 'tricare' ? 'TRICARE' : 'VA';
  const findString = `${LOVELL_TITLE_STRING} ${variantFind}`;
  const regexFind = new RegExp(findString, 'gi');

  if (page.fieldOffice) {
    // services, facilites
    if (
      page.fieldOffice.entity.entityLabel
        .toLowerCase()
        .includes(`${LOVELL_TITLE_STRING} ${variantFind}`.toLowerCase())
    ) {
      page.fieldOffice.entity.entityLabel = page.fieldOffice.entity.entityLabel.replace(
        regexFind,
        `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
      );
    } else {
      page.fieldOffice.entity.entityLabel = page.fieldOffice.entity.entityLabel.replace(
        `${LOVELL_TITLE_STRING}`,
        `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
      );
    }
  }
  if (page.fieldRegionPage) {
    if (
      page.fieldRegionPage.entity.title
        .toLowerCase()
        .includes(`${LOVELL_TITLE_STRING} ${variantFind}`.toLowerCase())
    ) {
      page.fieldRegionPage.entity.title = page.fieldRegionPage.entity.title.replace(
        regexFind,
        `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
      );
    } else {
      page.fieldRegionPage.entity.title = page.fieldRegionPage.entity.title.replace(
        `${LOVELL_TITLE_STRING}`,
        `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
      );
    }
  }

  // Modify the title this will become more complex to handle specific cases
  if (
    page.title
      .toLowerCase()
      .includes(`${LOVELL_TITLE_STRING} ${variantFind}`.toLowerCase())
  ) {
    page.title = page.title.replace(
      regexFind,
      `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
    );
  } else {
    page.title = page.title.replace(
      `${LOVELL_TITLE_STRING}`,
      `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
    );
  }

  return page;
}

function lovellMenusModifyLinks(link) {
  const { variant } = this;
  const titleVar =
    variant === 'va'
      ? LOVELL_VA_TITLE_VARIATION
      : LOVELL_TRICARE_TITLE_VARIATION;
  const linkVar =
    variant === 'va' ? LOVELL_VA_LINK_VARIATION : LOVELL_TRICARE_LINK_VARIATION;

  // Only modify the links that are in both sections
  if (link.entity.fieldMenuSection === 'both') {
    link.label = link.label.replace(
      LOVELL_TITLE_STRING,
      `${LOVELL_TITLE_STRING} ${titleVar}`,
    );

    link.url.path = link.url.path.replace(
      '/lovell-federal-health-care',
      `/lovell-federal-${linkVar}-health-care`,
    );
  }

  // Use recursion to modify nested links
  if (link && link.links.length > 0) {
    // Remove the links that don't belong in this version of the menu
    // If it's tricare va links
    // If it's va tricare links
    link.links = link.links.filter(menuItem => {
      if (menuItem.entity.fieldMenuSection === 'va' && variant === 'tricare') {
        return false;
      }
      if (menuItem.entity.fieldMenuSection === 'tricare' && variant === 'va') {
        return false;
      }
      return true;
    });
    link.links.map(lovellMenusModifyLinks, { variant });
  }

  return link;
}

function getLovellCloneMenu(drupalData, lovellMenuKey, variant) {
  const titleVar =
    variant === 'va'
      ? LOVELL_VA_TITLE_VARIATION
      : LOVELL_TRICARE_TITLE_VARIATION;

  // Clone the original menu
  const lovellCloneMenu = cloneDeep(drupalData.data[lovellMenuKey]);

  // Rename the name so our new cloned pages can find the cloned menu
  lovellCloneMenu.name = lovellCloneMenu.name.replace(
    LOVELL_TITLE_STRING,
    `${LOVELL_TITLE_STRING} ${titleVar}`,
  );

  // Change the root level item
  // It's coming in from the cms as a va item when it should be both
  lovellCloneMenu.links[0].label = 'Lovell Federal Health Care';
  lovellCloneMenu.links[0].url.path = '/lovell-federal-health-care';
  lovellCloneMenu.links[0].entity.fieldMenuSection = 'both';

  // Use recursion to Filter and Modify labels and paths of those links
  lovellCloneMenu.links = lovellCloneMenu.links.map(lovellMenusModifyLinks, {
    variant,
  });

  // create a key for the new menus
  const lovellCloneMenuKey = camelize(
    `va${lovellCloneMenu.name}FacilitySidebarQuery`,
  );
  // console.log(lovellCloneMenuKey);
  // console.dir(lovellCloneMenu, { depth: 9 });

  return {
    [lovellCloneMenuKey]: lovellCloneMenu,
  };
}

function updateLovellSwitchLinks(page, pages) {
  const allSwitchPaths = pages.map(
    switchPage => switchPage.entityUrl.switchPath,
  );
  const currentSwitchPath = page.entityUrl.switchPath;
  const isTricarePage = currentSwitchPath.includes(
    LOVELL_TRICARE_LINK_VARIATION,
  );
  const switchPathVariant = isTricarePage
    ? LOVELL_TRICARE_LINK_VARIATION
    : LOVELL_VA_LINK_VARIATION;
  const expectedPathVariant = isTricarePage
    ? LOVELL_VA_LINK_VARIATION
    : LOVELL_TRICARE_LINK_VARIATION;
  const expectedSwitchPath = currentSwitchPath.replace(
    switchPathVariant,
    expectedPathVariant,
  );

  if (!allSwitchPaths.includes(expectedSwitchPath)) {
    page.entityUrl.switchPath = false;
  }

  return page;
}

function processLovellPages(drupalData) {
  // Note: this `reduce()` function allows us to categorize all the pages with a single pass over the array.
  // We could accomplish this same outcome with a few `filter()` calls, but that would require multiple passes over the array.
  const {
    lovellFederalPages,
    lovellVaPages,
    lovellTricarePages,
    otherPages,
  } = drupalData.data.nodeQuery.entities.reduce(
    (acc, page) => {
      if (isLovellFederalPage(page)) {
        acc.lovellFederalPages.push(page);
      } else if (isLovellTricarePage(page)) {
        acc.lovellTricarePages.push(page);
      } else if (isLovellVaPage(page)) {
        acc.lovellVaPages.push(page);
      } else {
        acc.otherPages.push(page);
      }

      return acc;
    },
    {
      lovellFederalPages: [],
      lovellTricarePages: [],
      lovellVaPages: [],
      otherPages: [],
    },
  );

  // modify tricare pages
  const modifiedLovellTricarePages = lovellTricarePages.map(page =>
    getModifiedLovellPage(page, 'tricare'),
  );
  // modify va pages
  const modifiedLovellVaPages = lovellVaPages.map(page =>
    getModifiedLovellPage(page, 'va'),
  );
  // Each federal page needs to be duplicated and modified once each for tricare/va
  const lovellFederalPagesClonedTricare = lovellFederalPages.map(page =>
    getModifiedLovellPage(cloneDeep(page), 'tricare'),
  );
  const lovellFederalPagesClonedVa = lovellFederalPages.map(page =>
    getModifiedLovellPage(cloneDeep(page), 'va'),
  );

  const processedLovellPages = [
    ...modifiedLovellTricarePages,
    ...modifiedLovellVaPages,
    ...lovellFederalPagesClonedTricare,
    ...lovellFederalPagesClonedVa,
  ].map((page, index, pages) => updateLovellSwitchLinks(page, pages));

  drupalData.data.nodeQuery.entities = [...processedLovellPages, ...otherPages];

  // Clone and modify the menu
  drupalData.data = {
    ...drupalData.data,
    ...getLovellCloneMenu(drupalData, LOVELL_MENU_KEY, 'va'),
    ...getLovellCloneMenu(drupalData, LOVELL_MENU_KEY, 'tricare'),
  };
  // Remove the original menu
  delete drupalData.data[LOVELL_MENU_KEY];
}

module.exports = {
  processLovellPages,
};
