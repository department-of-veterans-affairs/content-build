/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { formatColumn, formatFooterColumns } from '../create-header-footer';

describe('footer utilities', () => {
  const bottomRail = {
    description: 'bottom rail footer data',
    links: [
      {
        label: 'Accessibility',
        url: {
          path: 'https://www.va.gov/accessibility-at-va',
        },
      },
      {
        label: 'Civil Rights',
        url: {
          path:
            'https://www.va.gov/resources/your-civil-rights-and-how-to-file-a-discrimination-complaint/',
        },
      },
      {
        label: 'Partial Link Test',
        url: {
          path: '/link-test-1',
        },
      },
    ],
  };

  const footerColumns = {
    description: 'footer columns data',
    links: [
      {
        description: 'Column 1',
        links: [
          {
            label: 'Homeless Veterans',
            url: {
              path: 'https://www.va.gov/homeless/',
            },
          },
          {
            label: 'Women Veterans',
            url: {
              path: 'https://www.va.gov/womenvet/',
            },
          },
          {
            label: 'Partial Link Test',
            url: {
              path: '/link-test-2',
            },
          },
        ],
      },
      {
        description: 'Column 2',
        links: [
          {
            label: 'VA forms',
            url: {
              path: '/find-forms',
            },
          },
          {
            label: 'Careers at VA',
            url: {
              path: '/jobs',
            },
          },
          {
            label: 'VA outreach materials',
            url: {
              path: '/outreach-and-events/outreach-materials',
            },
          },
        ],
      },
      {
        description: 'Column 3',
        links: [
          {
            label: 'Partial Link Test',
            url: {
              path: '/link-test-3',
            },
          },
        ],
      },
    ],
  };

  describe('formatColumn', () => {
    it('should properly return an array of formatted links for the footer', () => {
      expect(
        formatColumn(bottomRail, 'bottom_rail', 'https://www.va.gov'),
      ).to.deep.equal([
        {
          column: 'bottom_rail',
          href: 'https://www.va.gov/accessibility-at-va',
          order: 1,
          target: null,
          title: 'Accessibility',
        },
        {
          column: 'bottom_rail',
          href:
            'https://www.va.gov/resources/your-civil-rights-and-how-to-file-a-discrimination-complaint/',
          order: 2,
          target: null,
          title: 'Civil Rights',
        },
        {
          column: 'bottom_rail',
          href: 'https://www.va.gov/link-test-1',
          order: 3,
          target: null,
          title: 'Partial Link Test',
        },
      ]);
    });

    describe('formatFooterColumns', () => {
      it('should properly return an array of formatted links for the footer', () => {
        expect(
          formatFooterColumns(footerColumns, 'https://www.va.gov'),
        ).to.deep.equal([
          {
            column: 1,
            href: 'https://www.va.gov/homeless/',
            order: 1,
            target: null,
            title: 'Homeless Veterans',
          },
          {
            column: 1,
            href: 'https://www.va.gov/womenvet/',
            order: 2,
            target: null,
            title: 'Women Veterans',
          },
          {
            column: 1,
            href: 'https://www.va.gov/link-test-2',
            order: 3,
            target: null,
            title: 'Partial Link Test',
          },
          {
            column: 2,
            href: 'https://www.va.gov/find-forms',
            order: 1,
            target: null,
            title: 'VA forms',
          },
          {
            column: 2,
            href: 'https://www.va.gov/jobs',
            order: 2,
            target: null,
            title: 'Careers at VA',
          },
          {
            column: 2,
            href: 'https://www.va.gov/outreach-and-events/outreach-materials',
            order: 3,
            target: null,
            title: 'VA outreach materials',
          },
          {
            column: 3,
            href: 'https://www.va.gov/link-test-3',
            order: 1,
            target: null,
            title: 'Partial Link Test',
          },
        ]);
      });
    });
  });
});
