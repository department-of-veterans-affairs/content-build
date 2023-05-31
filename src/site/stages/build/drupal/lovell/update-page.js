const cloneDeep = require('lodash/cloneDeep');
const {
  LOVELL_TITLE_STRING,
  LOVELL_VA_LINK_VARIATION,
  LOVELL_TRICARE_LINK_VARIATION,
  getLovellTitle,
  getLovellTitleVariation,
  getLovellVariantOfUrl,
} = require('./helpers');

function getLovellPageVariables(page, variant) {
  const variantName = getLovellTitleVariation(variant);
  const pageClone = cloneDeep(page);

  return {
    page: pageClone,
    variant,
    variantName,
    linkVar:
      variant === 'va'
        ? LOVELL_VA_LINK_VARIATION
        : LOVELL_TRICARE_LINK_VARIATION,
  };
}

function getLovellVariantPath(vars) {
  const { page, linkVar } = vars;

  return getLovellVariantOfUrl(page.entityUrl.path, linkVar);
}

function getLovellCanonicalLink(vars) {
  const { page } = vars;

  return getLovellVariantOfUrl(page.entityUrl.path, LOVELL_VA_LINK_VARIATION);
}

function getLovellSwitchPath(vars) {
  const { page, variant } = vars;
  const oppositeVariant =
    variant === 'va' ? LOVELL_TRICARE_LINK_VARIATION : LOVELL_VA_LINK_VARIATION;

  return getLovellVariantOfUrl(page.entityUrl.path, oppositeVariant);
}

function getLovellVariantTitle(title, vars) {
  const { variantName } = vars;

  return title.replace(
    new RegExp(
      `${LOVELL_TITLE_STRING} health care(?:(?: - VA| - TRICARE)?)`,
      'i',
    ),
    getLovellTitle(variantName),
  );
}

function getLovellBreadcrumbs(vars) {
  const { page, linkVar } = vars;
  // Modify Breadcrumb
  return page.entityUrl.breadcrumb.map(crumb => {
    // eslint-disable-next-line no-param-reassign
    crumb.text = getLovellVariantTitle(crumb.text, vars);

    // eslint-disable-next-line no-param-reassign
    crumb.url.path = getLovellVariantOfUrl(crumb.url.path, linkVar);

    return crumb;
  });
}

module.exports = {
  getLovellPageVariables,
  getLovellVariantPath,
  getLovellCanonicalLink,
  getLovellSwitchPath,
  getLovellBreadcrumbs,
  getLovellVariantTitle,
};
