/* eslint-disable no-param-reassign */
const cloneDeep = require('lodash/cloneDeep');

const { camelize } = require('../../../utilities/stringHelpers');

const LOVELL_TITLE_STRING = 'Lovell Federal';
const LOVELL_FEDERAL_ENTITY_ID = '347';
const LOVELL_TRICARE_ENTITY_ID = '1039';
const LOVELL_VA_ENTITY_ID = '1040';
const LOVELL_MENU_KEY = 'lovellFederalHealthCareFacilitySidebarQuery';
const LOVELL_VA_TITLE_VARIATION = 'VA';
const LOVELL_TRICARE_TITLE_VARIATION = 'TRICARE';
const LOVELL_VA_LINK_VARIAION = 'va';
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
    variant === 'va' ? LOVELL_VA_LINK_VARIAION : LOVELL_TRICARE_LINK_VARIATION;

  // Add a field for canonical if it has a clone and it's a tricare variant
  if (variant === 'tricare' && isLovellFederalPage(page)) {
    page.canonicalLink = page.entityUrl.path.replace(
      '/lovell-federal-health-care',
      `/lovell-federal-va-health-care`,
    );
  }

  // Modify the path
  page.entityUrl.path = page.entityUrl.path.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${linkVar}-health-care`,
  );

  // Modify the title used for querying the menus
  if (page.fieldOffice) {
    page.fieldOffice.entity.entityLabel = page.fieldOffice.entity.entityLabel.replace(
      LOVELL_TITLE_STRING,
      `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
    );
  }
  if (page.fieldRegionPage) {
    page.fieldRegionPage.entity.title = page.fieldRegionPage.entity.title.replace(
      LOVELL_TITLE_STRING,
      `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
    );
  }

  // Modify the title this will become more complex to handle specific cases
  page.title = page.title.replace(
    LOVELL_TITLE_STRING,
    `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
  );

  return page;
}

function lovellMenusModifyLinks(link) {
  const { variant } = this;
  const titleVar =
    variant === 'va'
      ? LOVELL_VA_TITLE_VARIATION
      : LOVELL_TRICARE_TITLE_VARIATION;
  const linkVar =
    variant === 'va' ? LOVELL_VA_LINK_VARIAION : LOVELL_TRICARE_LINK_VARIATION;

  link.label = link.label.replace(
    LOVELL_TITLE_STRING,
    `${LOVELL_TITLE_STRING} ${titleVar}`,
  );

  link.url.path = link.url.path.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${linkVar}-health-care`,
  );

  // Use recursion to modify nested links
  if (link && link.links.length > 0) {
    // Remove the links that don't belong in either the va or tricare menus
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

  // Modify labels and paths of the cloned menu links
  lovellCloneMenu.links = lovellCloneMenu.links.map(lovellMenusModifyLinks, {
    variant,
  });

  // create a key for the new menus
  const lovellCloneMenuKey = camelize(
    `va${lovellCloneMenu.name}FacilitySidebarQuery`,
  );

  return {
    [lovellCloneMenuKey]: lovellCloneMenu,
  };
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

  drupalData.data.nodeQuery.entities = [
    ...modifiedLovellTricarePages,
    ...modifiedLovellVaPages,
    ...lovellFederalPagesClonedTricare,
    ...lovellFederalPagesClonedVa,
    ...otherPages,
  ];

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
