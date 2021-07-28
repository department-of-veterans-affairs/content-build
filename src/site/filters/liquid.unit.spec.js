import liquid from 'tinyliquid';
import { expect, assert } from 'chai';

import registerFilters from './liquid';
import vetCenterData from '../layouts/tests/vet_center/fixtures/vet_center_escanaba_data';
import featuredContentData from '../layouts/tests/vet_center/fixtures/featuredContentData.json';
import eventListingMockData from '../layouts/tests/vamc/fixtures/eventListingMockData.json';
import pressReleasesMockData from '../layouts/tests/vamc/fixtures/pressReleasesMockData.json';

const _ = require('lodash');

registerFilters();

const eventsMockData = [
  {
    title: 'Virtual Veterans Town Hall',
    fieldDatetimeRangeTimezone: {
      endValue: 1620421341,
      timezone: 'America/New_York',
      value: 1620410541,
    },
  },
  {
    title: 'Community Town Hall on the Move',
    fieldDatetimeRangeTimezone: {
      endValue: 1617796941,
      timezone: 'America/New_York',
      value: 1617782541,
    },
  },
  {
    title: 'Brooklyn Community Garden Meetup',
    fieldDatetimeRangeTimezone: {
      endValue: 1578409341,
      timezone: 'America/New_York',
      value: 1578398541,
    },
  },
  {
    title: 'Clean-up Block Event',
    fieldDatetimeRangeTimezone: {
      endValue: 1628355741,
      timezone: 'America/New_York',
      value: 1628348541,
    },
  },
  {
    title: 'Holiday Office Dinner',
    fieldDatetimeRangeTimezone: {
      endValue: 1639670421,
      timezone: 'America/New_York',
      value: 1639659621,
    },
  },
];

describe('hasCharacterOtherThanSpace', () => {
  it('returns false if an empty string is passed', () => {
    expect(liquid.filters.hasCharacterOtherThanSpace('')).to.be.false;
  });

  it('returns false if null is passed', () => {
    expect(liquid.filters.hasCharacterOtherThanSpace(null)).to.be.false;
  });

  it('returns false if undefined', () => {
    expect(liquid.filters.hasCharacterOtherThanSpace(undefined)).to.be.false;
  });

  it('returns false if a string with spaces is passed', () => {
    expect(liquid.filters.hasCharacterOtherThanSpace('   ')).to.be.false;
  });

  it('returns false if x number of spaces are passed in causing the output to include "internal:/x-number-of-spaces"', () => {
    expect(liquid.filters.hasCharacterOtherThanSpace('internal:/     ')).to.be
      .false;
  });

  it('returns true if a url is passed', () => {
    expect(liquid.filters.hasCharacterOtherThanSpace('interal:/testing.com')).to
      .be.true;
  });

  it('returns true if a url is passed', () => {
    expect(liquid.filters.hasCharacterOtherThanSpace('www.google.com')).to.be
      .true;
  });

  it('returns true if a url is passed', () => {
    expect(liquid.filters.hasCharacterOtherThanSpace('    https:/testing.com '))
      .to.be.true;
  });
});

describe('hasContentAtPath', () => {
  let testArray;

  beforeEach(() => {
    testArray = [
      {
        entity: {
          title: 'some time',
          fieldSituationUpdates: [],
          status: true,
        },
      },
    ];
  });

  it('returns false if there is no content at the given path', () => {
    expect(
      liquid.filters.hasContentAtPath(
        testArray,
        'entity.fieldSituationUpdates',
      ),
    ).to.be.false;
  });

  it('returns true if there is content at the given path', () => {
    testArray[0].entity.fieldSituationUpdates = [
      'field situation update 1',
      'field situation update 2',
    ];

    expect(
      liquid.filters.hasContentAtPath(
        testArray,
        'entity.fieldSituationUpdates',
      ),
    ).to.be.true;
  });
});

describe('filterPastEvents', () => {
  it('returns null when null is passed', () => {
    expect(liquid.filters.filterPastEvents(null)).to.eq(null);
  });

  it('returns null when undefined is passed', () => {
    expect(liquid.filters.filterPastEvents(undefined)).to.eq(null);
  });

  it('returns null when empty string is passed', () => {
    expect(liquid.filters.filterPastEvents('')).to.eq(null);
  });

  it('returns events that occured BEFORE the current date and time', () => {
    expect(
      liquid.filters.filterPastEvents(eventsMockData),
    ).to.deep.include.members([
      {
        title: 'Virtual Veterans Town Hall',
        fieldDatetimeRangeTimezone: {
          endValue: 1620421341,
          timezone: 'America/New_York',
          value: 1620410541,
        },
      },
      {
        title: 'Community Town Hall on the Move',
        fieldDatetimeRangeTimezone: {
          endValue: 1617796941,
          timezone: 'America/New_York',
          value: 1617782541,
        },
      },
      {
        title: 'Brooklyn Community Garden Meetup',
        fieldDatetimeRangeTimezone: {
          endValue: 1578409341,
          timezone: 'America/New_York',
          value: 1578398541,
        },
      },
    ]);
  });
});

