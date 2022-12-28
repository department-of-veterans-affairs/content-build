/* eslint-disable camelcase */
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

function isListingPage(page) {
  const listingPageTypes = [
    'event_listing',
    'press_releases_listing',
    'story_listing',
  ];

  return listingPageTypes.includes(page.entityBundle);
}

function getModifiedLovellPage(page, variant) {
  const fieldOfficeMod =
    variant === 'va'
      ? LOVELL_VA_TITLE_VARIATION
      : LOVELL_TRICARE_TITLE_VARIATION;
  const linkVar =
    variant === 'va' ? LOVELL_VA_LINK_VARIATION : LOVELL_TRICARE_LINK_VARIATION;

  // Fix any incorrect URLs based on the variant
  if (isLovellFederalPage(page)) {
    const oppositeVariant =
      variant === 'va'
        ? LOVELL_TRICARE_LINK_VARIATION
        : LOVELL_VA_LINK_VARIATION;
    const reverseUrl = `/lovell-federal-${oppositeVariant}-health-care`;

    if (page.entityUrl.path.includes(reverseUrl)) {
      page.entityUrl.path = page.entityUrl.path.replace(
        reverseUrl,
        `/lovell-federal-health-care`,
      );
    }
  }

  // Add a field for canonical if it has a clone and it's a tricare variant
  if (variant === 'tricare' && isLovellFederalPage(page)) {
    page.canonicalLink = page.entityUrl.path.replace(
      '/lovell-federal-health-care',
      `/lovell-federal-va-health-care`,
    );
  }

  // Modify the path
  const modifiedPath = page.entityUrl.path.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${linkVar}-health-care`,
  );
  page.entityUrl.path = modifiedPath;

  // Add a switchPath field
  // These get modified later in the processLovellPages function
  if (
    page.entityUrl.path.includes(
      `/lovell-federal-${LOVELL_TRICARE_LINK_VARIATION}-health-care`,
    ) ||
    page.entityUrl.path.includes(
      `/lovell-federal-${LOVELL_VA_LINK_VARIATION}-health-care`,
    )
  ) {
    page.entityUrl.switchPath = page.entityUrl.path.replace(
      variant === 'va'
        ? LOVELL_VA_LINK_VARIATION
        : LOVELL_TRICARE_LINK_VARIATION,
      variant === 'va'
        ? LOVELL_TRICARE_LINK_VARIATION
        : LOVELL_VA_LINK_VARIATION,
    );
  } else {
    page.entityUrl.switchPath = page.entityUrl.path.replace(
      '/lovell-federal-health-care',
      `/lovell-federal-${
        variant === 'va'
          ? LOVELL_TRICARE_LINK_VARIATION
          : LOVELL_VA_LINK_VARIATION
      }-health-care`,
    );
  }

  // Modify Breadcrumb
  if (page.entityUrl.breadcrumb) {
    page.entityUrl.breadcrumb = page.entityUrl.breadcrumb.map(crumb => {
      crumb.text = crumb.text.replace(
        /Lovell Federal (VA )?health care/,
        `${LOVELL_TITLE_STRING} ${fieldOfficeMod} health care`,
      );
      crumb.url.path = crumb.url.path.replace(
        /\/lovell-federal-(va-)?health-care/,
        `/lovell-federal-${linkVar}-health-care`,
      );
      return crumb;
    });
  }

  // Modify the title used for querying the menus
  const variantName = variant === 'tricare' ? 'TRICARE' : 'VA';
  const titleNeedle = `${LOVELL_TITLE_STRING} ${variantName}`;
  const regexNeedle = new RegExp(titleNeedle, 'gi');

  if (page.fieldOffice) {
    // services, facilites
    if (
      page.fieldOffice.entity.entityLabel
        .toLowerCase()
        .includes(`${LOVELL_TITLE_STRING} ${variantName}`.toLowerCase())
    ) {
      page.fieldOffice.entity.entityLabel = page.fieldOffice.entity.entityLabel.replace(
        regexNeedle,
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
        .includes(`${LOVELL_TITLE_STRING} ${variantName}`.toLowerCase())
    ) {
      page.fieldRegionPage.entity.title = page.fieldRegionPage.entity.title.replace(
        regexNeedle,
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
      .includes(`${LOVELL_TITLE_STRING} ${variantName}`.toLowerCase())
  ) {
    page.title = page.title.replace(
      regexNeedle,
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

  // Move federal health care links to the top of the menu
  // Otherwise the menu renders as blank
  const federalLinksIndex = lovellCloneMenu.links
    .map(menu => menu.label)
    .indexOf('Lovell Federal health care');
  const federalLinks = lovellCloneMenu.links.splice(federalLinksIndex, 1);
  lovellCloneMenu.links = [...federalLinks, ...lovellCloneMenu.links];

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

/**
 * For each listing page in tricareOrVaPages, finds the first occurrence of that listing page type in
 * federalPages and injects pastEvents and reverseFieldListingNode from that entity into
 * corresponding properties on the listing page from tricareOrVaPages.
 *
 * @param {*} tricareOrVaPages Listing pages that will have pastEvents and reverseFieldListingNode properties merged from federalPages
 * @param {*} federalPages Listing pages to merge into tricareOrVaPages
 * @returns
 */
function combineLovellListingPages(tricareOrVaPages, federalPages) {
  return tricareOrVaPages.map(listingPage => {
    const typePastMap = {
      event_listing: 'pastEvents',
      press_releases_listing: 'pastPressReleases',
      story_listing: 'pastNewsStories',
    };
    const pastObjectLabel = typePastMap[listingPage.entityBundle];
    const {
      entityBundle,
      [pastObjectLabel]: pastListItems,
      reverseFieldListingNode,
    } = listingPage;

    const listingPageToCombine = federalPages.find(
      page => page.entityBundle === entityBundle,
    );

    const {
      [pastObjectLabel]: pastListItemsToCombine,
      reverseFieldListingNode: reverseFieldListingNodeToCombine,
    } = listingPageToCombine;

    const pastListItemEntities = pastListItems?.entities || [];
    const allListItemEntities = reverseFieldListingNode?.entities || [];

    const pastListItemEntitiesToCombine =
      pastListItemsToCombine?.entities || [];
    const allListItemEntitiesToCombine =
      reverseFieldListingNodeToCombine?.entities || [];

    const combinedPastListItemEntities = [
      ...pastListItemEntities,
      ...pastListItemEntitiesToCombine,
    ];
    const combinedAllListItemEntities = [
      ...allListItemEntities,
      ...allListItemEntitiesToCombine,
    ];

    return {
      ...listingPage,
      reverseFieldListingNode: {
        ...reverseFieldListingNode,
        entities: combinedAllListItemEntities,
      },
      [pastObjectLabel]: {
        ...pastListItems,
        entities: combinedPastListItemEntities,
      },
    };
  });
}

function processLovellPages(drupalData) {
  // Note: this `reduce()` function allows us to categorize all the pages with a single pass over the array.
  // We could accomplish this same outcome with a few `filter()` calls, but that would require multiple passes over the array.
  const {
    lovellFederalListingPages,
    lovellFederalNonListingPages,
    lovellVaListingPages,
    lovellVaNonListingPages,
    lovellTricareListingPages,
    lovellTricareNonListingPages,
    otherPages,
  } = drupalData.data.nodeQuery.entities.reduce(
    (acc, page) => {
      if (isLovellFederalPage(page)) {
        if (isListingPage(page)) {
          acc.lovellFederalListingPages.push(page);
        } else {
          acc.lovellFederalNonListingPages.push(page);
        }
      } else if (isLovellTricarePage(page)) {
        if (isListingPage(page)) {
          acc.lovellTricareListingPages.push(page);
        } else {
          acc.lovellTricareNonListingPages.push(page);
        }
      } else if (isLovellVaPage(page)) {
        if (isListingPage(page)) {
          acc.lovellVaListingPages.push(page);
        } else {
          acc.lovellVaNonListingPages.push(page);
        }
      } else {
        acc.otherPages.push(page);
      }

      return acc;
    },
    {
      lovellFederalListingPages: [],
      lovellFederalNonListingPages: [],
      lovellTricareListingPages: [],
      lovellTricareNonListingPages: [],
      lovellVaListingPages: [],
      lovellVaNonListingPages: [],
      otherPages: [],
    },
  );

  const lovellTricareListingPagesWithFederal = combineLovellListingPages(
    lovellTricareListingPages,
    lovellFederalListingPages,
  );
  const lovellVaListingPagesWithFederal = combineLovellListingPages(
    lovellVaListingPages,
    lovellFederalListingPages,
  );

  // modify all tricare pages
  const lovellTricarePages = [
    ...lovellTricareListingPagesWithFederal,
    ...lovellTricareNonListingPages,
  ];
  const modifiedLovellTricarePages = lovellTricarePages.map(page =>
    getModifiedLovellPage(page, 'tricare'),
  );
  // modify all va pages
  const lovellVaPages = [
    ...lovellVaListingPagesWithFederal,
    ...lovellVaNonListingPages,
  ];
  const modifiedLovellVaPages = lovellVaPages.map(page =>
    getModifiedLovellPage(page, 'va'),
  );
  // Each federal page needs to be duplicated and modified once each for tricare/va
  const lovellFederalPagesClonedTricare = lovellFederalNonListingPages.map(
    page => getModifiedLovellPage(cloneDeep(page), 'tricare'),
  );
  const lovellFederalPagesClonedVa = lovellFederalNonListingPages.map(page =>
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
  isLovellTricarePage,
  isLovellVaPage,
  processLovellPages,
};
