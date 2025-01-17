/* eslint-disable no-param-reassign */
const { ENTITY_BUNDLES } = require('../../../constants/content-modeling');

const MANILA_VA_CLINIC_ENTITY_ID = '1187';

function getManilaClinicUrl(path) {
  return typeof path === 'string'
    ? path.replace(/manila-va-system/i, 'manila-va-clinic')
    : path;
}

function isManilaVAClinicPage(page) {
  return (
    page.fieldAdministration?.entity?.entityId === MANILA_VA_CLINIC_ENTITY_ID
  );
}

function isManillaVaRegionHomepage(page) {
  return (
    isManilaVAClinicPage(page) &&
    page.entityBundle === ENTITY_BUNDLES.HEALTH_CARE_REGION_PAGE
  );
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
  if (page.fieldOffice?.entity?.entityUrl) {
    page.fieldOffice.entity.entityUrl.path = getManilaClinicUrl(
      page.fieldOffice.entity.entityUrl.path,
    );
  }

  // Update any listing page links
  if (page.fieldListing?.entity?.entityUrl) {
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
        // Federal Region Homepage should not be created for Manila VA Clinic
        if (isManillaVaRegionHomepage(page)) {
          return acc;
        }
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