describe('filterUpcomingEvents', () => {
  it('returns null when null is passed', () => {
    expect(liquid.filters.filterUpcomingEvents(null)).to.eq(null);
  });

  it('returns null when undefined is passed', () => {
    expect(liquid.filters.filterUpcomingEvents(undefined)).to.eq(null);
  });

  it('returns null when empty string is passed', () => {
    expect(liquid.filters.filterUpcomingEvents('')).to.eq(null);
  });

  it('returns events that occured AFTER the current date and time', () => {
    expect(
      liquid.filters.filterUpcomingEvents(eventsMockData),
    ).to.deep.include.members([
      {
        title: 'Clean-up Block Event',
        fieldDatetimeRangeTimezone: {
          endValue: 1628355741,
          timezone: 'America/New_York',
          value: 1628348541,
        },
      },
      {
        title: 'Holiday Office Dinner',
        fieldDatetimeRangeTimezone: {
          endValue: 1639670421,
          timezone: 'America/New_York',
          value: 1639659621,
        },
      },
    ]);
  });
});

describe('sortByDateKey', () => {
  it('returns null when null is passed', () => {
    expect(liquid.filters.sortByDateKey(null)).to.eq(null);
  });

  it('returns null when empty string is passed', () => {
    expect(liquid.filters.sortByDateKey('')).to.eq(null);
  });

  it('returns an array of upcoming events in date/time order starting with most recent to least recent', () => {
    expect(
      liquid.filters.sortByDateKey(
        eventsMockData,
        'fieldDatetimeRangeTimezone',
        false,
      ),
    ).to.deep.include.members([
      {
        title: 'Clean-up Block Event',
        fieldDatetimeRangeTimezone: {
          endValue: 1628355741,
          timezone: 'America/New_York',
          value: 1628348541,
        },
      },
      {
        title: 'Holiday Office Dinner',
        fieldDatetimeRangeTimezone: {
          endValue: 1639670421,
          timezone: 'America/New_York',
          value: 1639659621,
        },
      },
    ]);
  });

  it('returns an array of press releases in date order from newest to oldest', () => {
    expect(
      liquid.filters.sortByDateKey(
        pressReleasesMockData.entities,
        'fieldReleaseDate',
        true,
      ),
    ).to.deep.equal([
      {
        entityId: '19797',
        entityUrl: {
          path:
            '/pittsburgh-health-care/news-releases/va-secretary…ttsburgh-nurse-for-dedication-service-to-veterans',
        },
        fieldIntroText:
          'A VA Pittsburgh Healthcare System nurse recently won the Secretary’s Award for Excellence in Nursing and Advancement of Nursing Programs for helping to improve health care services for veterans.',
        fieldReleaseDate: {
          value: '2021-05-14T15:11:11',
        },
        title: 'VA secretary recognizes VA Pittsburgh nurse for',
      },
      {
        entityId: '7640',
        entityUrl: {
          path:
            '/pittsburgh-health-care/news-releases/va-pittsburgh-named-lgbtq-healthcare-equality-leader-for-8th',
        },
        fieldIntroText:
          'VA Pittsburgh Healthcare System was named a 2020 “LGBTQ Healthcare Equality Leader” by the Human Rights Campaign Foundation (HRC). The designation is the eighth time in as many years and is listed in the 13th edition of the Healthcare Equality Index (HEI). ',
        fieldReleaseDate: {
          value: '2020-09-14T11:40:46',
        },
        title:
          'VA Pittsburgh named ‘LGBTQ Healthcare Equality Leader’ for 8th year',
      },
      {
        entityId: '841',
        entityUrl: {
          path:
            '/pittsburgh-health-care/news-releases/women-veterans-resource-fair-spotlights-va-and-community-care',
        },
        fieldIntroText:
          'Veterans Affairs (VA) Pittsburgh Healthcare System is connecting women Veterans with VA and non-VA services during a resource fair on Friday, Aug. 16, from 10 a.m. to 1 p.m. ',
        fieldReleaseDate: {
          value: '2019-08-12T19:12:40',
        },
        title: 'Women Veterans resource fair spotlights VA and community care',
      },
    ]);
  });

  it('returns an array of upcoming events in date/time order when no dateKey is passed', () => {
    expect(
      liquid.filters.sortByDateKey(eventsMockData),
    ).to.deep.include.members([
      {
        title: 'Clean-up Block Event',
        fieldDatetimeRangeTimezone: {
          endValue: 1628355741,
          timezone: 'America/New_York',
          value: 1628348541,
        },
      },
      {
        title: 'Holiday Office Dinner',
        fieldDatetimeRangeTimezone: {
          endValue: 1639670421,
          timezone: 'America/New_York',
          value: 1639659621,
        },
      },
    ]);
  });
});

