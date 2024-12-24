/* eslint-disable no-param-reassign */
function getManilaClinicUrl(path) {
  return path.replace(/manila-va-system/i, 'manila-va-clinic');
}

function isManilaVAClinicPage(page) {
  return page?.fieldAdministration?.entity?.entityId === '1187';
}

function updateManilaSystemLinks(page) {
  // Update main URL path
  if (page.entityUrl?.path) {
    page.entityUrl.path = getManilaClinicUrl(page.entityUrl.path);
  }

  // Update breadcrumb links
  if (page.entityUrl?.breadcrumb) {
    page.entityUrl.breadcrumb = page.entityUrl.breadcrumb.map(crumb => ({
      ...crumb,
      url: crumb.url ? getManilaClinicUrl(crumb.url) : crumb.url,
    }));
  }

  // Update field office links
  if (page?.fieldOffice?.entity?.entityUrl) {
    page.fieldOffice.entity.entityUrl.path = getManilaClinicUrl(
      page.fieldOffice.entity.entityUrl.path,
    );
  }

  // Update any listing page links
  if (page?.fieldListing?.entity?.entityUrl) {
    page.fieldListing.entity.entityUrl.path = getManilaClinicUrl(
      page.fieldListing.entity.entityUrl.path,
    );
  }

  return page;
}

function processManilaPages(drupalData) {
  const {
    manilaVAClinicPages,
    otherPages,
  } = drupalData.data.nodeQuery.entities.reduce(
    (acc, page) => {
      if (isManilaVAClinicPage(page)) {
        acc.manilaVAClinicPages.push(page);
      } else {
        acc.otherPages.push(page);
      }

      return acc;
    },
    {
      manilaVAClinicPages: [],
      otherPages: [],
    },
  );

  const processedManilaPages = [
    ...manilaVAClinicPages,
  ].map((page, _index, _pages) => updateManilaSystemLinks(page));

  drupalData.data.nodeQuery.entities = [...processedManilaPages, ...otherPages];
}

module.exports = {
  processManilaPages,
};
