/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';

import {
  LOVELL_VA_TITLE_VARIATION,
  LOVELL_TRICARE_TITLE_VARIATION,
  LOVELL_VA_LINK_VARIATION,
  LOVELL_TRICARE_LINK_VARIATION,
  getLovellTitle,
  getLovellTitleVariation,
  getLovellUrl,
  getLovellVariantOfUrl,
  getFeaturedListingItems,
} from '../../lovell/helpers';

describe('getLovellTitle', () => {
  it('returns the proper title for the variant', () => {
    expect(getLovellTitle(LOVELL_VA_TITLE_VARIATION)).to.eq(
      'Lovell Federal health care - VA',
    );
    expect(getLovellTitle(LOVELL_TRICARE_TITLE_VARIATION)).to.eq(
      'Lovell Federal health care - TRICARE',
    );
  });
});

describe('getLovellTitleVariation', () => {
  it('returns the expected variations', () => {
    expect(getLovellTitleVariation('va')).to.eq(LOVELL_VA_TITLE_VARIATION);
    expect(getLovellTitleVariation(' - va')).to.eq(LOVELL_VA_TITLE_VARIATION);
    expect(getLovellTitleVariation('tricare')).to.eq(
      LOVELL_TRICARE_TITLE_VARIATION,
    );
    expect(getLovellTitleVariation(' - tricare')).to.eq(
      LOVELL_TRICARE_TITLE_VARIATION,
    );
  });
});

describe('getLovellUrl', () => {
  it('return the proper url for the variant', () => {
    expect(getLovellUrl(LOVELL_VA_LINK_VARIATION)).to.eq(
      '/lovell-federal-health-care-va',
    );
    expect(getLovellUrl(LOVELL_TRICARE_LINK_VARIATION)).to.eq(
      '/lovell-federal-health-care-tricare',
    );
  });
});

describe('getLovellVariantOfUrl', () => {
  const testLovellUrlVariation = (given, linkVar, expected) => {
    expect(getLovellVariantOfUrl(given, linkVar)).to.eq(expected);
  };

  it('returns expected VA URL variants', () => {
    testLovellUrlVariation(
      '/lovell-federal-health-care/some-page',
      LOVELL_VA_LINK_VARIATION,
      '/lovell-federal-health-care-va/some-page',
    );

    testLovellUrlVariation(
      '/lovell-federal-health-care-tricare/some-page',
      LOVELL_VA_LINK_VARIATION,
      '/lovell-federal-health-care-va/some-page',
    );

    testLovellUrlVariation(
      '/lovell-federal-health-care-va/some-page',
      LOVELL_VA_LINK_VARIATION,
      '/lovell-federal-health-care-va/some-page',
    );
  });

  it('gets expected Tricare URL variants', () => {
    testLovellUrlVariation(
      '/lovell-federal-health-care/some-page',
      LOVELL_TRICARE_LINK_VARIATION,
      '/lovell-federal-health-care-tricare/some-page',
    );

    testLovellUrlVariation(
      '/lovell-federal-health-care-va/some-page',
      LOVELL_TRICARE_LINK_VARIATION,
      '/lovell-federal-health-care-tricare/some-page',
    );

    testLovellUrlVariation(
      '/lovell-federal-health-care-tricare/some-page',
      LOVELL_TRICARE_LINK_VARIATION,
      '/lovell-federal-health-care-tricare/some-page',
    );
  });
});

describe('getFeaturedListingItems', () => {
  const listingPages = [
    {
      entityBundle: 'type1-expected',
      reverseFieldListingNode: {
        entities: [
          {
            title: 'Featured 1',
            fieldFeatured: true,
            fieldAdministration: {
              entity: {
                entityId: 2,
              },
            },
          },
          {
            title: 'Featured 2',
            fieldFeatured: true,
            fieldAdministration: {
              entity: {
                entityId: 1,
              },
            },
          },
          {
            title: 'Not Featured 1',
            fieldFeatured: false,
          },
        ],
      },
    },
    {
      entityBundle: 'type2-malformed',
    },
  ];

  it('returns an empty array when listingType is not found', () => {
    const featuredItems = getFeaturedListingItems(
      listingPages,
      'nonExistentType',
    );
    expect(featuredItems).to.deep.eq([]);
  });

  it('returns an empty array when listing page is malformed', () => {
    const featuredItems = getFeaturedListingItems(
      listingPages,
      'type2-malformed',
    );
    expect(featuredItems).to.deep.eq([]);
  });

  it('returns featured items sorted by fieldAdministration', () => {
    const featuredItems = getFeaturedListingItems(
      listingPages,
      'type1-expected',
    );
    expect(featuredItems).to.deep.eq([
      {
        title: 'Featured 2',
        fieldFeatured: true,
        fieldAdministration: {
          entity: {
            entityId: 1,
          },
        },
      },
      {
        title: 'Featured 1',
        fieldFeatured: true,
        fieldAdministration: {
          entity: {
            entityId: 2,
          },
        },
      },
    ]);
  });
});