describe('paginatePages', () => {
  it('passing in less than 10 events', () => {
    const slicedEventListingMockData = _.cloneDeep(eventListingMockData);

    slicedEventListingMockData.reverseFieldListingNode.entities = slicedEventListingMockData.reverseFieldListingNode.entities.slice(
      0,
      -6,
    );

    const result = liquid.filters.paginatePages(
      slicedEventListingMockData,
      slicedEventListingMockData.reverseFieldListingNode.entities,
    );

    expect(result.pagedItems.length).to.be.below(11);
    expect(result.paginator.next).to.be.null;
  });

  it('passing in more than 10 events', () => {
    const result = liquid.filters.paginatePages(
      eventListingMockData,
      eventListingMockData.reverseFieldListingNode.entities,
      'event',
    );

    const expected = {
      ariaLabel: ' of event',
      prev: null,
      inner: [
        {
          href: null,
          label: 1,
          class: 'va-pagination-active',
        },
        {
          href: '/pittsburgh-health-care/events/page-2',
          label: 2,
          class: '',
        },
      ],
      next: '/pittsburgh-health-care/events/page-2',
    };

    expect(result.pagedItems.length).to.be.below(11);
    expect(result.paginator).to.deep.equal(expected);
  });
});

describe('benefitTerms', () => {
  it('returns null when null is passed', () => {
    expect(liquid.filters.benefitTerms(null)).to.eq(null);
  });

  it('returns General benefits information', () => {
    expect(liquid.filters.benefitTerms('')).to.eq(
      'General benefits information',
    );
  });

  it('returns General benefits information', () => {
    expect(liquid.filters.benefitTerms('general')).to.eq(
      'General benefits information',
    );
  });

  it('returns Burials and memorials', () => {
    expect(liquid.filters.benefitTerms('burial')).to.eq(
      'Burials and memorials',
    );
  });

  it('returns Careers and employment', () => {
    expect(liquid.filters.benefitTerms('careers')).to.eq(
      'Careers and employment',
    );
  });

  it('returns Disability', () => {
    expect(liquid.filters.benefitTerms('disability')).to.eq('Disability');
  });

  it('returns Education and training', () => {
    expect(liquid.filters.benefitTerms('education')).to.eq(
      'Education and training',
    );
  });

  it('returns Family member benefits', () => {
    expect(liquid.filters.benefitTerms('family')).to.eq(
      'Family member benefits',
    );
  });

  it('returns Health care', () => {
    expect(liquid.filters.benefitTerms('healthcare')).to.eq('Health care');
  });

  it('returns Housing assistance', () => {
    expect(liquid.filters.benefitTerms('housing')).to.eq('Housing assistance');
  });

  it('returns Life insurance', () => {
    expect(liquid.filters.benefitTerms('insurance')).to.eq('Life insurance');
  });

  it('returns Pension', () => {
    expect(liquid.filters.benefitTerms('pension')).to.eq('Pension');
  });

  it('returns Service memeber benefits', () => {
    expect(liquid.filters.benefitTerms('service')).to.eq(
      'Service member benefits',
    );
  });

  it('returns Records', () => {
    expect(liquid.filters.benefitTerms('records')).to.eq('Records');
  });
});

