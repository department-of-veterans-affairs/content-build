const {
  LOVELL_TITLE_STRING,
  LOVELL_VA_LINK_VARIATION,
  LOVELL_TRICARE_LINK_VARIATION,
  isLovellFederalPage,
  resetToFederalUrlIfNeeded,
} = require('./helpers');

function updateLovellPagePath(vars) {
  const { page, linkVar, variant } = vars;

  if (isLovellFederalPage(page)) {
    page.entityUrl.path = resetToFederalUrlIfNeeded(
      page.entityUrl.path,
      variant,
    );
  }

  const modifiedPath = page.entityUrl.path.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${linkVar}-health-care`,
  );

  page.entityUrl.path = modifiedPath;
}

function updateLovellPageCanonicalLink(vars) {
  const { page, variant } = vars;

  if (variant === 'tricare' && isLovellFederalPage(page)) {
    page.entityUrl.path.replace(
      '/lovell-federal-health-care',
      `/lovell-federal-va-health-care`,
    );
  }
}

function updateLovellPageSwitchPath(vars) {
  const { page, variant } = vars;

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
}

function updateLovellPageBreadcrumbs(vars) {
  const { page, fieldOfficeMod, linkVar } = vars;
  // Modify Breadcrumb
  if (page.entityUrl.breadcrumb) {
    page.entityUrl.breadcrumb = page.entityUrl.breadcrumb.map(crumb => {
      // eslint-disable-next-line no-param-reassign
      crumb.text = crumb.text.replace(
        /Lovell Federal (VA )?health care/,
        `${LOVELL_TITLE_STRING} ${fieldOfficeMod} health care`,
      );
      // eslint-disable-next-line no-param-reassign
      crumb.url.path = crumb.url.path.replace(
        /\/lovell-federal-(va-)?health-care/,
        `/lovell-federal-${linkVar}-health-care`,
      );
      return crumb;
    });
  }
}

function updateLovellPageFieldRegionPage(vars) {
  const { page, variantName, regexNeedle, fieldOfficeMod } = vars;

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
}

function updateLovellPageFieldOfficeTitle(vars) {
  const { page, variantName, regexNeedle, fieldOfficeMod } = vars;

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
}

function updateLovellPageTitle(vars) {
  const { page, variantName, regexNeedle, fieldOfficeMod } = vars;

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
}

module.exports = {
  updateLovellPagePath,
  updateLovellPageCanonicalLink,
  updateLovellPageSwitchPath,
  updateLovellPageBreadcrumbs,
  updateLovellPageFieldRegionPage,
  updateLovellPageFieldOfficeTitle,
  updateLovellPageTitle,
};
