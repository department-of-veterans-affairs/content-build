import liquid from 'tinyliquid';
import { expect, assert } from 'chai';

import registerFilters from './liquid';
import vetCenterData from '../layouts/tests/vet_center/template/fixtures/vet_center_data.json';
import featuredContentData from '../layouts/tests/vet_center/template/fixtures/featuredContentData.json';
import eventListingMockData from '../layouts/tests/vamc/fixtures/eventListingMockData.json';
import pressReleasesMockData from '../layouts/tests/vamc/fixtures/pressReleasesMockData.json';

const _ = require('lodash');

registerFilters();

const getTomorrow = () => {
  const d = new Date();
  return Math.round(d.getTime() / 1000) + 60 * 60 * 24;
};

const getYesterday = () => {
  const d = new Date();
  return Math.round(d.getTime() / 1000) - 60 * 60 * 24;
};

const tomorrow = getTomorrow();
const yesterday = getYesterday();

const eventsMockData = [
  {
    title: 'Yesterday',
    fieldDatetimeRangeTimezone: {
      value: yesterday,
    },
  },
  {
    title: 'Yesterday Draft - 10',
    fieldDatetimeRangeTimezone: {
      value: yesterday - 10,
    },
  },
  {
    title: 'Yesterday - 1',
    fieldDatetimeRangeTimezone: {
      value: yesterday - 1,
    },
  },
  {
    title: 'Tomorrow',
    fieldDatetimeRangeTimezone: {
      value: tomorrow,
    },
  },
  {
    title: 'Tomorrow + 1',
    fieldDatetimeRangeTimezone: {
      value: tomorrow + 1,
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

  it('returns events that occurred BEFORE the current date and time', () => {
    const actual = liquid.filters.filterPastEvents(eventsMockData);
    expect(actual.length).to.eq(3);
    expect(actual).to.deep.include.members([
      {
        title: 'Yesterday',
        fieldDatetimeRangeTimezone: {
          value: yesterday,
        },
      },
      {
        title: 'Yesterday Draft - 10',
        fieldDatetimeRangeTimezone: {
          value: yesterday - 10,
        },
      },
      {
        title: 'Yesterday - 1',
        fieldDatetimeRangeTimezone: {
          value: yesterday - 1,
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

  it('returns events that occurred AFTER the current date', () => {
    expect(liquid.filters.filterUpcomingEvents(eventsMockData)).to.deep.equal([
      {
        title: 'Tomorrow',
        fieldDatetimeRangeTimezone: {
          value: tomorrow,
        },
      },
      {
        title: 'Tomorrow + 1',
        fieldDatetimeRangeTimezone: {
          value: tomorrow + 1,
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

  it('returns an array of events in date/time order from oldest to newest', () => {
    expect(liquid.filters.sortByDateKey(eventsMockData)).to.deep.equal([
      {
        title: 'Yesterday Draft - 10',
        fieldDatetimeRangeTimezone: { value: yesterday - 10 },
      },
      {
        title: 'Yesterday - 1',
        fieldDatetimeRangeTimezone: { value: yesterday - 1 },
      },
      {
        title: 'Yesterday',
        fieldDatetimeRangeTimezone: { value: yesterday },
      },
      {
        title: 'Tomorrow',
        fieldDatetimeRangeTimezone: { value: tomorrow },
      },
      {
        title: 'Tomorrow + 1',
        fieldDatetimeRangeTimezone: { value: tomorrow + 1 },
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

describe('fileSize', () => {
  it('returns file size in MB when over 10,000 bytes in size', () => {
    expect(liquid.filters.fileSize(48151)).to.eq('0.05MB');
  });

  it('returns file size in KB when under 10,000 bytes in size', () => {
    expect(liquid.filters.fileSize(2342)).to.eq('2.34KB');
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

describe('fileDisplayName', () => {
  it('returns the name of a file when provided only a name', () => {
    expect(liquid.filters.fileDisplayName('file.txt')).to.eq('file.txt');
  });

  it('returns the name of a file when provided a filepath of depth 1', () => {
    expect(liquid.filters.fileDisplayName('files/file.txt')).to.eq('file.txt');
  });

  it('returns name of a file when provided a filepath of depth > 1', () => {
    expect(liquid.filters.fileDisplayName('file/texts/file.txt')).to.eq(
      'file.txt',
    );
  });

  it('returns name of a file with multiple extenstions', () => {
    expect(liquid.filters.fileDisplayName('file.test.txt')).to.eq(
      'file.test.txt',
    );
  });

  it('returns name of a file when in an array', () => {
    expect(liquid.filters.fileDisplayName(['file.txt'])).to.eq('file.txt');
  });

  it('returns null when null is passed', () => {
    expect(liquid.filters.fileDisplayName(null)).to.eq(null);
  });

  it('returns null when undefined is passed', () => {
    expect(liquid.filters.fileDisplayName(undefined)).to.eq(null);
  });

  it('returns null when empty string is passed', () => {
    expect(liquid.filters.fileDisplayName('')).to.eq(null);
  });

  it('returns an empty string when an empty array is passed', () => {
    expect(liquid.filters.fileDisplayName([])).to.eq('');
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
  const testData = [
    { class: { abstract: { number: 3 } } },
    { class: { abstract: { number: 5 } } },
    { class: { abstract: { number: 4 } } },
    { class: { abstract: { number: 1 } } },
    { class: { abstract: { number: 1 } } },
    { class: { abstract: { number: null } } },
  ];

  it('returns all objects matching the given path and value', () => {
    expect(
      liquid.filters.filterBy(testData, 'class.abstract.number', 1),
    ).to.deep.equal([
      { class: { abstract: { number: 1 } } },
      { class: { abstract: { number: 1 } } },
    ]);
  });

  it('returns empty array for zero matches', () => {
    expect(
      liquid.filters.filterBy(testData, 'class.abstract.number', 2),
    ).to.deep.equal([]);
  });

  it('includes entries where target is null if includeNull is true', () => {
    const expected = [
      { class: { abstract: { number: 3 } } },
      { class: { abstract: { number: null } } },
    ];
    expect(
      liquid.filters.filterBy(testData, 'class.abstract.number', 3, true),
    ).to.deep.equal(expected);
  });

  it('returns null for null', () => {
    expect(liquid.filters.filterBy(null)).to.be.null;
  });
});

describe('rejectBy', () => {
  const testData = [
    { class: { abstract: { number: 3 } } },
    { class: { abstract: { number: 5 } } },
    { class: { abstract: { number: 4 } } },
    { class: { abstract: { number: 1 } } },
    { class: { abstract: { number: 1 } } },
    { class: { abstract: { number: null } } },
  ];

  it('returns all objects with the given path except those matching value', () => {
    expect(
      liquid.filters.rejectBy(testData, 'class.abstract.number', 1),
    ).to.deep.equal([
      { class: { abstract: { number: 3 } } },
      { class: { abstract: { number: 5 } } },
      { class: { abstract: { number: 4 } } },
    ]);
  });

  it('returns all objects with the given path except those in value list', () => {
    expect(
      liquid.filters.rejectBy(testData, 'class.abstract.number', '1|3'),
    ).to.deep.equal([
      { class: { abstract: { number: 5 } } },
      { class: { abstract: { number: 4 } } },
    ]);
  });

  it('returns null for null', () => {
    expect(liquid.filters.rejectBy(null)).to.be.null;
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

describe('sortObjectsBy', () => {
  const objectsToSort = [
    {
      title: 'Nashville Vet Center - Bowling Green',
    },
    {
      title: 'Clarksville Outstation',
    },
  ];

  const sortedObjects = [
    {
      title: 'Clarksville Outstation',
    },
    {
      title: 'Nashville Vet Center - Bowling Green',
    },
  ];

  it('sorts objects alphabetically by key', () => {
    expect(liquid.filters.sortObjectsBy(objectsToSort, 'title')).to.deep.equal(
      sortedObjects,
    );
  });
});

describe('concat', () => {
  it('concatenates all arrays passed as arguments', () => {
    const a1 = [];
    const a2 = [1, 2, 3];
    const a3 = ['a', { foo: 'bar' }];

    const result = [1, 2, 3, 'a', { foo: 'bar' }];

    expect(liquid.filters.concat(a1, a2, a3)).to.deep.equal(result);
  });
});

describe('getValuesForPath', () => {
  it('returns an array of values for single-part path', () => {
    const array = [{ foo: 'bar' }, { foo: 'baz' }];
    const result = ['bar', 'baz'];

    expect(liquid.filters.getValuesForPath(array, 'foo')).to.deep.equal(result);
  });

  it('returns an array of values for multi-part path', () => {
    const array = [
      { class: { abstract: { number: 3 } } },
      { class: { abstract: { number: 5 } } },
      { class: { abstract: { number: 4 } } },
      { class: { abstract: { number: 1 } } },
      { class: { abstract: { number: 1 } } },
      { class: { abstract: { number: null } } },
    ];

    const result = [3, 5, 4, 1, 1, null];

    expect(
      liquid.filters.getValuesForPath(array, 'class.abstract.number'),
    ).to.deep.equal(result);
  });

  it('returns null if array is null', () => {
    expect(liquid.filters.getValuesForPath(null, 'foo')).to.be.null;
  });
});

describe('formatPath', () => {
  it('adds a trailing slash correctly', () => {
    const path = '/resources/tag/all-veterans/2';
    const expected = '/resources/tag/all-veterans/2/';
    expect(liquid.filters.formatPath(path)).to.equal(expected);
  });

  it('does not add a trailing slash when there is a trailing *', () => {
    const path = '/resources/tag/all-veterans/2/*';
    const expected = '/resources/tag/all-veterans/2/*';
    expect(liquid.filters.formatPath(path)).to.equal(expected);
  });

  it('adds a leading slash correctly', () => {
    const path = 'resources/tag/all-veterans/2/';
    const expected = '/resources/tag/all-veterans/2/';
    expect(liquid.filters.formatPath(path)).to.equal(expected);
  });

  it('formats correctly when there is a leading * or ! but misses a `/` for the second character', () => {
    let path = '*resources/tag/all-veterans/2';
    let expected = '*/resources/tag/all-veterans/2/';
    expect(liquid.filters.formatPath(path)).to.equal(expected);

    path = '!resources/tag/all-veterans/2';
    expected = '!/resources/tag/all-veterans/2/';
    expect(liquid.filters.formatPath(path)).to.equal(expected);
  });

  it('formats `*` and `!` paths correctly', () => {
    let path = '*';
    let expected = '*';
    expect(liquid.filters.formatPath(path)).to.equal(expected);

    path = '!';
    expected = '!';
    expect(liquid.filters.formatPath(path)).to.equal(expected);
  });

  it('formats the homepage correctly', () => {
    const path = '/';
    const expected = '/';
    expect(liquid.filters.formatPath(path)).to.equal(expected);
  });
});

describe('isBannerVisible', () => {
  it('returns false if an argument is missing', () => {
    const targetPaths = ['/'];
    const currentPath = '/';

    expect(liquid.filters.isBannerVisible(undefined, currentPath)).to.equal(
      false,
    );
    expect(liquid.filters.isBannerVisible(targetPaths, undefined)).to.equal(
      false,
    );
    expect(liquid.filters.isBannerVisible(undefined, undefined)).to.equal(
      false,
    );
  });

  it('returns false if current path is not included in target paths', () => {
    const targetPaths = ['/somepath/'];
    const currentPath = '/someotherpath/';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      false,
    );
  });

  it('returns true if banner is visible', () => {
    const targetPaths = ['/'];
    const currentPath = '/';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      true,
    );
  });

  it('returns true if we are under a catch-all target path', () => {
    const targetPaths = ['/some/path/*'];
    const currentPath = '/some/path/test';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      true,
    );
  });

  it('returns false if we are not under a catch-all target path', () => {
    let targetPaths = ['/some/path/*'];
    let currentPath = '/some/path/';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      false,
    );

    targetPaths = ['/some/path/*'];
    currentPath = '/some/';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      false,
    );
  });

  it('returns false if it is an exception path', () => {
    const targetPaths = ['/some/path/', '!/some/path/'];
    const currentPath = '/some/path/';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      false,
    );
  });

  it('returns false if it is an exception catch-all path', () => {
    const targetPaths = ['/some/path/about/', '/some/path/*', '!/some/path/*'];
    const currentPath = '/some/path/about/';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      false,
    );
  });
});

describe('deriveVisibleBanners', () => {
  it('returns an empty array if no banners are defined', () => {
    const banners = [];
    const currentPath = '/';

    expect(
      liquid.filters.deriveVisibleBanners(banners, currentPath),
    ).to.deep.equal([]);
  });

  it('returns an empty array if no current path is defined', () => {
    const banners = [{ fieldTargetPaths: ['/some/path/'] }];
    const currentPath = undefined;

    expect(
      liquid.filters.deriveVisibleBanners(banners, currentPath),
    ).to.deep.equal([]);
  });

  it('returns visible banners', () => {
    const banners = [
      { fieldTargetPaths: ['/some/path/'] },
      { fieldTargetPaths: ['/some/*'] },
      { fieldTargetPaths: ['/some/*', '!/some/*'] },
      { fieldTargetPaths: ['/some/*', '!/some/path/'] },
      { fieldTargetPaths: ['/some/*', '!/some/path'] },
      { fieldTargetPaths: ['/some/*', '!some/path'] },
      { fieldTargetPaths: ['/some/'] },
      { fieldTargetPaths: ['some'] },
      { fieldTargetPaths: ['/some'] },
      { fieldTargetPaths: ['some/'] },
    ];
    const currentPath = '/some/path';

    expect(
      liquid.filters.deriveVisibleBanners(banners, currentPath),
    ).to.deep.equal([banners[0], banners[1]]);
  });
});

describe('formatAlertType', () => {
  it('formats "information" to "info" alert type', () => {
    expect(liquid.filters.formatAlertType('INFORMATION')).to.equal('info');
    expect(liquid.filters.formatAlertType('information')).to.equal('info');
  });

  it('defaults to "info" when no alertType is provided', () => {
    expect(liquid.filters.formatAlertType()).to.equal('info');
  });

  it('formats "info" to "info" alert type', () => {
    expect(liquid.filters.formatAlertType('INFO')).to.equal('info');
    expect(liquid.filters.formatAlertType('info')).to.equal('info');
  });

  it('formats "error" to "error" alert type', () => {
    expect(liquid.filters.formatAlertType('ERROR')).to.equal('error');
    expect(liquid.filters.formatAlertType('error')).to.equal('error');
  });

  it('formats "warning" to "warning" alert type', () => {
    expect(liquid.filters.formatAlertType('WARNING')).to.equal('warning');
    expect(liquid.filters.formatAlertType('warning')).to.equal('warning');
  });

  it('formats "success" to "success" alert type', () => {
    expect(liquid.filters.formatAlertType('SUCCESS')).to.equal('success');
    expect(liquid.filters.formatAlertType('success')).to.equal('success');
  });

  describe('it deriveLanguageTranslation', () => {
    it('returns spanish translation of Download VA Form', () => {
      expect(
        liquid.filters.deriveLanguageTranslation(
          'es',
          'downloadVaForm',
          '10-10EZ (esp)',
        ),
      ).to.equal('Descargar el formulario VA 10-10EZ (esp)');
    });

    it('returns english of Download VA Form', () => {
      expect(
        liquid.filters.deriveLanguageTranslation(
          null,
          'downloadVaForm',
          '10-10EZ',
        ),
      ).to.equal('Download VA Form 10-10EZ');
      expect(
        liquid.filters.deriveLanguageTranslation(
          undefined,
          'downloadVaForm',
          '10-10EZ',
        ),
      ).to.equal('Download VA Form 10-10EZ');
      expect(
        liquid.filters.deriveLanguageTranslation(
          'en',
          'downloadVaForm',
          '10-10EZ',
        ),
      ).to.equal('Download VA Form 10-10EZ');
    });
  });
});

describe('getValueFromObjPath', () => {
  it('returns object item at path', () => {
    const testData = { class: { abstract: { number: 1 } } };
    expect(
      liquid.filters.getValueFromObjPath(testData, 'class.abstract.number'),
    ).to.eq(1);
  });
});

describe('processCentralizedContent', () => {
  it('returns null if null is passed', () => {
    expect(liquid.filters.processCentralizedContent(null, 'wysiwyg')).to.be
      .null;
  });

  it('returns null if null is passed - default', () => {
    expect(liquid.filters.processCentralizedContent(null, 'test_bundle')).to.be
      .null;
  });

  it('returns null if empty string is passed', () => {
    expect(liquid.filters.processCentralizedContent('', 'test_bundle')).to.be
      .null;
  });

  it('returns null for null', () => {
    expect(liquid.filters.processCentralizedContent(null)).to.be.null;
  });

  it('returns test data when contentType = wysiwyg', () => {
    const testData = vetCenterData.fieldCcVetCenterCallCenter.fetched;

    expect(
      liquid.filters.processCentralizedContent(
        testData,
        vetCenterData.fieldCcVetCenterCallCenter.fetchedBundle,
      ),
    ).to.deep.eq(testData);
  });

  it('converts fieldWysiwyg.processed from snake case/array to camel case/string', () => {
    const testData = {
      // eslint-disable-next-line camelcase
      field_wysiwyg: [{ processed: 'test' }],
    };

    const expected = {
      fieldWysiwyg: { processed: 'test' },
    };

    expect(
      liquid.filters.processCentralizedContent(testData, 'wysiwyg'),
    ).to.deep.eq(expected);
  });

  it('returns expected if contentType = q_a_section.', () => {
    const oldFieldQuestionsData = {
      fieldQuestions: [
        {
          entity: {
            targetId: '29903', // targetId gets renamed to entityId as long as there is not entityId already present
            targetRevisionId: '422164',
            entityType: 'paragraph',
            entityBundle: 'q_a',
            pid: '29903',
            label: 'National Vet Center content > Content > Questions',
            status: true,
            langcode: 'en',
            fieldAnswer: [
              {
                entity: {
                  targetId: '29902',
                  targetRevisionId: '422163',
                  entityType: 'paragraph',
                  entityBundle: 'wysiwyg',
                  pid: '29902',
                  label:
                    'National Vet Center content > Content > Questions > Answer',
                  status: true,
                  langcode: 'en',
                  fieldWysiwyg: [
                    {
                      value:
                        "<p>Vet Centers are small, non-medical, counseling centers conveniently located in your community. They're staffed by highly trained counselors and team members dedicated to seeing you through the challenges that come with managing life during and after the military.</p>\r\n\r\n<p>Whether you come in for one-on-one counseling or to participate in a group session, at Vet Centers you can form social connections, try new things, and build a support system with people who understand you and want to help you succeed.</p>\r\n",
                      format: 'rich_text_limited',
                      processed:
                        "<p>Vet Centers are small, non-medical, counseling centers conveniently located in your community. They're staffed by highly trained counselors and team members dedicated to seeing you through the challenges that come with managing life during and after the military.</p>\n<p>Whether you come in for one-on-one counseling or to participate in a group session, at Vet Centers you can form social connections, try new things, and build a support system with people who understand you and want to help you succeed.</p>\n",
                    },
                  ],
                },
              },
            ],
            fieldQuestion: [
              {
                value: 'What are Vet Centers?',
              },
            ],
          },
        },
      ],
    };

    const newFieldQuestionsData = {
      fieldQuestions: [
        {
          entity: {
            entityId: '29903',
            targetRevisionId: '422164',
            entityType: 'paragraph',
            entityBundle: 'q_a',
            pid: '29903',
            label: 'National Vet Center content > Content > Questions',
            status: true,
            langcode: 'en',
            fieldAnswer: [
              {
                entity: {
                  targetId: '29902',
                  targetRevisionId: '422163',
                  entityType: 'paragraph',
                  entityBundle: 'wysiwyg',
                  pid: '29902',
                  label:
                    'National Vet Center content > Content > Questions > Answer',
                  status: true,
                  langcode: 'en',
                  fieldWysiwyg: [
                    {
                      value:
                        "<p>Vet Centers are small, non-medical, counseling centers conveniently located in your community. They're staffed by highly trained counselors and team members dedicated to seeing you through the challenges that come with managing life during and after the military.</p>\r\n\r\n<p>Whether you come in for one-on-one counseling or to participate in a group session, at Vet Centers you can form social connections, try new things, and build a support system with people who understand you and want to help you succeed.</p>\r\n",
                      format: 'rich_text_limited',
                      processed:
                        "<p>Vet Centers are small, non-medical, counseling centers conveniently located in your community. They're staffed by highly trained counselors and team members dedicated to seeing you through the challenges that come with managing life during and after the military.</p>\n<p>Whether you come in for one-on-one counseling or to participate in a group session, at Vet Centers you can form social connections, try new things, and build a support system with people who understand you and want to help you succeed.</p>\n",
                    },
                  ],
                },
              },
            ],
            fieldQuestion: 'What are Vet Centers?',
          },
        },
      ],
    };
    const testData = {
      fieldAccordionDisplay: [{ value: '1' }],
      fieldSectionHeader: [{ value: "How we're different than a clinic" }],
      fieldSectionIntro: [{ value: 'Click on a topic for more details.' }],
      ...oldFieldQuestionsData,
    };

    const expected = {
      fieldAccordionDisplay: '1',
      fieldSectionHeader: "How we're different than a clinic",
      fieldSectionIntro: 'Click on a topic for more details.',
      ...newFieldQuestionsData,
    };

    expect(
      liquid.filters.processCentralizedContent(testData, 'q_a_section'),
    ).to.deep.eq(expected);
  });

  it('returns expected if contentType = list_of_link_teasers', () => {
    const centralizedContent = {
      fieldTitle: [
        {
          value: 'More information',
        },
      ],
      fieldVaParagraphs: [
        {
          entity: {
            targetId: '77155',
            targetRevisionId: '393053',
            entityType: 'paragraph',
            entityBundle: 'link_teaser',
            fieldLink: [
              {
                uri: 'entity:node/703',
                url: {
                  path: '/health-care/copay-rates',
                },
                title: 'VA health care copay rates',
                options: [],
              },
            ],
            fieldLinkSummary: [
              {
                value:
                  'Review copay rates for outpatient care, hospital stays, medications, and other health services.',
              },
            ],
          },
        },
      ],
    };

    const expected = {
      fieldTitle: 'More information',
      fieldVaParagraphs: [
        {
          entity: {
            entityId: '77155',
            targetRevisionId: '393053',
            entityType: 'paragraph',
            entityBundle: 'link_teaser',
            fieldLink: {
              uri: 'entity:node/703',
              url: {
                path: '/health-care/copay-rates',
              },
              title: 'VA health care copay rates',
              options: [],
            },
            fieldLinkSummary:
              'Review copay rates for outpatient care, hospital stays, medications, and other health services.',
          },
        },
      ],
    };

    expect(
      liquid.filters.processCentralizedContent(
        centralizedContent,
        'list_of_link_teasers',
      ),
    ).to.deep.eq(expected);
  });

  it('returns test data if contentType does not match any of the cases - default', () => {
    const testData = vetCenterData.fieldVetCenterFeatureContent;
    expect(
      liquid.filters.processCentralizedContent(testData, 'test_bundle'),
    ).to.eq(testData);
  });

  it('returns expected if contentType = react_widget', () => {
    const testData = {
      fieldButtonFormat: [{ value: '0' }],
      fieldCtaWidget: [{ value: '1' }],
      fieldDefaultLink: [],
      fieldErrorMessage: [
        {
          value:
            '<strong>We’re sorry. Something went wrong when we tried to load your saved application.</strong><br/>Please try refreshing your browser in a few minutes.',
          format: 'rich_text',
          processed:
            '<strong>We’re sorry. Something went wrong when we tried to load your saved application.</strong><br />Please try refreshing your browser in a few minutes.',
        },
      ],
      fieldLoadingMessage: [],
      fieldTimeout: [{ value: '20' }],
      fieldWidgetType: [{ value: 'health-records' }],
    };

    const expected = {
      fieldButtonFormat: '0',
      fieldCtaWidget: '1',
      fieldDefaultLink: [],
      fieldErrorMessage: {
        value:
          '<strong>We’re sorry. Something went wrong when we tried to load your saved application.</strong><br/>Please try refreshing your browser in a few minutes.',
      },
      fieldLoadingMessage: [],
      fieldTimeout: '20',
      fieldWidgetType: 'health-records',
    };

    expect(
      liquid.filters.processCentralizedContent(testData, 'react_widget'),
    ).to.deep.eq(expected);
  });
});

describe('sanitizeHtml', () => {
  it('escapes special characters', () => {
    expect(liquid.filters.sanitizeHtml('&<>"\'')).to.equal(
      '&amp;&lt;&gt;&quot;&apos;',
    );
  });

  it('returns string without special characters', () => {
    expect(liquid.filters.sanitizeHtml('test')).to.equal('test');
  });

  it('allows tags', () => {
    expect(liquid.filters.sanitizeHtml('<p>test</p>')).to.equal('<p>test</p>');
  });

  it('handles null', () => {
    expect(liquid.filters.sanitizeHtml(null)).to.be.null;
  });
});
