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
const generateVaSidebarLocation = label =>
  generateSidebarLocation('va', label, `va-location-${label}`);
const generateTricareSidebarLocation = label =>
  generateSidebarLocation('tricare', label, `tricare-location-${label}`);

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
  vaLocations.links = [...Array(vaLocationCount)].map((_item, i) =>
    generateVaSidebarLocation(i + 1),
  );

  const tricareLocations = findSidebarMenuLinkBySectionAndOptionalLabel(
    servicesAndLocations.links,
    'tricare',
    'Locations',
  );
  tricareLocations.links = [...Array(tricareLocationCount)].map((_item, i) =>
    generateTricareSidebarLocation(i + 1),
  );

  return sidebar;
};
