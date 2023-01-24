/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { processLovellPages } from '../../process-lovell-pages';
import {
  stringArraysContainSameElements,
  findSidebarMenuLinkBySectionAndOptionalLabel,
} from './utils';
import generateSidebar from './fixtures/generateSidebar';

const getSidebarQuery = (drupalData, lovellVariant) =>
  lovellVariant === 'va'
    ? drupalData.data?.vaLovellFederalVaHealthCareFacilitySidebarQuery
    : drupalData.data?.vaLovellFederalTricareHealthCareFacilitySidebarQuery;

const getLocationList = (sidebarProperty, lovellVariant) => {
  const topLevel = findSidebarMenuLinkBySectionAndOptionalLabel(
    sidebarProperty?.links,
    'both',
  );

  const servicesAndLocations = findSidebarMenuLinkBySectionAndOptionalLabel(
    topLevel?.links,
    'both',
    'Services and Locations',
  );

  return findSidebarMenuLinkBySectionAndOptionalLabel(
    servicesAndLocations?.links,
    lovellVariant,
    'Locations',
  );
};

const expectLocationListToBe = (drupalData, lovellVariant, expectedList) => {
  const sidebarProperty = getSidebarQuery(drupalData, lovellVariant);
  const locationList = getLocationList(sidebarProperty, lovellVariant);
  expect(sidebarProperty).to.exist;
  expect(locationList).to.exist;
  expect(
    stringArraysContainSameElements(
      locationList?.links?.map(link => link.label),
      expectedList,
    ),
  ).to.be.true;
};

describe('processLovelPages (sidebar locations)', () => {
  it('correctly generates and filters menu items when source lists are populated', () => {
    const vaLocationCount = 2;
    const tricareLocationCount = 3;
    const sidebar = generateSidebar(vaLocationCount, tricareLocationCount);
    const drupalData = {
      data: {
        lovellFederalHealthCareFacilitySidebarQuery: sidebar,
        nodeQuery: {
          entities: [],
        },
      },
    };

    processLovellPages(drupalData);

    expectLocationListToBe(drupalData, 'va', [
      'VA Location 1',
      'VA Location 2',
    ]);
    expectLocationListToBe(drupalData, 'tricare', [
      'TRICARE Location 1',
      'TRICARE Location 2',
      'TRICARE Location 3',
    ]);
  });

  it('generates sidebar menus when source lists are empty', () => {
    const vaLocationCount = 0;
    const tricareLocationCount = 0;
    const sidebar = generateSidebar(vaLocationCount, tricareLocationCount);
    const drupalData = {
      data: {
        lovellFederalHealthCareFacilitySidebarQuery: sidebar,
        nodeQuery: {
          entities: [],
        },
      },
    };

    processLovellPages(drupalData);

    expectLocationListToBe(drupalData, 'va', []);
    expectLocationListToBe(drupalData, 'tricare', []);
  });
});
