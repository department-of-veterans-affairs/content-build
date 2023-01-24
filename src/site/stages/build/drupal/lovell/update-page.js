const cloneDeep = require('lodash/cloneDeep');
const {
  LOVELL_TITLE_STRING,
  LOVELL_VA_TITLE_VARIATION,
  LOVELL_TRICARE_TITLE_VARIATION,
  LOVELL_VA_LINK_VARIATION,
  LOVELL_TRICARE_LINK_VARIATION,
  isLovellFederalPage,
  getLovellTitle,
  getLovellUrl,
  getLovellFormOfExistingUrl,
  resetToFederalUrlIfNeeded,
} = require('./helpers');

function getLovellPageVariables(page, variant) {
  const variantName =
    variant === 'va'
      ? LOVELL_VA_TITLE_VARIATION
      : LOVELL_TRICARE_TITLE_VARIATION;
  const pageClone = cloneDeep(page);

  return {
    page: pageClone,
    variant,
    variantName,
    linkVar:
      variant === 'va'
        ? LOVELL_VA_LINK_VARIATION
        : LOVELL_TRICARE_LINK_VARIATION,
    regexNeedle: new RegExp(`${LOVELL_TITLE_STRING} ${variantName}`, 'gi'),
  };
}

function getLovellVariantPath(vars) {
  const { page, linkVar, variant } = vars;
  let pagePath = page.entityUrl.path;

  if (isLovellFederalPage(page)) {
    pagePath = resetToFederalUrlIfNeeded(page.entityUrl.path, variant);
  }

  return getLovellFormOfExistingUrl(pagePath, linkVar);
}

function getLovellCanonicalLink(vars) {
  const { page } = vars;

  return getLovellFormOfExistingUrl(
    page.entityUrl.path,
    LOVELL_VA_LINK_VARIATION,
  );
}

function getLovellSwitchPath(vars) {
  const { page, variant } = vars;
  const currentVariant =
    variant === 'va' ? LOVELL_VA_LINK_VARIATION : LOVELL_TRICARE_LINK_VARIATION;
  const oppositeVariant =
    variant === 'va' ? LOVELL_TRICARE_LINK_VARIATION : LOVELL_VA_LINK_VARIATION;
  const isVariantUrl =
    page.entityUrl.path.includes(getLovellUrl(LOVELL_TRICARE_LINK_VARIATION)) ||
    page.entityUrl.path.includes(getLovellUrl(LOVELL_VA_LINK_VARIATION));

  if (isVariantUrl) {
    return page.entityUrl.path.replace(currentVariant, oppositeVariant);
  }

  // If not a variant page, gets switch link option for federal pages
  return getLovellFormOfExistingUrl(page.entityUrl.path, oppositeVariant);
}

function getLovellBreadcrumbs(vars) {
  const { page, variantName, linkVar } = vars;
  // Modify Breadcrumb
  return page.entityUrl.breadcrumb.map(crumb => {
    // eslint-disable-next-line no-param-reassign
    crumb.text = crumb.text.replace(
      /Lovell Federal (VA )?health care/,
      getLovellTitle(variantName),
    );
    // eslint-disable-next-line no-param-reassign
    crumb.url.path = crumb.url.path.replace(
      /\/lovell-federal-(va-)?health-care/,
      getLovellUrl(linkVar),
    );
    return crumb;
  });
}

function getLovellVariantTitle(title, vars) {
  const { variantName, regexNeedle } = vars;

  if (
    title
      .toLowerCase()
      .includes(`${LOVELL_TITLE_STRING} ${variantName}`.toLowerCase())
  ) {
    return title.replace(regexNeedle, getLovellTitle(variantName));
  }

  return title.replace(`${LOVELL_TITLE_STRING}`, getLovellTitle(variantName));
}

module.exports = {
  getLovellPageVariables,
  getLovellFormOfExistingUrl,
  getLovellVariantPath,
  getLovellCanonicalLink,
  getLovellSwitchPath,
  getLovellBreadcrumbs,
  getLovellVariantTitle,
};