describe('findCurrentPathDepth', () => {
  it('returns {"depth":1}', () => {
    const linksArr = [{ url: { path: '/home' } }];
    assert.equal(
      liquid.filters.findCurrentPathDepth(linksArr, '/home'),
      '{"depth":1}',
    );
  });

  it('returns  {"depth":2}', () => {
    const linksArr = [
      { url: { path: '/home' }, links: [{ url: { path: '/page' } }] },
    ];
    assert.equal(
      liquid.filters.findCurrentPathDepth(linksArr, '/page'),
      '{"depth":2}',
    );
  });

  it('returns  {"depth":3}', () => {
    const linksArr = [
      {
        url: { path: '/home' },
        links: [
          { url: { path: '/page' }, links: [{ url: { path: '/testing3' } }] },
        ],
      },
    ];
    assert.equal(
      liquid.filters.findCurrentPathDepth(linksArr, '/testing3'),
      '{"depth":3,"links":{"url":{"path":"/page"},"links":[{"url":{"path":"/testing3"}}]}}',
    );
  });

  it('returns  {"depth":4}', () => {
    const linksArr = [
      {
        url: { path: '/home' },
        links: [
          {
            url: { path: '/page' },
            links: [
              {
                url: { path: '/testing3' },
                links: [{ url: { path: '/testing4' } }],
              },
            ],
          },
        ],
      },
    ];
    assert.equal(
      liquid.filters.findCurrentPathDepth(linksArr, '/testing4'),
      '{"depth":4,"links":{"url":{"path":"/testing3"},"links":[{"url":{"path":"/testing4"}}]}}',
    );
  });

  it('returns  {"depth":5}', () => {
    const linksArr = [
      {
        url: { path: '/home' },
        links: [
          {
            url: { path: '/page' },
            links: [
              {
                url: { path: '/testing3' },
                links: [
                  {
                    url: { path: '/testing4' },
                    links: [{ url: { path: '/testing5' } }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    assert.equal(
      liquid.filters.findCurrentPathDepth(linksArr, '/testing5'),
      '{"depth":5,"links":{"url":{"path":"/testing4"},"links":[{"url":{"path":"/testing5"}}]}}',
    );
  });
});

describe('hashReference', () => {
  it('returns null when null is passed', () => {
    expect(liquid.filters.hashReference(null)).to.eq(null);
  });

  it('returns null when undefined is passed', () => {
    expect(liquid.filters.hashReference(undefined)).to.eq(null);
  });

  it('returns null when empty string is passed', () => {
    expect(liquid.filters.hashReference('')).to.eq(null);
  });

  it('returns an empty string when an empty array is passed', () => {
    expect(liquid.filters.hashReference([])).to.eq('');
  });

  it('returns a hyphenated string', () => {
    expect(liquid.filters.hashReference('Testing One two three')).to.eq(
      'testing-one-two-three',
    );
  });

  it('returns hyphenated string and removes multiple spaces', () => {
    expect(liquid.filters.hashReference('testing  one two  three')).to.eq(
      'testing-one-two-three',
    );
  });

  it('returns hyphenated string with spaces removed from both sides of string', () => {
    expect(liquid.filters.hashReference('  Testing one two three   ')).to.eq(
      'testing-one-two-three',
    );
  });
});

describe('fileExt', () => {
  it('returns the following string - testing', () => {
    expect(liquid.filters.fileExt('testing')).to.eq('testing');
  });

  it('returns the following string - bar', () => {
    expect(liquid.filters.fileExt('foo.bar')).to.eq('bar');
  });

  it('returns the following string - test', () => {
    expect(liquid.filters.fileExt('foo.bar.test')).to.eq('test');
  });

  it('returns empty string', () => {
    expect(liquid.filters.fileExt('foo.bar.test.')).to.eq('');
  });

  it('returns the following string - test', () => {
    expect(liquid.filters.fileExt(['foo.bar.test'])).to.eq('test');
  });

  it('returns null when null is passed', () => {
    expect(liquid.filters.fileExt(null)).to.eq(null);
  });

  it('returns null when undefined is passed', () => {
    expect(liquid.filters.fileExt(undefined)).to.eq(null);
  });

  it('returns null when empty string is passed', () => {
    expect(liquid.filters.fileExt('')).to.eq(null);
  });

  it('returns an empty string when an empty array is passed', () => {
    expect(liquid.filters.fileExt([])).to.eq('');
  });
});

describe('toTitleCase', () => {
  it('returns null when null is passed', () => {
    expect(liquid.filters.toTitleCase(null)).to.eq(null);
  });

  it('returns an empty string when an empty string is passed', () => {
    expect(liquid.filters.toTitleCase('')).to.eq('');
  });

  it('returns an empty string when an empty array is passed', () => {
    expect(liquid.filters.toTitleCase([])).to.eq('');
  });

  it('returns a string with only the first letter of word capitalized', () => {
    expect(liquid.filters.toTitleCase('tEST')).to.eq('Test');
  });

  it('returns all words in string with the first letter capitalized', () => {
    expect(liquid.filters.toTitleCase('t3sT String')).to.eq('T3st String');
  });
});

describe('isLaterThan', () => {
  it('returns true when the left arg is a timestamp later than the right arg', () => {
    expect(liquid.filters.isLaterThan('2020-01-11', '2016-07-10')).to.be.true;
  });

  it('returns false when the left arg is a timestamp before the right arg', () => {
    expect(liquid.filters.isLaterThan('2016-12-11', '2017-01-12')).to.be.false;
  });
});

describe('timezoneAbbrev', () => {
  it('returns PDT for Los Angeles', () => {
    expect(
      liquid.filters.timezoneAbbrev('America/Los_Angeles', 1604091600000),
    ).to.eq('PDT');
  });

  it('returns ET for null', () => {
    expect(liquid.filters.timezoneAbbrev()).to.eq('ET');
  });
});

describe('formatSharableID', () => {
  it('formats ID correctly less than 30 chars', () => {
    expect(
      liquid.filters.formatSharableLinkID(123, 'How Can i protect myself'),
    ).to.eq('how-can-i-protect-myself-123');
  });

  it('formats ID correctly more than 30 chars', () => {
    expect(
      liquid.filters.formatSharableLinkID(
        13060,
        'Why should I consider volunteering for coronavirus research at VA',
      ),
    ).to.eq('why-should-i-consider-voluntee-13060');
  });

  it('formats ID correctly in Spanish', () => {
    expect(
      liquid.filters.formatSharableLinkID(
        27792,
        '¿Debo usar una mascarilla cuando vaya a un hospital del VA u a otro lugar?',
      ),
    ).to.eq('debo-usar-una-mascarilla-cuan-27792');
  });

  it('formats ID correctly in Tagalog', () => {
    expect(
      liquid.filters.formatSharableLinkID(
        30316,
        'Kailangan ko bang magsuot ng mask kapag pumunta ako sa isang ospital ng VA o ibang lokasyon?',
      ),
    ).to.eq('kailangan-ko-bang-magsuot-ng-m-30316');
  });
});

describe('detectLang', () => {
  it('detects english', () => {
    expect(liquid.filters.detectLang('some-url')).to.eq('en');
  });

  it('detects spanish', () => {
    expect(liquid.filters.detectLang('some-url-esp')).to.eq('es');
  });

  it('detects taglog', () => {
    expect(liquid.filters.detectLang('some-url-tag')).to.eq('tl');
  });
});

describe('dateFromUnix', () => {
  context('with default time zone', () => {
    it('returns null for null', () => {
      expect(liquid.filters.dateFromUnix()).to.be.null;
    });

    it('returns date with specified format', () => {
      expect(liquid.filters.dateFromUnix(1604091600, 'dddd, MMM D YYYY')).to.eq(
        'Friday, Oct. 30 2020',
      );
    });

    it('returns time with specified format', () => {
      expect(liquid.filters.dateFromUnix(1607958000, 'h:mm A')).to.eq(
        '10:00 a.m.',
      );
    });
  });

  context('with specific time zone', () => {
    it('returns time with specified format', () => {
      expect(
        liquid.filters.dateFromUnix(1607958000, 'h:mm A', 'America/Phoenix'),
      ).to.eq('8:00 a.m.');
    });

    it('uses default if invalid timezone datatype passed', () => {
      expect(liquid.filters.dateFromUnix(1607958000, 'h:mm A', {})).to.eq(
        '10:00 a.m.',
      );
    });

    it('uses default if invalid timezone passed', () => {
      expect(
        liquid.filters.dateFromUnix(1607958000, 'h:mm A', 'Not/A_Zone'),
      ).to.eq('10:00 a.m.');
    });
  });

  describe('currentTimeInSeconds', () => {
    it('returns time in seconds', () => {
      expect(String(liquid.filters.currentTimeInSeconds()).length < 13).to.be
        .true;
    });
  });
});

describe('deriveLastBreadcrumbFromPath', () => {
  it('returns a modified list of breadcrumbs with title at last', () => {
    const origBreadCrumbsList1 = [
      { url: 'http://va.gov', text: 'Home' },
      { url: 'http://va.gov', text: 'Outreach and-events' },
      { url: 'http://va.gov', text: 'Events' },
      {
        url: 'http://va.gov',
        text: 'Pave connect-employer-session-windstream-communications',
      },
    ];
    const origBreadCrumbsList2 = [
      { url: 'http://va.gov', text: 'Events' },
      {
        url: 'http://va.gov',
        text: 'Pave connect-employer-session-windstream-communications',
      },
    ];
    const origBreadCrumbsList3 = [
      { url: 'http://va.gov', text: 'Home' },
      { url: 'http://va.gov', text: 'Outreach and-events' },
      { url: 'http://va.gov', text: 'Events' },
      { url: 'http://va.gov', text: 'Test' },
      { url: 'http://va.gov', text: 'Testing page' },
      { url: 'http://va.gov', text: 'Page testing' },
      { url: 'http://va.gov', text: 'Page testing2' },
      {
        url: 'http://va.gov',
        text: 'Pave connect-employer-session-windstream-communications',
      },
    ];
    const title = 'PAVE Connect Employer Session: Windstream Communications';
    const last1 = liquid.filters
      .deriveLastBreadcrumbFromPath(
        origBreadCrumbsList1,
        title,
        'http://va.gov',
        true,
      )
      .pop();
    const last2 = liquid.filters
      .deriveLastBreadcrumbFromPath(
        origBreadCrumbsList2,
        title,
        'http://va.gov',
        true,
      )
      .pop();
    const last3 = liquid.filters
      .deriveLastBreadcrumbFromPath(
        origBreadCrumbsList3,
        title,
        'http://va.gov',
        true,
      )
      .pop();

    expect(last1.text).to.eq(title);
    expect(last2.text).to.eq(title);
    expect(last3.text).to.eq(title);
  });

  it('returns breadcrumbs list with title as the last', () => {
    const origBreadCrumbsList = [
      { url: 'http://va.gov', text: 'Home' },
      { url: 'http://va.gov', text: 'VA Pittsburgh health care' },
      { url: 'http://va.gov', text: 'Stories' },
    ];
    const title = 'New Program Empowers Community Providers';
    const last = liquid.filters
      .deriveLastBreadcrumbFromPath(
        origBreadCrumbsList,
        title,
        'http://va.gov',
        false,
      )
      .pop();

    expect(last.text).to.eq(title);
  });
});

describe('deriveCLPTotalSections', () => {
  it('returns back max sections when everything is rendered', () => {
    expect(
      liquid.filters.deriveCLPTotalSections(
        11,
        true,
        true,
        true,
        true,
        true,
        true,
        ['category'],
      ),
    ).to.eq(11);
  });

  it('returns back the correct section count when sections are not rendered', () => {
    expect(
      liquid.filters.deriveCLPTotalSections(
        11,
        false,
        false,
        false,
        false,
        false,
        false,
        [],
      ),
    ).to.eq(4);
  });
});

describe('formatSeconds', () => {
  it('returns hours when needed', () => {
    expect(liquid.filters.formatSeconds(65245)).to.eq('18:7:25 hours');
  });

  it('returns minutes when needed', () => {
    expect(liquid.filters.formatSeconds(160)).to.eq('2:40 minutes');
  });

  it('returns seconds when needed', () => {
    expect(liquid.filters.formatSeconds(23)).to.eq('23 seconds');
  });
});

describe('createEmbedYouTubeVideoURL', () => {
  it('returns back the raw url if the youtube link should not be changed', () => {
    expect(liquid.filters.createEmbedYouTubeVideoURL('')).to.eq('');
    expect(liquid.filters.createEmbedYouTubeVideoURL('asdf')).to.eq('asdf');
    expect(
      liquid.filters.createEmbedYouTubeVideoURL('youtube.com/embed/asdf'),
    ).to.eq('youtube.com/embed/asdf');
  });

  it('returns the modified URL if it needs it', () => {
    expect(
      liquid.filters.createEmbedYouTubeVideoURL('https://youtu.be/asdf'),
    ).to.eq('https://www.youtube.com/embed/asdf');
    expect(
      liquid.filters.createEmbedYouTubeVideoURL('https://www.youtu.be/asdf'),
    ).to.eq('https://www.youtube.com/embed/asdf');
  });
});

describe('getTagsList', () => {
  const fieldTags = {
    entity: {
      fieldTopics: [
        {
          entity: {
            name: 'A. Example',
          },
        },
        {
          entity: {
            name: 'B. Example',
          },
        },
        {
          entity: {
            name: 'E. Example',
          },
        },
      ],
      fieldAudienceBeneficiares: {
        entity: {
          name: 'C. Example',
        },
      },
      fieldNonBeneficiares: {
        entity: {
          name: 'D. Example',
        },
      },
    },
  };

  it('forms a sorted list from properties "fieldTopics", "fieldAudienceBeneficiares", and "fieldNonBeneficiares"', () => {
    const result = liquid.filters.getTagsList(fieldTags);

    expect(result).to.be.deep.equal([
      {
        name: 'A. Example',
        categoryLabel: 'Topics',
      },
      {
        name: 'B. Example',
        categoryLabel: 'Topics',
      },
      {
        name: 'C. Example',
        categoryLabel: 'Audience',
      },
      {
        name: 'D. Example',
        categoryLabel: 'Audience',
      },
      {
        name: 'E. Example',
        categoryLabel: 'Topics',
      },
    ]);
  });

  it('omits null poperties', () => {
    const fieldTags2 = { entity: { ...fieldTags.entity } };
    fieldTags2.entity.fieldAudienceBeneficiares = null;

    const result = liquid.filters.getTagsList(fieldTags2);

    expect(result).to.be.deep.equal([
      {
        name: 'A. Example',
        categoryLabel: 'Topics',
      },
      {
        name: 'B. Example',
        categoryLabel: 'Topics',
      },
      {
        name: 'D. Example',
        categoryLabel: 'Audience',
      },
      {
        name: 'E. Example',
        categoryLabel: 'Topics',
      },
    ]);
  });
});

describe('replace', () => {
  it('replaces text with other text', () => {
    expect(liquid.filters.replace('<h3>some text</h3>', 'h3', 'h4')).to.equal(
      '<h4>some text</h4>',
    );
  });
});

describe('concat', () => {
  it('concatenates 2 or more arrays', () => {
    expect(JSON.stringify(liquid.filters.concat([1], 2, [3], [[4]]))).to.equal(
      JSON.stringify([1, 2, 3, [4]]),
    );
  });
});
describe('strip', () => {
  it('removes leading and trailing whitespace', () => {
    expect(liquid.filters.strip('   \nhello\n    ')).to.equal('hello');
  });
});

describe('filterBy', () => {
  it('filter array object by given path and value - 1', () => {
    assert.deepEqual(
      liquid.filters.filterBy(
        [
          { class: { abstract: { number: 3 } } },
          { class: { abstract: { number: 5 } } },
          { class: { abstract: { number: 4 } } },
          { class: { abstract: { number: 1 } } },
          { class: { abstract: { number: 1 } } },
        ],
        'class.abstract.number',
        1,
      ),
      [
        { class: { abstract: { number: 1 } } },
        { class: { abstract: { number: 1 } } },
      ],
    );
  });
  it('filter array object by given path and value - 2', () => {
    assert.deepEqual(
      liquid.filters.filterBy([{ class: {} }], 'class.abstract.number', 2),
      [],
    );
  });
  it('filter array object by given path and value - 3', () => {
    assert.deepEqual(
      liquid.filters.filterBy([{}], 'class.abstract.number', 3),
      [],
    );
  });
});

describe('encode', () => {
  it('encodes strings', () => {
    expect(liquid.filters.encode("foo © bar ≠ baz 𝌆 qux''")).to.equal(
      'foo &copy; bar &ne; baz &#x1D306; qux&amp;apos;&apos;',
    );
  });

  it('returns a string when passed null', () => {
    expect(liquid.filters.encode(null)).to.equal('');
  });
});

describe('appendCentralizedFeaturedContent', () => {
  it('returns an array of featured content - empty cc featured content', () => {
    expect(
      liquid.filters.appendCentralizedFeaturedContent(
        {},
        vetCenterData.fieldVetCenterFeatureContent,
      ).length,
    ).to.equal(2);
  });

  it('returns an array of featured content - cc featured content', () => {
    expect(
      liquid.filters.appendCentralizedFeaturedContent(
        vetCenterData.fieldCcVetCenterFeaturedCon,
        vetCenterData.fieldVetCenterFeatureContent,
      ).length,
    ).to.equal(3);
  });

  it('returns an array of featured content - field_description null', () => {
    expect(
      liquid.filters.appendCentralizedFeaturedContent(
        featuredContentData.emptyFieldDescription,
        vetCenterData.fieldVetCenterFeatureContent,
      ).length,
    ).to.equal(2);
  });

  it('returns an array of featured content - field_section_header null', () => {
    expect(
      liquid.filters.appendCentralizedFeaturedContent(
        featuredContentData.emptySectionHeader,
        vetCenterData.fieldVetCenterFeatureContent,
      ).length,
    ).to.equal(2);
  });
});

describe('run', () => {
  it('sets timeout to 20 minutes', () => {
    // Save the context so we can check the timeout value
    let savedContext = {};
    const originalRun = liquid.run;
    liquid.run = (astList, context, callback) => {
      savedContext = context;
      originalRun(astList, context, callback);
    };

    liquid.run([], { options: {} }, () => {});
    expect(savedContext.options.timeout).to.eq(1200000);
  });
});

describe('trackLinks', () => {
  it('adds recordEvent to links', () => {
    const html =
      '<html><head></head><body><p>We hope you enjoy your look at our new website. ' +
      'This is NOT our official website at this time, but will be soon. ' +
      'To continue your health care journey in the Erie Healthcare System, please return ' +
      'to our <a href="https://www.erie.va.gov/">official Erie health care website</a>.' +
      '</p></body></html>';

    const eventData =
      '{"event":"nav-alert-box-link-click","alert-box-status":"info"}';

    const expected =
      '<html><head></head><body><p>We hope you enjoy your look at our new website. ' +
      'This is NOT our official website at this time, but will be soon. ' +
      'To continue your health care journey in the Erie Healthcare System, please return ' +
      'to our <a onclick=\'recordEvent({"event":"nav-alert-box-link-click",' +
      '"alert-box-status":"info","alert-box-click-label":"official Erie health care website"})\'' +
      ' href="https://www.erie.va.gov/">official Erie health care website</a>.' +
      '</p></body></html>';

    expect(liquid.filters.trackLinks(html, eventData)).to.equal(expected);
  });
});

describe('phoneLinks', () => {
  it('wraps text phone numbers in a link', () => {
    const text = 'Here is a phone number: 123-456-7890. Pretty cool!';
    const expected =
      'Here is a phone number: <a target="_blank" href="tel:123-456-7890">123-456-7890</a>. Pretty cool!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('wraps phone numbers with parentheses around the area code', () => {
    const text = 'Here is a phone number: (123)-456-7890. Pretty cool!';
    const expected =
      'Here is a phone number: <a target="_blank" href="tel:123-456-7890">123-456-7890</a>. Pretty cool!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('wraps phone numbers with space after the area code', () => {
    const text = 'Here is a phone number: (123) 456-7890. Pretty cool!';
    const expected =
      'Here is a phone number: <a target="_blank" href="tel:123-456-7890">123-456-7890</a>. Pretty cool!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('wraps phone numbers with no dash or space after the area code', () => {
    const text = 'Here is a phone number: (123)456-7890. Pretty cool!';
    const expected =
      'Here is a phone number: <a target="_blank" href="tel:123-456-7890">123-456-7890</a>. Pretty cool!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('wraps multiple phone numbers', () => {
    const text =
      'Here is a phone number: (123)-456-7890. And (1111) more: 890-456-1234. Noice!';
    const expected =
      'Here is a phone number: <a target="_blank" href="tel:123-456-7890">123-456-7890</a>. ' +
      'And (1111) more: <a target="_blank" href="tel:890-456-1234">890-456-1234</a>. Noice!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('does not double-wrap phone numbers', () => {
    const html =
      'Here is a <a href="test">phone number</a>: <a target="_blank" href="tel:123-456-7890">123-456-7890</a>. Pretty cool!';
    expect(liquid.filters.phoneLinks(html)).to.equal(html);
  });
});

describe('formatTitleTag', () => {
  it('formats a title tag without " | Veteran Affairs"', () => {
    const title = 'this is a-title';
    const expected = 'This Is A-Title | Veterans Affairs';
    expect(liquid.filters.formatTitleTag(title)).to.equal(expected);
  });

  it('formats a title tag with " | Veteran Affairs"', () => {
    const title = 'this is a-title | Veterans Affairs';
    const expected = 'This Is A-Title | Veterans Affairs';
    expect(liquid.filters.formatTitleTag(title)).to.equal(expected);
  });

  it('formats a title tag with " | | Veteran Affairs"', () => {
    const title = 'this is a-title | | Veterans Affairs';
    const expected = 'This Is A-Title | Veterans Affairs';
    expect(liquid.filters.formatTitleTag(title)).to.equal(expected);
  });

  it('formats a title tag with " |  | Veteran Affairs"', () => {
    const title = 'this is a-title |  | Veterans Affairs';
    const expected = 'This Is A-Title | Veterans Affairs';
    expect(liquid.filters.formatTitleTag(title)).to.equal(expected);
  });
});

describe('isPaginatedPath', () => {
  it('identifies a paginated path', () => {
    const path = '/resources/tag/all-veterans/2/';
    expect(liquid.filters.isPaginatedPath(path)).to.equal(true);
  });

  it('identifies a non-paginated path', () => {
    const path = '/';
    expect(liquid.filters.isPaginatedPath(path)).to.equal(false);
  });

  it('does not break when the path is undefined', () => {
    const path = undefined;
    expect(liquid.filters.isPaginatedPath(path)).to.equal(false);
  });
});
