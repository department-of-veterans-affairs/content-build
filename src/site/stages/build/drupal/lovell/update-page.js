const cloneDeep = require('lodash/cloneDeep');
const {
  LOVELL_TITLE_STRING,
  LOVELL_VA_TITLE_VARIATION,
  LOVELL_TRICARE_TITLE_VARIATION,
  LOVELL_VA_LINK_VARIATION,
  LOVELL_TRICARE_LINK_VARIATION,
  isLovellFederalPage,
  resetToFederalUrlIfNeeded,
} = require('./helpers');

function getLovellPageVariables(page, variant) {
  const variantName = variant === 'tricare' ? 'TRICARE' : 'VA';
  const pageClone = cloneDeep(page);

  return {
    pageClone,
    variant,
    variantName,
    linkVar:
      variant === 'va'
        ? LOVELL_VA_LINK_VARIATION
        : LOVELL_TRICARE_LINK_VARIATION,
    fieldOfficeMod:
      variant === 'va'
        ? LOVELL_VA_TITLE_VARIATION
        : LOVELL_TRICARE_TITLE_VARIATION,
    regexNeedle: new RegExp(`${LOVELL_TITLE_STRING} ${variantName}`, 'gi'),
  };
}

function getLovellVariantPath(vars) {
  const { page, linkVar, variant } = vars;
  let pagePath = page.entityUrl.path;

  if (isLovellFederalPage(page)) {
    pagePath = resetToFederalUrlIfNeeded(page.entityUrl.path, variant);
  }

  return pagePath.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${linkVar}-health-care`,
  );
}

function getLovellCanonicalLink(vars) {
  const { page } = vars;

  return page.entityUrl.path.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-va-health-care`,
  );
}

function getLovellSwitchPath(vars) {
  const { page, variant } = vars;
  const currentVariant =
    variant === 'va' ? LOVELL_VA_LINK_VARIATION : LOVELL_TRICARE_LINK_VARIATION;
  const oppositeVariant =
    variant === 'va' ? LOVELL_TRICARE_LINK_VARIATION : LOVELL_VA_LINK_VARIATION;
  const isVariantUrl =
    page.entityUrl.path.includes(
      `/lovell-federal-${LOVELL_TRICARE_LINK_VARIATION}-health-care`,
    ) ||
    page.entityUrl.path.includes(
      `/lovell-federal-${LOVELL_VA_LINK_VARIATION}-health-care`,
    );

  if (isVariantUrl) {
    return page.entityUrl.path.replace(currentVariant, oppositeVariant);
  }

  // If not a variant page, gets switch link option for federal pages
  return page.entityUrl.path.replace(
    '/lovell-federal-health-care',
    `/lovell-federal-${oppositeVariant}-health-care`,
  );
}

function getLovellBreadcrumbs(vars) {
  const { page, fieldOfficeMod, linkVar } = vars;
  // Modify Breadcrumb
  return page.entityUrl.breadcrumb.map(crumb => {
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

function getLovellVariantTitle(title, vars) {
  const { variantName, regexNeedle, fieldOfficeMod } = vars;

  if (
    title
      .toLowerCase()
      .includes(`${LOVELL_TITLE_STRING} ${variantName}`.toLowerCase())
  ) {
    return title.replace(
      regexNeedle,
      `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
    );
  }

  return title.replace(
    `${LOVELL_TITLE_STRING}`,
    `${LOVELL_TITLE_STRING} ${fieldOfficeMod}`,
  );
}

module.exports = {
  getLovellPageVariables,
  getLovellVariantPath,
  getLovellCanonicalLink,
  getLovellSwitchPath,
  getLovellBreadcrumbs,
  getLovellVariantTitle,
};
