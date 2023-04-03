/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { lovellPage } from './fixtures/updatePage';

import {
  getLovellPageVariables,
  getLovellVariantPath,
  getLovellCanonicalLink,
  getLovellSwitchPath,
  getLovellBreadcrumbs,
  getLovellVariantTitle,
} from '../../lovell/update-page';

const getVariantPageVariables = (overrides, variant) => {
  const newPage = {
    ...lovellPage,
    ...overrides,
  };

  return getLovellPageVariables(newPage, variant);
};

const testLovellUrlForFunction = (lovellFunction, variant, given, expected) => {
  expect(
    lovellFunction(
      getVariantPageVariables(
        {
          entityUrl: {
            path: given,
          },
        },
        variant,
      ),
    ),
  ).to.eq(expected);
};

describe('getLovellVariantPath', () => {
  it('returns a lovell variant of the URL from federal URLs', () => {
    testLovellUrlForFunction(
      getLovellVariantPath,
      'va',
      '/lovell-federal-health-care/programs/some-program',
      '/lovell-federal-health-care-va/programs/some-program',
    );

    testLovellUrlForFunction(
      getLovellVariantPath,
      'tricare',
      '/lovell-federal-health-care/programs/some-program',
      '/lovell-federal-health-care-tricare/programs/some-program',
    );
  });

  it('returns a lovell variant of the URL from variant URLs', () => {
    testLovellUrlForFunction(
      getLovellVariantPath,
      'va',
      '/lovell-federal-health-care-tricare/programs/some-program',
      '/lovell-federal-health-care-va/programs/some-program',
    );

    testLovellUrlForFunction(
      getLovellVariantPath,
      'tricare',
      '/lovell-federal-health-care-va/programs/some-program',
      '/lovell-federal-health-care-tricare/programs/some-program',
    );
  });
});

describe('getLovellCanonicalLink', () => {
  it('returns the VA variants of any URL', () => {
    testLovellUrlForFunction(
      getLovellCanonicalLink,
      'tricare',
      '/lovell-federal-health-care/programs/some-program',
      '/lovell-federal-health-care-va/programs/some-program',
    );

    testLovellUrlForFunction(
      getLovellCanonicalLink,
      'tricare',
      '/lovell-federal-health-care-tricare/programs/some-program',
      '/lovell-federal-health-care-va/programs/some-program',
    );

    testLovellUrlForFunction(
      getLovellCanonicalLink,
      'tricare',
      '/lovell-federal-health-care-va/programs/some-program',
      '/lovell-federal-health-care-va/programs/some-program',
    );
  });
});

describe('getLovellSwitchPath', () => {
  it('returns the opposite variant of the URL from federal URLs', () => {
    testLovellUrlForFunction(
      getLovellSwitchPath,
      'tricare',
      '/lovell-federal-health-care/programs/some-program',
      '/lovell-federal-health-care-va/programs/some-program',
    );

    testLovellUrlForFunction(
      getLovellSwitchPath,
      'va',
      '/lovell-federal-health-care/programs/some-program',
      '/lovell-federal-health-care-tricare/programs/some-program',
    );
  });

  it('returns the opposite variant of the URL with a variant already', () => {
    testLovellUrlForFunction(
      getLovellSwitchPath,
      'va',
      '/lovell-federal-health-care-va/programs/some-program',
      '/lovell-federal-health-care-tricare/programs/some-program',
    );

    testLovellUrlForFunction(
      getLovellSwitchPath,
      'tricare',
      '/lovell-federal-health-care-tricare/programs/some-program',
      '/lovell-federal-health-care-va/programs/some-program',
    );
  });
});

describe('getLovellVariantTitle', () => {
  it('returns the variant of a federal page title', () => {
    expect(
      getLovellVariantTitle(
        'Lovell Federal health care: Some Department',
        getVariantPageVariables({}, 'va'),
      ),
    ).to.eq('Lovell Federal health care - VA: Some Department');

    expect(
      getLovellVariantTitle(
        'Lovell Federal health care: Some Department',
        getVariantPageVariables({}, 'tricare'),
      ),
    ).to.eq('Lovell Federal health care - TRICARE: Some Department');
  });

  it('returns changed titles that have an existing variant in them', () => {
    expect(
      getLovellVariantTitle(
        'Lovell Federal health care - VA: Some Department',
        getVariantPageVariables({}, 'tricare'),
      ),
    ).to.eq('Lovell Federal health care - TRICARE: Some Department');

    expect(
      getLovellVariantTitle(
        'Lovell Federal health care - TRICARE: Some Department',
        getVariantPageVariables({}, 'va'),
      ),
    ).to.eq('Lovell Federal health care - VA: Some Department');
  });

  it('keeps titles the same if they do not have a Lovell title', () => {
    expect(
      getLovellVariantTitle(
        'Some Department',
        getVariantPageVariables({}, 'va'),
      ),
    ).to.eq('Some Department');

    expect(
      getLovellVariantTitle(
        'Some Department',
        getVariantPageVariables({}, 'tricare'),
      ),
    ).to.eq('Some Department');
  });
});

describe('getLovellBreadcrumbs', () => {
  const pageEntityUrlVars = {
    entityUrl: {
      breadcrumb: [
        {
          url: {
            path: '/',
          },
          text: 'Home',
        },
        {
          url: {
            path: '/lovell-federal-health-care',
          },
          text: 'Lovell Federal health care',
        },
        {
          url: {
            path: '/lovell-federal-health-care/programs',
          },
          text: 'Programs',
        },
        {
          url: {
            path: '',
          },
          text: 'Some Program',
        },
      ],
      path: '/lovell-federal-health-care/programs/some-program',
    },
  };

  it('returns proper breadcrumbs for VA', () => {
    const lovellVaBreadcrumbs = getLovellBreadcrumbs(
      getVariantPageVariables(pageEntityUrlVars, 'va'),
    );

    expect(lovellVaBreadcrumbs).to.deep.equal([
      {
        url: {
          path: '/',
        },
        text: 'Home',
      },
      {
        url: {
          path: '/lovell-federal-health-care-va',
        },
        text: 'Lovell Federal health care - VA',
      },
      {
        url: {
          path: '/lovell-federal-health-care-va/programs',
        },
        text: 'Programs',
      },
      {
        url: {
          path: '',
        },
        text: 'Some Program',
      },
    ]);
  });

  it('returns proper breadcrumbs for Tricare', () => {
    const lovellTricareBreadcrumbs = getLovellBreadcrumbs(
      getVariantPageVariables(pageEntityUrlVars, 'tricare'),
    );

    expect(lovellTricareBreadcrumbs).to.deep.equal([
      {
        url: {
          path: '/',
        },
        text: 'Home',
      },
      {
        url: {
          path: '/lovell-federal-health-care-tricare',
        },
        text: 'Lovell Federal health care - TRICARE',
      },
      {
        url: {
          path: '/lovell-federal-health-care-tricare/programs',
        },
        text: 'Programs',
      },
      {
        url: {
          path: '',
        },
        text: 'Some Program',
      },
    ]);
  });
});
