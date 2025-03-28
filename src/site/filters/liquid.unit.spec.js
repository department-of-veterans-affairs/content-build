/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import liquid from 'tinyliquid';
import { expect, assert } from 'chai';
import featuredContentData from '../layouts/tests/vet_center/template/fixtures/featuredContentData.json';
import pressReleasesMockData from '../layouts/tests/vamc/fixtures/pressReleasesMockData.json';
import registerFilters from './liquid';
import sidebarData from './fixtures/sidebarData.json';
import { vbaRegionFacilityOrOfficeNode } from './fixtures/vbaFacility';
import vetCenterData from '../layouts/tests/vet_center/template/fixtures/vet_center_data.json';
import vetCenterHoursData from '../layouts/tests/vet_center/template/fixtures/vet_center_hours_data.json';
import healthCareRegionNonClinicalServicesData from './fixtures/healthCareRegionNonClinicalServicesData.json';
import vbaDataCantFind from '../layouts/tests/vba/template/fixtures/vba_facility_data_cant_find_benefits.json';
import vbaDataBenefitHotline from '../layouts/tests/vba/template/fixtures/vba_facility_data_benefits_hotline.json';
import vbaDataUpdates from '../layouts/tests/vba/template/fixtures/vba_facility_data_updates.json';
import phoneMockData from '../layouts/tests/vamc/fixtures/phoneMockData.json';
import simpleWysiwygMockData from '../layouts/tests/vamc/fixtures/simpleWysiwygMockData.json';
// import debug from 'debug';
// To make debugging/building liquid filter tests easier. Add DEBUG=liquid before yarn test
// Add `log` statements in the liquid filters while building.
// const log = debug('liquid');

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

