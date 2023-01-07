import cloneDeep from 'lodash/cloneDeep';
import sidebarTemplate from './sidebar.json';
import { findSidebarMenuLinkBySectionAndOptionalLabel } from '../utils';

/**
 * Generates an individual location menu link
 */
const generateSidebarLocation = (lovellVariant, label, urlString) => ({
  label: `${lovellVariant.toUpperCase()} Location ${label}`,
  url: {
    path: `/lovell-federal-${lovellVariant}-health-care/locations/${urlString}`,
  },
  entity: {
    fieldMenuSection: lovellVariant,
  },
  links: [],
});

/**
 * Generates a sidebar menu tree for testing
 */
export default (vaLocationCount, tricareLocationCount) => {
  const sidebar = cloneDeep(sidebarTemplate);

  const lovellFederal = findSidebarMenuLinkBySectionAndOptionalLabel(
    sidebar.links,
    'both',
  );

  const servicesAndLocations = findSidebarMenuLinkBySectionAndOptionalLabel(
    lovellFederal.links,
    'both',
    'Services and Locations',
  );

  const vaLocations = findSidebarMenuLinkBySectionAndOptionalLabel(
    servicesAndLocations.links,
    'va',
    'Locations',
  );
  vaLocations.links = [...Array(vaLocationCount)].map((item, i) =>
    generateSidebarLocation('va', i + 1, `va-location-${i + 1}`),
  );

  const tricareLocations = findSidebarMenuLinkBySectionAndOptionalLabel(
    servicesAndLocations.links,
    'tricare',
    'Locations',
  );
  tricareLocations.links = [...Array(tricareLocationCount)].map((item, i) =>
    generateSidebarLocation('tricare', i + 1, `tricare-location-${i + 1}`),
  );

  return sidebar;
};
