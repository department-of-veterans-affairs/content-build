import { expect } from 'chai';
import { formatColumn, formatFooterColumns } from '../create-header-footer';

describe('footer utilities', () => {
  const bottomRail = {
    description: 'bottom rail footer data',
    links: [
      {
        description: 'Accessibility',
        url: {
          path: 'https://www.va.gov/accessibility-at-va',
        },
      },
      {
        description: 'Civil Rights',
        url: {
          path:
            'https://www.va.gov/resources/your-civil-rights-and-how-to-file-a-discrimination-complaint/',
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
            description: 'Homeless Veterans',
            url: {
              path: 'https://www.va.gov/homeless/',
            },
          },
          {
            description: 'Women Veterans',
            url: {
              path: 'https://www.va.gov/womenvet/',
            },
          },
        ],
      },
      {
        description: 'Column 2',
        links: [
          {
            description: 'VA forms',
            url: {
              path: '/find-forms',
            },
          },
          {
            description: 'Careers at VA',
            url: {
              path: '/jobs',
            },
          },
          {
            description: 'VA outreach materials',
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
            description: 'VA news',
            url: {
              path: 'https://news.va.gov/',
            },
          },
        ],
      },
    ],
  };

  describe('formatColumn', () => {
    it('should properly return an array of formatted links for the footer', () => {
      expect(formatColumn(bottomRail, 'bottom_rail')).to.deep.equal([
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
      ]);
    });

    describe('formatFooterColumns', () => {
      it('should properly return an array of formatted links for the footer', () => {
        expect(formatFooterColumns(footerColumns)).to.deep.equal([
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
            column: 2,
            href: '/find-forms',
            order: 1,
            target: null,
            title: 'VA forms',
          },
          {
            column: 2,
            href: '/jobs',
            order: 2,
            target: null,
            title: 'Careers at VA',
          },
          {
            column: 2,
            href: '/outreach-and-events/outreach-materials',
            order: 3,
            target: null,
            title: 'VA outreach materials',
          },
          {
            column: 3,
            href: 'https://news.va.gov/',
            order: 1,
            target: null,
            title: 'VA news',
          },
        ]);
      });
    });
  });
});