describe('filterUpcomingEvents', () => {
  const futureEvents = [
    {
      fieldDatetimeRangeTimezone: {
        endTime: '2100-12-07 14:00:00 America/New_York',
        endValue: 4131892800,
        startTime: '2100-12-07 15:00:00 America/New_York',
        timezone: 'America/New_York',
        value: 4131896400,
      },
    },
    {
      fieldDatetimeRangeTimezone: {
        endTime: '2100-09-05 17:00:00 America/New_York',
        endValue: 4123864800,
        startTime: '2100-09-05 18:00:00 America/New_York',
        value: 4123868400,
      },
    },
  ];

  const pastEvents = [
    {
      fieldDatetimeRangeTimezone: {
        endTime: '2023-12-07 13:00:00 America/New_York',
        endValue: 1701972000,
        startTime: '2023-12-07 10:00:00 America/New_York',
        value: 1701961200,
      },
    },
    {
      fieldDatetimeRangeTimezone: {
        endTime: '2023-09-05 17:00:00 America/New_York',
        endValue: 1693947600,
        startTime: '2023-09-05 14:00:00 America/New_York',
        value: 1693936800,
      },
    },
  ];

  it('should return null when no data is given', () => {
    expect(liquid.filters.filterUpcomingEvents()).to.be.null;
  });

  it('should return only events that are in the future', () => {
    expect(liquid.filters.filterUpcomingEvents(pastEvents)).to.deep.equal([]);
  });

  it('should return only events that are in the future', () => {
    expect(liquid.filters.filterUpcomingEvents(futureEvents)).to.deep.equal(
      futureEvents,
    );
  });

  it('should return only events that are in the future', () => {
    const events = [
      {
        fieldDatetimeRangeTimezone: [
          {
            endTime: '2023-11-16 13:00:00 America/New_York',
            endValue: 1700157600,
            startTime: '2023-11-16 11:00:00 America/New_York',
            value: 1700150400,
          },
          {
            endTime: '2100-12-07 14:00:00 America/New_York',
            endValue: 4131892800,
            startTime: '2100-12-07 15:00:00 America/New_York',
            value: 4131896400,
          },
        ],
      },
    ];

    expect(liquid.filters.filterUpcomingEvents(events)).to.deep.equal(events);
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

  it('returns hyphenated string in all lowercase', () => {
    expect(liquid.filters.hashReference('Lorem IPSUM dolor SIT amet')).to.eq(
      'lorem-ipsum-dolor-sit-amet',
    );
  });
  it('returns hyphenated string without punctuation', () => {
    expect(liquid.filters.hashReference('lorem, ipsum. dolor; sit amet')).to.eq(
      'lorem-ipsum-dolor-sit-amet',
    );
  });
  it('returns hyphenated string at a set length', () => {
    expect(
      liquid.filters.hashReference('lorem ipsum dolor sit amet', 20),
    ).to.eq('lorem-ipsum-dolor-si');
  });
  it('returns hyphenated string with normalized & stripped out diacritics', () => {
    // normalize diacritics:
    // \u00e9 = é (single character e with acute accent)
    // e\u0301 = é (e + combining acute accent)
    // \u00f1 = ñ (single character n with tilde)
    // n\u0303 = ñ (n + combining tilde)
    expect(
      liquid.filters.hashReference('a \u00e9 e\u0301 \u00f1 n\u0303'),
    ).to.eq('a-e-e-n-n');
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

describe('formatForBreadcrumbs', () => {
  it('returns breadcrumbs formatted for va-breadcrumbs', () => {
    // Create "original" crumbs and current title and path
    const originalCrumbs = [
      {
        url: {
          path: '/',
          routed: false,
        },
        text: 'Home',
      },
    ];
    const currentTitle = 'Resources and Support';
    const currentPath = '/resources';
    const hideHome = null;
    const customHomeText = null;

    // Pass original crumbs and current title and path to filter
    const output = liquid.filters.formatForBreadcrumbs(
      originalCrumbs,
      currentTitle,
      currentPath,
      hideHome,
      customHomeText,
    );

    // Verify that the output matches expectations
    expect(output).to.eq(
      JSON.stringify(
        '[{"href":"/","isRouterLink":false,"label":"Home","lang":"en-US"},{"href":"/resources","isRouterLink":false,"label":"Resources and Support","lang":"en-US"}]',
      ),
    );
  });

  it('removes duplicate paths', () => {
    // Create "original" crumbs
    const originalCrumbs = [
      {
        url: {
          path: '/',
          routed: false,
        },
        text: 'Home',
      },
      {
        url: {
          path: '/resources',
          routed: false,
        },
        text: 'Resources and Support',
      },
    ];
    const currentTitle = 'Resources and Support';
    const currentPath = '/resources';
    const hideHome = null;
    const customHomeText = null;

    // Pass original crumbs and current title and path to filter
    const output = liquid.filters.formatForBreadcrumbs(
      originalCrumbs,
      currentTitle,
      currentPath,
      hideHome,
      customHomeText,
    );

    // Verify that the output matches expectations
    expect(output).to.eq(
      JSON.stringify(
        '[{"href":"/","isRouterLink":false,"label":"Home","lang":"en-US"},{"href":"/resources","isRouterLink":false,"label":"Resources and Support","lang":"en-US"}]',
      ),
    );
  });

  it('removes items with empty paths', () => {
    // Create "original" crumbs
    const originalCrumbs = [
      {
        url: {
          path: '/',
          routed: false,
        },
        text: 'Home',
      },
      {
        url: {
          path: '',
          routed: false,
        },
        text: 'Somewhere Else',
      },
      {
        url: {
          path: '/resources',
          routed: false,
        },
        text: 'Resources and Support',
      },
    ];
    const currentTitle = 'Resources and Support';
    const currentPath = null;
    const hideHome = null;
    const customHomeText = null;

    // Pass original crumbs and current title and path to filter
    const output = liquid.filters.formatForBreadcrumbs(
      originalCrumbs,
      currentTitle,
      currentPath,
      hideHome,
      customHomeText,
    );

    // Verify that the output matches expectations
    expect(output).to.eq(
      JSON.stringify(
        '[{"href":"/","isRouterLink":false,"label":"Home","lang":"en-US"},{"href":"/resources","isRouterLink":false,"label":"Resources and Support","lang":"en-US"}]',
      ),
    );
  });
});

describe('formatForBreadcrumbsHTML', () => {
  it('returns breadcrumbs formatted for va-breadcrumbs', () => {
    // Define original breadcrumbs
    const originalCrumbs = [
      {
        path: 'view-change-dependents/',
        name: 'View or change dependents on your VA disability benefits',
      },
      {
        path: 'view-change-dependents/add-remove-form-21-686c-v2/',
        name: 'Add or remove dependents with VA Form 21-686C',
      },
    ];
    // Process through filter
    const output = liquid.filters.formatForBreadcrumbsHTML(originalCrumbs);
    // Verify output
    expect(output).to.eq(
      JSON.stringify(
        '[{"href":"/","isRouterLink":false,"label":"VA.gov home","lang":"en-US"},{"href":"/view-change-dependents/","isRouterLink":false,"label":"View or change dependents on your VA disability benefits","lang":"en-US"},{"href":"/view-change-dependents/add-remove-form-21-686c-v2/","isRouterLink":false,"label":"Add or remove dependents with VA Form 21-686C","lang":"en-US"}]',
      ),
    );
  });
  it('removes items with empty paths', () => {
    // Define original breadcrumbs
    const originalCrumbs = [
      {
        path: 'view-change-dependents/',
        name: 'View or change dependents on your VA disability benefits',
      },
      {
        path: null,
        name: 'This path does not exist',
      },
      {
        path: 'view-change-dependents/add-remove-form-21-686c-v2/',
        name: 'Add or remove dependents with VA Form 21-686C',
      },
    ];
    // Process through filter
    const output = liquid.filters.formatForBreadcrumbsHTML(originalCrumbs);
    // Verify output
    expect(output).to.eq(
      JSON.stringify(
        '[{"href":"/","isRouterLink":false,"label":"VA.gov home","lang":"en-US"},{"href":"/view-change-dependents/","isRouterLink":false,"label":"View or change dependents on your VA disability benefits","lang":"en-US"},{"href":"/view-change-dependents/add-remove-form-21-686c-v2/","isRouterLink":false,"label":"Add or remove dependents with VA Form 21-686C","lang":"en-US"}]',
      ),
    );
  });
  it('correctly shows display_title or title if provided instead of default name', () => {
    const originalCrumbs = [
      {
        name: 'cerner-staging',
        path: 'cerner-staging',
        children: [
          {
            file: {
              // eslint-disable-next-line camelcase
              display_title: 'Cerner',
            },
          },
        ],
      },
      {
        name: 'appointments',
        path: 'cerner-staging/appointments',
        children: [
          {
            file: {
              title: 'Cerner appointments',
            },
          },
        ],
      },
    ];
    // Process through filter
    const output = liquid.filters.formatForBreadcrumbsHTML(originalCrumbs);
    // Verify output
    expect(output).to.eq(
      JSON.stringify(
        '[{"href":"/","isRouterLink":false,"label":"VA.gov home","lang":"en-US"},{"href":"/cerner-staging","isRouterLink":false,"label":"Cerner","lang":"en-US"},{"href":"/cerner-staging/appointments","isRouterLink":false,"label":"Cerner appointments","lang":"en-US"}]',
      ),
    );
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
      liquid.filters.createEmbedYouTubeVideoURL(
        'https://www.youtube.com/embed/HlkZeAYmw94',
      ),
    ).to.eq('https://www.youtube.com/embed/HlkZeAYmw94');
  });

  it('returns the modified URL if it needs it', () => {
    expect(
      liquid.filters.createEmbedYouTubeVideoURL('https://youtu.be/HlkZeAYmw94'),
    ).to.eq('https://www.youtube.com/embed/HlkZeAYmw94');

    expect(
      liquid.filters.createEmbedYouTubeVideoURL(
        'https://www.youtube.com/watch?v=HlkZeAYmw94',
      ),
    ).to.eq('https://www.youtube.com/embed/HlkZeAYmw94');
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
      fieldAudienceBeneficiares: [
        {
          entity: {
            name: 'C. Example',
          },
        },
      ],
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
      'foo &copy; bar &ne; baz &#x1D306; qux&apos;&apos;',
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

describe('local spotlight content', () => {
  it('shims local featured content from local spotlight to fetched form centralized content', () => {
    const localSpotlightData = {
      id: 144308,
      fieldDescription: {
        value: '<p>Local Spotlight for Facebook</p>',
        processed:
          '<html><head></head><body><p>Local Spotlight for Facebook</p>\n</body></html>',
        format: 'rich_text_limited',
      },
      fieldSectionHeader: 'Facebook Spotlight 1',
      fieldCta: {
        entity: {
          fieldButtonLink: {
            url: {
              path: 'https://facebook.com',
            },
            uri: 'https://facebook.com',
            title: '',
            options: {
              href: 'https://facebook.com',
              'data-entity-type': '',
              'data-entity-uuid': '',
              'data-entity-substitution': '',
            },
          },
          fieldButtonLabel: 'Facebook',
        },
      },
    };
    const centralizedContentFormattedData = liquid.filters.shimNonFetchedFeaturedToFetchedFeaturedContent(
      localSpotlightData,
    );
    expect(centralizedContentFormattedData).to.deep.equal({
      fetched: {
        fieldCta: [
          {
            entity: {
              fieldButtonLabel: [
                {
                  value: 'Facebook',
                },
              ],
              fieldButtonLink: [
                {
                  options: {
                    'data-entity-substitution': '',
                    'data-entity-type': '',
                    'data-entity-uuid': '',
                    href: 'https://facebook.com',
                  },
                  title: '',
                  uri: 'https://facebook.com',
                  url: {
                    path: 'https://facebook.com',
                  },
                },
              ],
            },
          },
        ],
        fieldDescription: [
          {
            format: 'rich_text_limited',
            processed:
              '<html><head></head><body><p>Local Spotlight for Facebook</p>\n</body></html>',
            value: '<p>Local Spotlight for Facebook</p>',
          },
        ],
        fieldSectionHeader: [
          {
            value: 'Facebook Spotlight 1',
          },
        ],
      },
    });
  });
  it('shims local featured content from local spotlight to fetched form centralized content without CTA', () => {
    const localSpotlightData = {
      id: 144308,
      fieldDescription: {
        value: '<p>Local Spotlight for Facebook</p>',
        processed:
          '<html><head></head><body><p>Local Spotlight for Facebook</p>\n</body></html>',
        format: 'rich_text_limited',
      },
      fieldSectionHeader: 'Facebook Spotlight 1',
      fieldCta: null,
    };
    const centralizedContentFormattedData = liquid.filters.shimNonFetchedFeaturedToFetchedFeaturedContent(
      localSpotlightData,
    );
    expect(centralizedContentFormattedData).to.deep.equal({
      fetched: {
        fieldCta: [],
        fieldDescription: [
          {
            format: 'rich_text_limited',
            processed:
              '<html><head></head><body><p>Local Spotlight for Facebook</p>\n</body></html>',
            value: '<p>Local Spotlight for Facebook</p>',
          },
        ],
        fieldSectionHeader: [
          {
            value: 'Facebook Spotlight 1',
          },
        ],
      },
    });
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
describe('processPhoneToVaTelephoneOrFallback', () => {
  it('returns a phone number wrapped in a va-telephone component with no extension attribute if it is a valid phone number with no extension', () => {
    const phoneNumber = '123-456-7890';
    const expected = `<va-telephone contact="${phoneNumber}"></va-telephone>`;
    expect(
      liquid.filters.processPhoneToVaTelephoneOrFallback(phoneNumber),
    ).to.equal(expected);
  });
  it('returns a phone number wrapped in a va-telephone component with an extension if it is a valid phone number with extension', () => {
    const phoneNumber = '123-456-7890, ext. 3204';
    const expected = `<va-telephone contact="123-456-7890" extension="3204"></va-telephone>`;
    expect(
      liquid.filters.processPhoneToVaTelephoneOrFallback(phoneNumber),
    ).to.equal(expected);
  });
  it('retuns an anchor tag with a tel prefixed phone number when the number cannot be used in a va-telephone component', () => {
    const phoneNumber = '123-VET-VETS';
    const expected = `<a href="tel:+1123-VET-VETS">123-VET-VETS</a>`;
    expect(
      liquid.filters.processPhoneToVaTelephoneOrFallback(phoneNumber),
    ).to.equal(expected);
  });
});
describe('phoneLinks', () => {
  it('wraps text phone numbers in a link', () => {
    const text = 'Here is a phone number: 123-456-7890. Pretty cool!';
    const expected =
      'Here is a phone number: <va-telephone contact="123-456-7890" extension=""></va-telephone>. Pretty cool!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('wraps phone numbers with parentheses around the area code', () => {
    const text = 'Here is a phone number: (123)-456-7890. Pretty cool!';
    const expected =
      'Here is a phone number: <va-telephone contact="123-456-7890" extension=""></va-telephone>. Pretty cool!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('wraps phone numbers with space after the area code', () => {
    const text = 'Here is a phone number: (123) 456-7890. Pretty cool!';
    const expected =
      'Here is a phone number: <va-telephone contact="123-456-7890" extension=""></va-telephone>. Pretty cool!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('wraps phone numbers with no dash or space after the area code', () => {
    const text = 'Here is a phone number: (123)456-7890. Pretty cool!';
    const expected =
      'Here is a phone number: <va-telephone contact="123-456-7890" extension=""></va-telephone>. Pretty cool!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('wraps multiple phone numbers', () => {
    const text =
      'Here is a phone number: (123)-456-7890. And (1111) more: 890-456-1234. Noice!';
    const expected =
      'Here is a phone number: <va-telephone contact="123-456-7890" extension=""></va-telephone>. ' +
      'And (1111) more: <va-telephone contact="890-456-1234" extension=""></va-telephone>. Noice!';
    expect(liquid.filters.phoneLinks(text)).to.equal(expected);
  });

  it('does not double-wrap phone numbers', () => {
    const html =
      'Here is a <va-telephone href="test" extension="">phone number</va-telephone>: <va-telephone contact="123-456-7890"></va-telephone>. Pretty cool!';
    expect(liquid.filters.phoneLinks(html)).to.equal(html);
  });

  it('does not double-wrap phone numbers in va-telephone components', () => {
    const html =
      'Here is a <a href="test">phone number</a>: <va-telephone contact="123-456-7890"></va-telephone>. Pretty cool!';
    expect(liquid.filters.phoneLinks(html)).to.equal(html);
  });

  it('properly returns the data when a phone number is not in it', () => {
    const html =
      'Here is some completely unrelated stuff <h4> with no phone numbers </h4> and just <p> some basic text</p> blah';
    expect(liquid.filters.phoneLinks(html)).to.equal(html);
  });
});

describe('separatePhoneNumberExtension similar to functioning on Vets-website', () => {
  it('processes a phone number with an extension and returns an object with the phone number and extension', () => {
    const phoneNumber = '123-456-7890 x1234';
    const expected = {
      phoneNumber: '123-456-7890',
      extension: '1234',
      processed: true,
    };
    expect(
      liquid.filters.separatePhoneNumberExtension(phoneNumber),
    ).to.deep.equal(expected);
  });
  it('processes a phone number with parentheses an extension and returns an object with the phone number and extension', () => {
    const phoneNumber = '(123) 456-7890 x1234';
    const expected = {
      phoneNumber: '123-456-7890',
      extension: '1234',
      processed: true,
    };
    expect(
      liquid.filters.separatePhoneNumberExtension(phoneNumber),
    ).to.deep.equal(expected);
  });
  it('should process phone number strings into phone and extension', () => {
    const phoneNumber = '800-827-1000';
    const extension = '123';
    const phoneConditions = [
      '',
      'x',
      ' ext ',
      ' ext. ',
      ' x. ',
      ', x',
      ', ext',
      ', ext.',
      ', ext. ',
    ]
      // For all cases except the first, concatenate the phoneNumber, extension separator, and extension
      .map((e, i) => (i === 0 ? phoneNumber : phoneNumber + e + extension));
    for (let i = 0; i < phoneConditions.length; i += 1) {
      const processed = liquid.filters.separatePhoneNumberExtension(
        phoneConditions[i],
      );
      if (i === 0) {
        expect(processed).to.deep.equal({
          phoneNumber,
          extension: '',
          processed: true,
        });
      } else {
        expect(processed).to.deep.equal({
          phoneNumber,
          extension,
          processed: true,
        });
      }
    }
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

describe('sortObjectsWithConditionalKeys', () => {
  const objectsToSort = [
    {
      facilityService: {
        fieldServiceNameAndDescripti: {
          entity: {
            name: 'Homeless Veteran Care',
          },
        },
      },
    },
    {
      regionalService: {
        fieldServiceNameAndDescripti: {
          entity: {
            name: 'VetSuccess on Campus',
          },
        },
      },
    },
    {
      regionalService: {
        fieldServiceNameAndDescripti: {
          entity: {
            name: 'Disability compensation',
          },
        },
      },
    },
    {
      facilityService: {
        fieldServiceNameAndDescripti: {
          entity: {
            name: 'Home loans',
          },
        },
      },
    },
  ];

  const sortedObjects = [
    {
      regionalService: {
        fieldServiceNameAndDescripti: {
          entity: {
            name: 'Disability compensation',
          },
        },
      },
    },
    {
      facilityService: {
        fieldServiceNameAndDescripti: {
          entity: {
            name: 'Home loans',
          },
        },
      },
    },
    {
      facilityService: {
        fieldServiceNameAndDescripti: {
          entity: {
            name: 'Homeless Veteran Care',
          },
        },
      },
    },
    {
      regionalService: {
        fieldServiceNameAndDescripti: {
          entity: {
            name: 'VetSuccess on Campus',
          },
        },
      },
    },
  ];

  it('sorts objects alphabetically by key', () => {
    expect(
      liquid.filters.sortObjectsWithConditionalKeys(objectsToSort),
    ).to.deep.equal(sortedObjects);
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

  it('adds a trailing slash when there is a trailing *', () => {
    const path = '/resources/tag/all-veterans/2/*';
    const expected = '/resources/tag/all-veterans/2/*/';
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
  it('returns true without a trailing slash on the target path', () => {
    const targetPaths = ['/some/path/test'];
    const currentPath = '/some/path/test';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      true,
    );
  });

  it('returns true with a trailing slash on target path', () => {
    const targetPaths = ['/some/path/test/'];
    const currentPath = '/some/path/test';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      true,
    );
  });

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
    const targetPaths = ['/some/path/*', '/some/path/*/'];
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
    let targetPaths = ['/some/path/about/', '/some/path/*', '!/some/path/*/'];
    const currentPath = '/some/path/about/';

    expect(liquid.filters.isBannerVisible(targetPaths, currentPath)).to.equal(
      false,
    );

    targetPaths = ['/some/path/about/', '/some/path/*', '!/some/path/*'];
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

describe('processfieldCcCantFindBenefits', () => {
  it('returns null if null is passed', () => {
    expect(liquid.filters.processfieldCcCantFindBenefits(null)).to.be.null;
  });
  it('returns Cannot Find Benefits data in simplified object', () => {
    const data = liquid.filters.processfieldCcCantFindBenefits(vbaDataCantFind);
    expect(data.fieldSectionHeader).to.be.equal(
      vbaDataCantFind.fetched.fieldSectionHeader[0].value,
    );
    expect(data.fieldDescription).to.be.equal(
      vbaDataCantFind.fetched.fieldDescription[0].processed,
    );
    const { entity } = vbaDataCantFind.fetched.fieldCta[0];
    expect(data.fieldCta.label).to.be.equal(entity.fieldButtonLabel[0].value);
    expect(data.fieldCta.link).to.be.equal(entity.fieldButtonLink[0].url.path);
  });
});

describe('processCentralizedBenefitsHotline', () => {
  it('returns null if null is passed', () => {
    expect(liquid.filters.processCentralizedBenefitsHotline(null)).to.be.null;
  });
  it('returns hotline data in simplified object', () => {
    const data = liquid.filters.processCentralizedBenefitsHotline(
      vbaDataBenefitHotline,
    );
    expect(data.fieldPhoneExtension).to.be.equal(
      vbaDataBenefitHotline.fetched.fieldPhoneExtension[0].value,
    );
  });
});

describe('processCentralizedUpdatesVBA', () => {
  it('returns null if null is passed', () => {
    expect(liquid.filters.processCentralizedUpdatesVBA(null)).to.be.null;
  });
  it('returns simple object of VBA updates', () => {
    const data = liquid.filters.processCentralizedUpdatesVBA(vbaDataUpdates);
    expect(data.sectionHeader).to.be.equal(
      vbaDataUpdates.fetched.fieldSectionHeader[0].value,
    );
    expect(Object.keys(data.links).length).to.be.equal(
      vbaDataUpdates.fetched.fieldLinks.length,
    );
  });
});

describe('processFieldPhoneNumbersParagraph', () => {
  it('returns null if null is passed', () => {
    expect(liquid.filters.processFieldPhoneNumbersParagraph(null)).to.be.null;
  });
  it('returns simple object of phone numbers', () => {
    const data = liquid.filters.processFieldPhoneNumbersParagraph(
      phoneMockData,
    );
    expect(data.contact).to.be.equal(phoneMockData[0].entity.fieldPhoneNumber);
    expect(data.extension).to.be.equal(
      phoneMockData[0].entity.fieldPhoneExtension,
    );
  });
});
describe('processWysiwygSimple', () => {
  it('returns null if null is passed', () => {
    expect(liquid.filters.processWysiwygSimple(null)).to.be.null;
  });
  it('returns null if wysiwyg is empty list', () => {
    expect(
      liquid.filters.processWysiwygSimple({ fetched: { fieldWysiwyg: [] } }),
    ).to.be.null;
  });
  it('returns simple object of wysiwyg', () => {
    const data = liquid.filters.processWysiwygSimple(simpleWysiwygMockData);
    expect(data).to.be.equal(
      simpleWysiwygMockData.fetched.fieldWysiwyg[0].value,
    );
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
              {
                entity: {
                  targetId: '135322',
                  targetRevisionId: '1025879',
                  entityType: 'paragraph',
                  entityBundle: 'alert',
                  pid: '135322',
                  label:
                    'National Vet Center content > Content > Questions > Answer',
                  status: true,
                  langcode: 'en',
                  fieldAlertBlockReference: [],
                  fieldAlertHeading: [
                    {
                      value:
                        'What are the covered educational assistance benefits?',
                    },
                  ],
                  fieldAlertType: [
                    {
                      value: 'information',
                    },
                  ],
                  fieldVaParagraphs: [
                    {
                      entity: {
                        targetId: '135321',
                        targetRevisionId: '1025878',
                        entityType: 'paragraph',
                        entityBundle: 'expandable_text',
                        pid: '135321',
                        label:
                          'National Vet Center content > Content > Questions > Answer > Alert content',
                        status: true,
                        langcode: 'en',
                        fieldTextExpander: [
                          {
                            value:
                              'What are the covered educational assistance benefits?',
                          },
                        ],
                        fieldWysiwyg: [
                          {
                            value:
                              '<p>The covered educational assistance benefits are benefits from any of these programs:&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>Montgomery GI Bill Active Duty</li>\r\n\t<li>Montgomery GI Bill Selected Reserve</li>\r\n\t<li>Post-9/11 GI Bill</li>\r\n\t<li>Reserve Educational Assistance Program (REAP)</li>\r\n\t<li>Veteran Rapid Retraining Assistance Program (VRRAP)</li>\r\n\t<li>Veteran Readiness and Employment (VR&amp;E)</li>\r\n\t<li>Veterans’ Educational Assistance Program (VEAP)</li>\r\n\t<li>Veteran Employment Through Technology Education Courses (VET TEC)</li>\r\n</ul>\r\n',
                            format: 'rich_text',
                            processed:
                              '<html><head></head><body><p>The covered educational assistance benefits are benefits from any of these programs:&#xA0;</p>\n\n<ul><li>Montgomery GI Bill Active Duty</li>\n\t<li>Montgomery GI Bill Selected Reserve</li>\n\t<li>Post-9/11 GI Bill</li>\n\t<li>Reserve Educational Assistance Program (REAP)</li>\n\t<li>Veteran Rapid Retraining Assistance Program (VRRAP)</li>\n\t<li>Veteran Readiness and Employment (VR&amp;E)</li>\n\t<li>Veterans&#x2019; Educational Assistance Program (VEAP)</li>\n\t<li>Veteran Employment Through Technology Education Courses (VET TEC)</li>\n</ul></body></html>',
                          },
                        ],
                      },
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
              {
                entity: {
                  targetId: '135322',
                  targetRevisionId: '1025879',
                  entityType: 'paragraph',
                  entityBundle: 'alert',
                  pid: '135322',
                  label:
                    'National Vet Center content > Content > Questions > Answer',
                  status: true,
                  langcode: 'en',
                  fieldAlertBlockReference: [],
                  fieldAlertHeading:
                    'What are the covered educational assistance benefits?',
                  fieldAlertType: 'information',
                  fieldVaParagraphs: [
                    {
                      entity: {
                        targetId: '135321',
                        targetRevisionId: '1025878',
                        entityType: 'paragraph',
                        entityBundle: 'expandable_text',
                        pid: '135321',
                        label:
                          'National Vet Center content > Content > Questions > Answer > Alert content',
                        status: true,
                        langcode: 'en',
                        fieldTextExpander:
                          'What are the covered educational assistance benefits?',
                        fieldWysiwyg: [
                          {
                            value:
                              '<p>The covered educational assistance benefits are benefits from any of these programs:&nbsp;</p>\r\n\r\n<ul>\r\n\t<li>Montgomery GI Bill Active Duty</li>\r\n\t<li>Montgomery GI Bill Selected Reserve</li>\r\n\t<li>Post-9/11 GI Bill</li>\r\n\t<li>Reserve Educational Assistance Program (REAP)</li>\r\n\t<li>Veteran Rapid Retraining Assistance Program (VRRAP)</li>\r\n\t<li>Veteran Readiness and Employment (VR&amp;E)</li>\r\n\t<li>Veterans’ Educational Assistance Program (VEAP)</li>\r\n\t<li>Veteran Employment Through Technology Education Courses (VET TEC)</li>\r\n</ul>\r\n',
                            format: 'rich_text',
                            processed:
                              '<html><head></head><body><p>The covered educational assistance benefits are benefits from any of these programs:&#xA0;</p>\n\n<ul><li>Montgomery GI Bill Active Duty</li>\n\t<li>Montgomery GI Bill Selected Reserve</li>\n\t<li>Post-9/11 GI Bill</li>\n\t<li>Reserve Educational Assistance Program (REAP)</li>\n\t<li>Veteran Rapid Retraining Assistance Program (VRRAP)</li>\n\t<li>Veteran Readiness and Employment (VR&amp;E)</li>\n\t<li>Veterans&#x2019; Educational Assistance Program (VEAP)</li>\n\t<li>Veteran Employment Through Technology Education Courses (VET TEC)</li>\n</ul></body></html>',
                          },
                        ],
                      },
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

describe('filterSidebarData', () => {
  describe('empty-ish data passed in', () => {
    it('returns passed in sidebarData if it does not have a `links` prop', () => {
      const emptySidebarData = {};
      expect(liquid.filters.filterSidebarData(emptySidebarData)).to.deep.equal(
        emptySidebarData,
      );
    });

    it('returns passed in sidebarData if `links` prop has length zero ', () => {
      const emptySidebarData = {
        links: [],
      };
      expect(liquid.filters.filterSidebarData(emptySidebarData)).to.deep.equal(
        emptySidebarData,
      );
    });

    it('returns passed in sidebarData if `links` prop is not an array', () => {
      const emptySidebarData = {
        links: '',
      };
      expect(liquid.filters.filterSidebarData(emptySidebarData)).to.deep.equal(
        emptySidebarData,
      );
    });
  });

  describe('when NOT preview, includes only links to published entities', () => {
    const expectedFacilities = [
      {
        label: 'Brunswick County VA Clinic',
        entity: {
          linkedEntity: {
            entityPublished: true,
            moderationState: 'published',
          },
        },
      },
      {
        label: 'Jacksonville 2 VA Clinic',
        entity: {
          linkedEntity: {
            entityPublished: true,
            moderationState: 'published',
          },
        },
      },
    ];

    const expectedAboutUs = [
      {
        expanded: false,
        description: null,
        label: 'Mission and vision',
        url: {
          path: '/fayetteville-coastal-health-care/about-us/mission-and-vision',
        },
        entity: {
          linkedEntity: {
            entityPublished: true,
            moderationState: 'published',
          },
        },
        links: [],
      },
      {
        expanded: false,
        description: null,
        label: 'Leadership',
        url: {
          path: '/fayetteville-coastal-health-care/about-us/leadership',
        },
        entity: {
          linkedEntity: {
            entityPublished: true,
            moderationState: 'published',
          },
        },
        links: [],
      },
    ];

    it('returns only links to published entities when isPreview is explicitly false', () => {
      const filteredData = liquid.filters.filterSidebarData(sidebarData, false);
      expect(filteredData.links[0].links[0].links[1].links).to.deep.equal(
        expectedFacilities,
      );
      expect(filteredData.links[0].links[2].links[0].links).to.deep.equal(
        expectedAboutUs,
      );
    });

    it('returns only links to published entities when isPreview is not passed (defaults to false)', () => {
      const filteredData = liquid.filters.filterSidebarData(sidebarData);
      expect(filteredData.links[0].links[0].links[1].links).to.deep.equal(
        expectedFacilities,
      );
      expect(filteredData.links[0].links[2].links[0].links).to.deep.equal(
        expectedAboutUs,
      );
    });
  });

  describe('when preview, includes links to both published and draft entities', () => {
    const expectedFacilities = [
      {
        label: 'Fayetteville VA Medical Center',
        entity: {
          linkedEntity: {
            entityPublished: false,
            moderationState: 'draft',
          },
        },
      },
      {
        label: 'Brunswick County VA Clinic',
        entity: {
          linkedEntity: {
            entityPublished: true,
            moderationState: 'published',
          },
        },
      },
      {
        label: 'Jacksonville 2 VA Clinic',
        entity: {
          linkedEntity: {
            entityPublished: true,
            moderationState: 'published',
          },
        },
      },
    ];

    const expectedAboutUs = [
      {
        expanded: false,
        description: null,
        label: 'Mission and vision',
        url: {
          path: '/fayetteville-coastal-health-care/about-us/mission-and-vision',
        },
        entity: {
          linkedEntity: {
            entityPublished: true,
            moderationState: 'published',
          },
        },
        links: [],
      },
      {
        expanded: false,
        description: null,
        label: 'History',
        url: {
          path: '/fayetteville-coastal-health-care/about-us/history',
        },
        entity: {
          linkedEntity: {
            entityPublished: false,
            moderationState: 'draft',
          },
        },
        links: [],
      },
      {
        expanded: false,
        description: null,
        label: 'Leadership',
        url: {
          path: '/fayetteville-coastal-health-care/about-us/leadership',
        },
        entity: {
          linkedEntity: {
            entityPublished: true,
            moderationState: 'published',
          },
        },
        links: [],
      },
    ];

    it('returns links to both published and draft entities IF in preview mode', () => {
      const filteredData = liquid.filters.filterSidebarData(sidebarData, true);
      expect(filteredData.links[0].links[0].links[1].links).to.deep.equal(
        expectedFacilities,
      );
      expect(filteredData.links[0].links[2].links[0].links).to.deep.equal(
        expectedAboutUs,
      );
    });
  });
});

describe('sliceArray', () => {
  it('returns null if array is null', () => {
    expect(liquid.filters.sliceArray(null, 0, 5)).to.be.null;
  });

  it('returns first 5 elements - startIndex = 0, endIndex = 5', () => {
    const testArray = [1, 2, 3, 4, 5, 6];
    const expected = [1, 2, 3, 4, 5];

    expect(liquid.filters.sliceArray(testArray, 0, 5)).to.deep.eq(expected);
  });

  it('returns elements from startIndex = 2 and on, if an endIndex is not passed in', () => {
    const testArray = [1, 2, 3, 4, 5, 6];
    const expected = [3, 4, 5, 6];

    expect(liquid.filters.sliceArray(testArray, 2)).to.deep.eq(expected);
  });
});

describe('isVisn8', () => {
  it('returns null if data is null', () => {
    expect(liquid.filters.isVisn8(null)).to.be.null;
  });

  it('returns true if string = "VISN 8"', () => {
    expect(liquid.filters.isVisn8('VISN 8 | more text')).to.be.true;
  });

  it('returns true if string = "VISN 8"', () => {
    expect(liquid.filters.isVisn8('VISN 8 |')).to.be.true;
  });

  it('returns false if string does NOT equal "VISN 8"', () => {
    expect(liquid.filters.isVisn8('VISN 9 | more text')).to.be.false;
  });

  it('returns false if string does NOT equal "VISN 8"', () => {
    expect(liquid.filters.isVisn8('VISN 9 more text')).to.be.false;
  });

  it('returns false if string does NOT equal "VISN 8"', () => {
    expect(liquid.filters.isVisn8('VISN 8 more text')).to.be.false;
  });

  it('returns false if string does NOT equal "VISN 8"', () => {
    expect(liquid.filters.isVisn8('| VISN 8 |')).to.be.false;
  });
});

describe('pathContainsSubstring', () => {
  it('returns null if path is null', () => {
    expect(liquid.filters.pathContainsSubstring(null, 'health-care')).to.be
      .null;
  });

  it('returns true if path includes the search value - "health-care"', () => {
    const path = '/butler-health-care';
    expect(liquid.filters.pathContainsSubstring(path, 'health-care')).to.be
      .true;
  });

  it('returns false if path does not include the search value - "health-care"', () => {
    const path = '/escanaba-vet-center';
    expect(liquid.filters.pathContainsSubstring(path, 'health-care')).to.be
      .false;
  });

  it('returns true if path includes the search value - "vet-center"', () => {
    const path = '/escanaba-vet-center/locations';
    expect(liquid.filters.pathContainsSubstring(path, 'vet-center')).to.be.true;
  });

  it('returns false if no search value is passed', () => {
    const path = '/escanaba-vet-center/locations';
    expect(liquid.filters.pathContainsSubstring(path)).to.be.false;
  });
});

describe('deriveMostRecentDate', () => {
  it('returns the argument fieldDatetimeRangeTimezone when it is falsey', () => {
    const fieldDatetimeRangeTimezone = undefined;

    expect(
      liquid.filters.deriveMostRecentDate(fieldDatetimeRangeTimezone),
    ).to.eq(fieldDatetimeRangeTimezone);
  });

  it('returns the most recent date when fieldDatetimeRangeTimezone is an object', () => {
    const fieldDatetimeRangeTimezone = {
      value: 1642014000,
      endValue: 1642017600,
    };

    expect(
      liquid.filters.deriveMostRecentDate(fieldDatetimeRangeTimezone),
    ).to.deep.eq(fieldDatetimeRangeTimezone);
  });

  it('returns the most recent date when fieldDatetimeRangeTimezone is an array of 1', () => {
    const fieldDatetimeRangeTimezone = [
      { value: 1642014000, endValue: 1642017600 },
    ];

    expect(
      liquid.filters.deriveMostRecentDate(fieldDatetimeRangeTimezone),
    ).to.deep.eq(fieldDatetimeRangeTimezone[0]);
  });

  it('returns the most recent date when fieldDatetimeRangeTimezone is an array of 2 or more + there are only past dates', () => {
    const now = 1642030600;
    const fieldDatetimeRangeTimezone = [
      { value: 1642014000, endValue: 1642017600 },
      { value: 1642017000, endValue: 1642020600 },
      { value: 1642025600, endValue: 1642029600 },
    ];

    expect(
      liquid.filters.deriveMostRecentDate(fieldDatetimeRangeTimezone, now),
    ).to.deep.eq({ value: 1642025600, endValue: 1642029600 });
  });

  it('returns the most recent date when fieldDatetimeRangeTimezone is an array of 2 or more + there are past and future dates', () => {
    const now = 1642019600;
    const fieldDatetimeRangeTimezone = [
      { value: 1642014000, endValue: 1642017600 },
      { value: 1642017000, endValue: 1642020600 },
      { value: 1642025600, endValue: 1642029600 },
    ];

    expect(
      liquid.filters.deriveMostRecentDate(fieldDatetimeRangeTimezone, now),
    ).to.deep.eq({ value: 1642017000, endValue: 1642020600 });
  });

  it('returns the most recent date when fieldDatetimeRangeTimezone is an array of 2 or more + there are only future dates', () => {
    const now = 1642014000;
    const fieldDatetimeRangeTimezone = [
      { value: 1642014000, endValue: 1642017600 },
      { value: 1642017000, endValue: 1642020600 },
      { value: 1642025600, endValue: 1642029600 },
    ];

    expect(
      liquid.filters.deriveMostRecentDate(fieldDatetimeRangeTimezone, now),
    ).to.deep.eq({ value: 1642014000, endValue: 1642017600 });
  });
});

describe('serviceLocationsAtFacilityByServiceType', () => {
  const allServicesAtFacility =
    healthCareRegionNonClinicalServicesData.reverseFieldRegionPageNode
      .entities[0].reverseFieldFacilityLocationNode.entities;

  const expected = {
    entityId: '41817',
    fieldServiceNameAndDescripti: {
      entity: {
        entityId: '1027',
        entityLabel: 'Billing and insurance',
        name: 'Billing and insurance',
      },
      targetId: 1027,
    },
    fieldServiceLocation: [
      {
        entity: {
          status: true,
          fieldAdditionalHoursInfo: null,
          fieldEmailContacts: [],
          fieldOfficeHours: {
            value: [
              ['Mon', '9:00 a.m. to 5:00 p.m. ET'],
              ['Tue', '9:00 a.m. to 5:00 p.m. ET'],
              ['Wed', '9:00 a.m. to 5:00 p.m. ET'],
              ['Thu', '9:00 a.m. to 5:00 p.m. ET'],
              ['Fri', '9:00 a.m. to 5:00 p.m. ET'],
              ['Sat', 'Closed'],
              ['Sun', 'Closed'],
            ],
          },
          fieldHours: '2',
          fieldPhone: [],
          fieldUseMainFacilityPhone: true,
          fieldServiceLocationAddress: {
            entity: {
              fieldUseFacilityAddress: true,
              fieldBuildingNameNumber: 'Building 1',
              fieldClinicName: 'Anchorage A',
              fieldWingFloorOrRoomNumber: 'Floor 3',
              fieldAddress: {
                addressLine1: '',
                addressLine2: '',
                postalCode: '',
                locality: '',
                administrativeArea: '',
              },
            },
          },
        },
      },
    ],
  };

  it('returns an empty array if serviceType argument is not passed', () => {
    const serviceLocations = liquid.filters.serviceLocationsAtFacilityByServiceType(
      allServicesAtFacility,
    );
    expect(serviceLocations).to.eql([]);
  });

  it('returns an empty array if passed data array contains malformed objects', () => {
    const malformedLocationsArray = [
      {
        badProperty1: 'badValue1a',
        badProperty2: 'badValue2a',
      },
      {
        badProperty1: 'badValue1b',
        badProperty2: 'badValue2b',
      },
    ];
    const serviceLocations = liquid.filters.serviceLocationsAtFacilityByServiceType(
      malformedLocationsArray,
      'Billing and insurance',
    );
    expect(serviceLocations).to.eql([]);
  });

  it('returns service location data only for service locations of type serviceType', () => {
    const serviceLocationsBillingAndInsurance = liquid.filters.serviceLocationsAtFacilityByServiceType(
      allServicesAtFacility,
      'Billing and insurance',
    );
    expect(serviceLocationsBillingAndInsurance.length).to.equal(1);
    expect(serviceLocationsBillingAndInsurance[0]).to.deep.equal(
      expected.fieldServiceLocation[0],
    );

    const serviceLocationsMedicalRecords = liquid.filters.serviceLocationsAtFacilityByServiceType(
      allServicesAtFacility,
      'Medical records',
    );
    expect(serviceLocationsMedicalRecords.length).to.equal(1);
    expect(serviceLocationsMedicalRecords).to.deep.not.equal(
      expected.fieldServiceLocation[0],
    );

    const serviceLocationsRegisterForCare = liquid.filters.serviceLocationsAtFacilityByServiceType(
      allServicesAtFacility,
      'Register for care',
    );
    expect(serviceLocationsRegisterForCare.length).to.equal(1);
    expect(serviceLocationsRegisterForCare).to.deep.not.equal(
      expected.fieldServiceLocation[0],
    );

    const serviceLocationsDummy = liquid.filters.serviceLocationsAtFacilityByServiceType(
      allServicesAtFacility,
      'Dummy',
    );
    expect(serviceLocationsDummy.length).to.equal(0);
    expect(serviceLocationsDummy).to.deep.not.equal(
      expected.fieldServiceLocation[0],
    );
  });
});
describe('trimAndCamelCase', () => {
  it('returns null if string is null', () => {
    expect(liquid.filters.trimAndCamelCase(null)).to.be.null;
  });

  it('returns null if string is not a string', () => {
    expect(liquid.filters.trimAndCamelCase('a', 123)).to.be.null;
  });

  it('returns vba_string_thing with with trimmed vba_ and camel cased rest', () => {
    expect(
      liquid.filters.trimAndCamelCase('vba_', 'vba_string_thing'),
    ).to.equal('stringThing');
  });
});
describe('processVbaServices', () => {
  const allVbaServices = liquid.filters.processVbaServices(
    [
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_service_member_benefits',
      }),
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_other_services',
      }),
    ],
    [
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_veteran_benefits',
      }),
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_family_member_caregiver_benefits',
      }),
    ],
  );

  expect(allVbaServices.veteranBenefits.length).to.equal(1);
  expect(allVbaServices.familyMemberCaregiverBenefits.length).to.equal(1);
  expect(allVbaServices.serviceMemberBenefits.length).to.equal(1);
  expect(allVbaServices.otherServices.length).to.equal(1);

  const singleVbaService = liquid.filters.processVbaServices(
    [
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_veteran_benefits',
      }),
    ],
    [
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_veteran_benefits',
      }),
    ],
  );
  expect(singleVbaService.veteranBenefits.length).to.equal(1);
  expect(singleVbaService.familyMemberCaregiverBenefits.length).to.equal(0);
  expect(singleVbaService.serviceMemberBenefits.length).to.equal(0);
  expect(singleVbaService.otherServices.length).to.equal(0);

  const hiddenVbaServices = liquid.filters.processVbaServices(
    [
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_service_member_benefits',
      }),
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_service_member_benefits',
        fieldShowForVbaFacilities: false,
      }),
    ],
    [
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_service_member_benefits',
      }),
      vbaRegionFacilityOrOfficeNode({
        fieldVbaTypeOfCare: 'vba_service_member_benefits',
        fieldShowForVbaFacilities: false,
      }),
    ],
  );

  expect(hiddenVbaServices.veteranBenefits.length).to.equal(0);
  expect(hiddenVbaServices.familyMemberCaregiverBenefits.length).to.equal(0);
  expect(hiddenVbaServices.serviceMemberBenefits.length).to.equal(1);
  expect(hiddenVbaServices.serviceMemberBenefits[0]).to.haveOwnProperty(
    'facilityService',
  );
  expect(hiddenVbaServices.serviceMemberBenefits[0]).to.haveOwnProperty(
    'regionalService',
  );
  expect(hiddenVbaServices.otherServices.length).to.equal(0);
});

describe('healthCareRegionNonClinicalServiceLocationsByType', () => {
  const facilitiesInSystem =
    healthCareRegionNonClinicalServicesData.reverseFieldRegionPageNode.entities;

  const billingAndInsuranceServicesFacilities = [
    {
      entityLabel: 'Anchorage VA Medical Center',
      fieldAddress: {
        addressLine1: '1201 North Muldoon Road',
        addressLine2: null,
        postalCode: '99504-6104',
        locality: 'Anchorage',
        administrativeArea: 'AK',
      },
    },
    {
      entityLabel: 'Fairbanks VA Clinic',
      fieldAddress: {
        addressLine1: '4076 Neeley Road, Room 1J-101',
        addressLine2: null,
        postalCode: '99703-1110',
        locality: 'Fort Wainwright',
        administrativeArea: 'AK',
      },
    },
  ];

  it('returns an empty array if serviceType argument is not passed', () => {
    const facilitiesOfferingService = liquid.filters.healthCareRegionNonClinicalServiceLocationsByType(
      facilitiesInSystem,
    );
    expect(facilitiesOfferingService).to.eql([]);
  });

  it('returns an empty array if passed data array contains malformed objects', () => {
    const malformedFacilitiesArray = [
      {
        badProperty1: 'badValue1a',
        badProperty2: 'badValue2a',
      },
      {
        badProperty1: 'badValue1b',
        badProperty2: 'badValue2b',
      },
    ];
    const facilitiesOfferingService = liquid.filters.healthCareRegionNonClinicalServiceLocationsByType(
      malformedFacilitiesArray,
      'Billing and insurance',
    );
    expect(facilitiesOfferingService).to.eql([]);
  });

  it('returns facility data only for facilities offering service of type serviceType', () => {
    const facilitiesOfferingBillingAndInsurance = liquid.filters.healthCareRegionNonClinicalServiceLocationsByType(
      facilitiesInSystem,
      'Billing and insurance',
    );
    // Two facilities offer billing and insurance service
    // dig into this one to ensure labels and addresses match
    expect(facilitiesOfferingBillingAndInsurance.length).to.equal(2);
    expect(facilitiesOfferingBillingAndInsurance[0].entityLabel).to.equal(
      billingAndInsuranceServicesFacilities[0].entityLabel,
    );
    expect(
      facilitiesOfferingBillingAndInsurance[0].fieldAddress.addressLine1,
    ).to.equal(
      billingAndInsuranceServicesFacilities[0].fieldAddress.addressLine1,
    );
    expect(facilitiesOfferingBillingAndInsurance[1].entityLabel).to.equal(
      billingAndInsuranceServicesFacilities[1].entityLabel,
    );
    expect(
      facilitiesOfferingBillingAndInsurance[1].fieldAddress.addressLine1,
    ).to.equal(
      billingAndInsuranceServicesFacilities[1].fieldAddress.addressLine1,
    );

    const facilitiesOfferingMedicalRecords = liquid.filters.healthCareRegionNonClinicalServiceLocationsByType(
      facilitiesInSystem,
      'Medical records',
    );
    expect(facilitiesOfferingMedicalRecords.length).to.equal(2);

    const facilitiesOfferingRegisterForCare = liquid.filters.healthCareRegionNonClinicalServiceLocationsByType(
      facilitiesInSystem,
      'Register for care',
    );
    expect(facilitiesOfferingRegisterForCare.length).to.equal(1);

    const facilitiesOfferingDummy = liquid.filters.healthCareRegionNonClinicalServiceLocationsByType(
      facilitiesInSystem,
      'Dummy',
    );
    expect(facilitiesOfferingDummy.length).to.equal(0);
  });
});

describe('deriveFormattedTimestamp', () => {
  it('returns what we expect', () => {
    const fieldDatetimeRangeTimezone = {
      duration: 60,
      endTime: null,
      endValue: 1641409200,
      rrule: null,
      rruleIndex: null,
      startTime: null,
      timezone: 'America/New_York',
      value: 1641405600,
    };

    expect(
      liquid.filters.deriveFormattedTimestamp(fieldDatetimeRangeTimezone),
    ).to.equal('Wed. Jan. 5, 2022, 1:00 p.m. – 2:00 p.m. ET');
  });
});

describe('getSurvey', () => {
  it('returns correct survey ID for direct URL match in production', () => {
    expect(liquid.filters.getSurvey('vagovprod', '/search')).to.equal(21);
  });

  it('returns correct survey ID for direct URL match in staging', () => {
    expect(
      liquid.filters.getSurvey('vagovstaging', '/contact-us/virtual-agent'),
    ).to.equal(26);
  });

  it('returns correct survey ID for direct URL match in staging', () => {
    expect(
      liquid.filters.getSurvey('vagovstaging', '/school-administrators'),
    ).to.equal(37);
  });

  it('returns default survey ID when no direct URL match is found in production', () => {
    expect(liquid.filters.getSurvey('vagovprod', '/')).to.equal(17);
  });

  it('returns default survey ID when no direct URL match is found in staging', () => {
    expect(liquid.filters.getSurvey('vagovstaging', '/')).to.equal(11);
  });

  it('returns default survey ID when no direct URL match is found in production', () => {
    expect(
      liquid.filters.getSurvey(
        'vagovstaging',
        '/burials-memorials/veterans-burial-allowance',
      ),
    ).to.equal(11);
  });

  it('returns default survey ID when no direct URL match is found in production', () => {
    expect(
      liquid.filters.getSurvey(
        'vagovprod',
        '/burials-memorials/veterans-burial-allowance',
      ),
    ).to.equal(17);
  });

  it('returns correct survey ID for subpath URL match in production', () => {
    expect(
      liquid.filters.getSurvey(
        'vagovprod',
        '/my-health/medical-records/summaries-and-notes/visit-summary/8N73HF67C5CC77FC1D17091606996587',
      ),
    ).to.equal(56);
  });

  it('returns correct survey ID for subpath URL match in staging', () => {
    expect(
      liquid.filters.getSurvey(
        'vagovdev',
        '/my-health/medical-records/summaries-and-notes/visit-summary',
      ),
    ).to.equal(55);
  });

  it('returns correct survey ID for subpath URL match in staging', () => {
    expect(
      liquid.filters.getSurvey(
        'vagovdev',
        '/my-health/medical-records/summaries-and-notes/visit-summary/7A54CF67C5CC77FC1D17091606991561',
      ),
    ).to.equal(55);
  });

  it('returns correct survey ID for subpath URL match in staging', () => {
    expect(
      liquid.filters.getSurvey('vagovstaging', '/health-care/eligibility'),
    ).to.equal(41);
  });

  it('returns correct survey ID for subpath URL match in staging', () => {
    expect(liquid.filters.getSurvey('vagovstaging', '/health-care')).to.equal(
      41,
    );
  });

  it('handles null URL gracefully', () => {
    expect(liquid.filters.getSurvey('vagovprod', null)).to.equal(17);
    expect(liquid.filters.getSurvey('vagovstaging', null)).to.equal(11);
  });

  it('handles undefined URL gracefully', () => {
    expect(liquid.filters.getSurvey('vagovprod', undefined)).to.equal(17);
    expect(liquid.filters.getSurvey('vagovstaging', undefined)).to.equal(11);
  });
});

describe('deriveTimeForJSONLD', () => {
  it('when given a time returns the time in the correct format', () => {
    const timetype = 'starthours';
    const time = '0830';
    const comment = '';

    expect(
      liquid.filters.deriveTimeForJSONLD(time, timetype, comment),
    ).to.equal('08:30:00');
  });

  it('when given a time of null returns the time as an empty string', () => {
    const timetype = 'starthours';
    const time = null;
    const comment = 'Closed';

    expect(
      liquid.filters.deriveTimeForJSONLD(time, timetype, comment),
    ).to.equal('');
  });

  it('when given a comment of 24/7 returns the starthours time in the correct format', () => {
    const timetype = 'starthours';
    const time = null;
    const comment = '24/7';

    expect(
      liquid.filters.deriveTimeForJSONLD(time, timetype, comment),
    ).to.equal('00:00:00');
  });

  it('when given a comment of 24/7 returns the endhours time in the correct format', () => {
    const timetype = 'endhours';
    const time = null;
    const comment = '24/7';

    expect(
      liquid.filters.deriveTimeForJSONLD(time, timetype, comment),
    ).to.equal('23:59:59');
  });
});

describe('officeHoursDataFormat', () => {
  // The function shifts the order of the array so that monday is first the day order is then 1,2,3,4,5,6,0
  const defaultDay = index => {
    return {
      comment: 'Closed',
      day: index === 6 ? 0 : index + 1, // because of the shift
      endhours: null,
      starthours: null,
    };
  };

  it('when given an incomplete week returns a complete week with default days filled in where there were no values', () => {
    const data = vetCenterHoursData.partialWeek;
    for (let i = 0; i < 7; i += 1) {
      // Check every day is equal to default day except for day provided by the data
      if (i !== 1) {
        assert.deepEqual(
          liquid.filters.officeHoursDataFormat(data)[i],
          defaultDay(i),
        );
      }
    }
  });

  it('when given an incomplete week returns a complete week with the given data in the correct place', () => {
    const data = vetCenterHoursData.partialWeek;
    for (let i = 0; i < 7; i += 1) {
      // Day 2 gets shifted back to 1 check if day 2 is in the right space
      if (i === 1) {
        assert.deepEqual(
          liquid.filters.officeHoursDataFormat(data)[i],
          data[0],
        );
      }
    }
  });

  it('when given a complete week returns a complete week with the expected data', () => {
    const data = vetCenterHoursData.completeWeek;
    for (let i = 0; i < 7; i += 1) {
      // Check to see if the new data equals the original data shifted back one
      assert.deepEqual(
        liquid.filters.officeHoursDataFormat(data)[i],
        data[i === 6 ? 0 : i + 1],
      );
    }
  });

  it('when given a partial week always returns a full week', () => {
    const data = vetCenterHoursData.partialWeek;
    expect(liquid.filters.officeHoursDataFormat(data).length, 7);
  });

  it('when given a full week always returns a full week', () => {
    const data = vetCenterHoursData.completeWeek;
    expect(liquid.filters.officeHoursDataFormat(data).length, 7);
  });
});

describe('formatSocialPlatform', () => {
  it('should properly format a twitter platform', () => {
    expect(
      liquid.filters.formatSocialPlatform('Veterans Administration twitter'),
    ).to.equal('Veterans Administration X (formerly Twitter)');
  });

  it('should properly format a youtube platform', () => {
    expect(
      liquid.filters.formatSocialPlatform('Veterans Administration Youtube'),
    ).to.equal('Veterans Administration YouTube');
    expect(
      liquid.filters.formatSocialPlatform('Veterans Administration youtube'),
    ).to.equal('Veterans Administration YouTube');
    expect(
      liquid.filters.formatSocialPlatform('Veterans Administration YOUTUBE'),
    ).to.equal('Veterans Administration YouTube');
  });

  it('should return a non-youtube platform without formatting', () => {
    expect(
      liquid.filters.formatSocialPlatform('Veterans Administration Instagram'),
    ).to.equal('Veterans Administration Instagram');
  });
});

describe('runOrFnConditions', () => {
  it('should return true for the first 3 parameters', () => {
    const testingParams = [true, 'a', 1, true, {}, { a: 1 }];
    expect(liquid.filters.orFn(3, ...testingParams)).to.be.true;
  });
  it('should return false for the first 3 parameters', () => {
    const testingParams = [false, false, false, true, {}, { a: 1 }];
    expect(liquid.filters.orFn(3, ...testingParams)).to.be.false;
  });
  it('should return false for the first n parameters when list is empty', () => {
    const testingParams = [];
    expect(liquid.filters.orFn(3, ...testingParams)).to.be.false;
  });
});

describe('runAndFnConditions', () => {
  it('should return true for the first 3 parameters', () => {
    const testingParams = [true, 'a', 1, true, {}, { a: 1 }];
    expect(liquid.filters.andFn(3, ...testingParams)).to.be.true;
  });
  it('should return false for the first 3 parameters', () => {
    const testingParams = [true, false, false, true, {}, { a: 1 }];
    expect(liquid.filters.andFn(3, ...testingParams)).to.be.false;
  });
  it('should return false for the first n parameters when list is empty', () => {
    const testingParams = [];
    expect(liquid.filters.andFn(3, ...testingParams)).to.be.false;
  });
});

describe('assignHardcodedMetaDescription', () => {
  it('should return the correct description when a matching path is given', () => {
    expect(
      liquid.filters.assignHardcodedMetaDescription(
        '/minneapolis-health-care/policies',
      ),
    ).to.equal(
      'Find VA policies on privacy and patient rights, family rights, visitation, and more.',
    );
  });

  it('should return null if a matching path is not given', () => {
    expect(liquid.filters.assignHardcodedMetaDescription('')).to.be.null;
  });

  it('should return null if a matching path is not given', () => {
    expect(
      liquid.filters.assignHardcodedMetaDescription('/minneapolis-health-care'),
    ).to.be.null;
  });

  it('should return null if a matching path is not given', () => {
    expect(liquid.filters.assignHardcodedMetaDescription(null)).to.be.null;
  });

  it('should return null if a matching path is not given', () => {
    expect(liquid.filters.assignHardcodedMetaDescription(undefined)).to.be.null;
  });

  it('should return null if a matching path is not given', () => {
    expect(liquid.filters.assignHardcodedMetaDescription('/resources')).to.be
      .null;
  });

  it('should return null if a matching path is not given', () => {
    expect(
      liquid.filters.assignHardcodedMetaDescription(
        '/minneapolis-health-care/policies-for-something-else',
      ),
    ).to.be.null;
  });
});
