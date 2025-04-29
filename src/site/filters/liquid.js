// @ts-nocheck
// Node modules.
const _ = require('lodash');
const converter = require('number-to-words');
const he = require('he');
const liquid = require('tinyliquid');
const moment = require('moment-timezone');
// Relative imports.
const phoneNumberArrayToObject = require('./phoneNumberArrayToObject');
const renameKey = require('../../platform/utilities/data/renameKey');
const { SURVEY_NUMBERS, medalliaSurveys } = require('./medalliaSurveysConfig');
const { deriveMostRecentDate, filterUpcomingEvents } = require('./events');

// The default 2-minute timeout is insufficient with high node counts, likely
// because metalsmith runs many tinyliquid engines in parallel.
const TINYLIQUID_TIMEOUT_MINUTES = 20;

function getPath(obj) {
  return obj.path;
}

module.exports = function registerFilters() {
  const { cmsFeatureFlags } = global;

  // Set the tinyliquid timeout. This requires access to the liquid context
  // which is why we're replacing the run() method here.
  const originalRun = liquid.run;
  liquid.run = (astList, context, callback) => {
    // eslint-disable-next-line no-param-reassign
    context.options.timeout = TINYLIQUID_TIMEOUT_MINUTES * 60 * 1000;
    originalRun(astList, context, callback);
  };

  // Custom liquid filter(s)
  liquid.filters.humanizeDate = dt =>
    moment(dt, 'YYYY-MM-DD').format('MMMM D, YYYY');

  liquid.filters.humanizeTimestamp = dt =>
    moment.unix(dt).format('MMMM D, YYYY');

  function prettyTimeFormatted(dt, format) {
    const date = moment.utc(dt).format(format);
    return date.replace(/AM/g, 'a.m.').replace(/PM/g, 'p.m.');
  }

  liquid.filters.timeZone = (dt, tz, format) => {
    if (dt && tz) {
      const timeZoneDate = new Date(dt).toLocaleString('en-US', {
        timeZone: tz,
      });
      return prettyTimeFormatted(timeZoneDate, format);
    }
    return dt;
  };

  liquid.filters.formatVaParagraphs = vaParagraphs => {
    const FIRST_SECTION_HEADER = 'VA account and profile';
    const LAST_SECTION_HEADER = 'Other topics and questions';

    // Derive the first and last sections.
    const firstSection = _.find(
      vaParagraphs,
      vaParagraph =>
        vaParagraph.entity.fieldSectionHeader === FIRST_SECTION_HEADER,
    );
    const lastSection = _.find(
      vaParagraphs,
      vaParagraph =>
        vaParagraph.entity.fieldSectionHeader === LAST_SECTION_HEADER,
    );

    const otherSections = _.filter(
      vaParagraphs,
      vaParagraph =>
        vaParagraph.entity.fieldSectionHeader !== FIRST_SECTION_HEADER &&
        vaParagraph.entity.fieldSectionHeader !== LAST_SECTION_HEADER,
    );

    return [
      firstSection,
      // Other sections is sorted alphabetically by `fieldSectionHeader`.
      ..._.orderBy(otherSections, 'entity.fieldSectionHeader', 'asc'),
      lastSection,
    ];
  };

  // Convert a timezone string (e.g. 'America/Los_Angeles') to an abbreviation
  // e.g. "PST"
  liquid.filters.timezoneAbbrev = (timezone, timestamp) => {
    if (!timezone || !timestamp) {
      return 'ET';
    }
    if (moment.tz.zone(timezone)) {
      return moment.tz.zone(timezone).abbr(timestamp);
    }
    // eslint-disable-next-line no-console
    console.log('Invalid time zone: ', timezone);
    return 'ET';
  };

  liquid.filters.toTitleCase = phrase => {
    if (phrase === null) return null;
    return phrase
      .toString()
      .split(' ')
      .map(_.capitalize)
      .join(' ');
  };

  liquid.filters.formatDate = (dt, format) => prettyTimeFormatted(dt, format);

  liquid.filters.buildTopicList = topics => {
    if (!topics) return null;
    return topics.reduce((topicArray, current) => {
      current.fieldLcCategories.forEach(passedEntity => {
        if (
          !topicArray.some(
            givenEntity => givenEntity.name === passedEntity.entity?.name,
          )
        ) {
          topicArray.push(passedEntity.entity);
        }
      });
      return topicArray;
    }, []);
  };

  liquid.filters.buildTopicsString = topics => {
    if (!topics) return null;
    const fieldTopicIdArray = topics.map(topic => {
      return topic.entity.fieldTopicId;
    });
    return fieldTopicIdArray.join(' ');
  };

  liquid.filters.alphabetizeList = items => {
    return _.orderBy(items, [item => item?.name?.toLowerCase()], ['asc']);
  };

  liquid.filters.drupalToVaPath = content => {
    let replaced = content;
    if (content) {
      replaced = content.replace(/href="(.*?)(png|jpg|jpeg|svg|gif)"/g, img =>
        img
          .replace('http://va-gov-cms.lndo.site/sites/default/files', '/img')
          .replace('http://dev.cms.va.gov/sites/default/files', '/img')
          .replace('http://staging.cms.va.gov/sites/default/files', '/img')
          .replace('http://prod.cms.va.gov/sites/default/files', '/img')
          .replace('https://prod.cms.va.gov/sites/default/files', '/img')
          .replace('http://cms.va.gov/sites/default/files', '/img')
          .replace('https://cms.va.gov/sites/default/files', '/img'),
      );

      replaced = replaced.replace(/href="(.*?)(doc|docx|pdf|txt)"/g, file =>
        file
          .replace('http://va-gov-cms.lndo.site/sites/default/files', '/files')
          .replace('http://dev.cms.va.gov/sites/default/files', '/files')
          .replace('http://staging.cms.va.gov/sites/default/files', '/files')
          .replace('http://prod.cms.va.gov/sites/default/files', '/files')
          .replace('https://prod.cms.va.gov/sites/default/files', '/files')
          .replace('http://cms.va.gov/sites/default/files', '/files')
          .replace('https://cms.va.gov/sites/default/files', '/files'),
      );
    }

    return replaced;
  };

  liquid.filters.filterCollapsibleHeaderLevels = id => {
    const targetH3IDs = [
      '111299',
      '112708',
      '112719',
      '112728',
      '112732',
      '113302',
      '113309',
      '113323',
      '113332',
      '7153',
      '37238',
      '5697',
      '101671',
    ];
    const targetH5IDs = ['112021'];

    if (targetH3IDs.includes(id)) {
      return 'h3';
    }
    if (targetH5IDs.includes(id)) {
      return 'h5';
    }
    return 'h4';
  };

  liquid.filters.dateFromUnix = (dt, format, tz = 'America/New_York') => {
    if (!dt) {
      return null;
    }

    let timezone = tz;

    // TODO: figure out why this happens so frequently!
    if (typeof tz !== 'string' || !tz.length) {
      timezone = 'America/New_York';
    } else if (!moment.tz.zone(tz)) {
      // eslint-disable-next-line no-console
      console.warn(
        'Invalid timezone passed to dateFromUnix filter. Using default instead.',
      );
      timezone = 'America/New_York';
    }

    return moment
      .unix(dt)
      .tz(timezone)
      .format(format)
      .replace(/AM/g, 'a.m.')
      .replace(/PM/g, 'p.m.');
  };

  liquid.filters.currentTimeInSeconds = () => {
    const time = new Date();
    return Math.floor(time.getTime() / 1000);
  };

  liquid.filters.numToWord = numConvert => converter.toWords(numConvert);

  liquid.filters.jsonToObj = jsonString => JSON.parse(jsonString);

  liquid.filters.genericModulo = (i, n) => i % n;

  liquid.filters.removeUnderscores = data =>
    data && data.length ? data.replace('_', ' ') : data;

  liquid.filters.fileSize = data => {
    if (data < 10000) {
      return `${(data / 1000).toFixed(2)}KB`;
    }

    return `${(data / 1000000).toFixed(2)}MB`;
  };

  liquid.filters.fileExt = data => {
    if (!data) return null;
    return data
      .toString()
      .split('.')
      .slice(-1)
      .pop();
  };

  liquid.filters.fileDisplayName = data => {
    if (!data) return null;

    const match = data.toString().match(/[^/]+$/);

    if (match && match.length) {
      return data.toString().match(/[^/]+$/)[0] || data.toString();
    }

    return data.toString();
  };

  liquid.filters.breakIntoSingles = data => {
    let output = '';
    if (data != null) {
      output = `data-${data} `;
    }
    return output;
  };

  liquid.filters.videoThumbnail = data => {
    const string = data.split('v=')[1];
    return `https://img.youtube.com/vi/${string}/sddefault.jpg`;
  };

  liquid.filters.phoneLinks = data => {
    // Change phone to tap to dial.
    const replacePattern = /\(?(\d{3})\)?[- ]*(\d{3})[- ]*(\d{4}),?(?: ?x\.? ?(\d*)| ?ext\.? ?(\d*))?(?!([^<]*>)|(((?!<v?a).)*<\/v?a.*>))/gi;

    if (!data?.match(replacePattern)) {
      return data;
    }

    return data.replace(
      replacePattern,
      `<va-telephone contact="$1-$2-$3" extension="$4$5"></va-telephone>`,
    );
  };

  /**
   * @param {string} phoneNumber a string of a phone number, can be a short number or a long number, however a short number or a number with alphabetic characters will generate a <a> tag instead of a <va-telephone> tag
   * @param {string} attributes a string of attributes like "not-clickable" or "tty" or "sms" or some combination space separated
   * @returns string of html that is either a <va-telephone> tag or an <a> tag
   */
  liquid.filters.processPhoneToVaTelephoneOrFallback = (
    phoneNumber = '',
    attributes = '',
    describedBy = '',
  ) => {
    const internationalPattern = /\(?(\+1)\)?[- ]?/gi;

    if (!phoneNumber) {
      return null;
    }

    const separated = liquid.filters.separatePhoneNumberExtension(phoneNumber);
    // if you pass in a phone number that has alphabetic characters in it, va-telephone will not render it
    // so fallback to just rendering the phone number as passed in as text

    return separated.processed
      ? `<va-telephone contact="${separated.phoneNumber}"${
          separated.extension ? ` extension="${separated.extension}"` : ''
        }${attributes ? ` ${attributes}` : ''}${
          describedBy ? ` message-aria-describedby="${describedBy}"` : ''
        }${
          phoneNumber.match(internationalPattern) ? ` international` : ''
        }></va-telephone>`
      : `<a href="tel:+1${phoneNumber}">${phoneNumber}</a>`;
  };
  liquid.filters.separatePhoneNumberExtension = phoneNumber => {
    if (!phoneNumber) {
      return null;
    }
    const phoneRegex = /\(?(\d{3})\)?[- ]*(\d{3})[- ]*(\d{4}),?(?: ?x\.? ?(\d*)| ?ext\.? ?(\d*))?(?!([^<]*>)|(((?!<v?a).)*<\/v?a.*>))/i;
    const match = phoneRegex.exec(phoneNumber);
    if (!match || !match[1] || !match[2] || !match[3]) {
      // Short number or not a normal format
      return { phoneNumber, extension: '', processed: false };
    }
    const phone = `${match[1]}-${match[2]}-${match[3]}`;
    // optional extension matching x1234 (match 4) or ext1234 (match 5)
    const extension = match[4] || match[5] || '';

    return {
      phoneNumber: phone,
      extension,
      processed: true,
    };
  };

  liquid.filters.trackLinks = (html, eventDataString) => {
    // Add calls to "recordEvent" to all links found in html
    const eventData = JSON.parse(eventDataString);
    const replacePattern = /<a(.*)>(.*)<\/a>/g;
    if (html) {
      return html.replace(
        replacePattern,
        `<a onclick='recordEvent(${JSON.stringify({
          ...eventData,
          'alert-box-click-label': '$2',
        })})'$1>$2</a>`,
      );
    }
    return html;
  };

  //  liquid slice filter only works on strings
  liquid.filters.sliceArray = (arr, startIndex, endIndex) => {
    if (!arr) return null;
    return _.slice(arr, startIndex, endIndex);
  };

  liquid.filters.benefitTerms = data => {
    if (data === null) return null;
    let output = 'General benefits information';
    if (data != null) {
      switch (data) {
        case 'general':
          output = 'General benefits information';
          break;
        case 'burial':
          output = 'Burials and memorials';
          break;
        case 'careers':
          output = 'Careers and employment';
          break;
        case 'disability':
          output = 'Disability';
          break;
        case 'education':
          output = 'Education and training';
          break;
        case 'family':
          output = 'Family member benefits';
          break;
        case 'healthcare':
          output = 'Health care';
          break;
        case 'housing':
          output = 'Housing assistance';
          break;
        case 'insurance':
          output = 'Life insurance';
          break;
        case 'pension':
          output = 'Pension';
          break;
        case 'service':
          output = 'Service member benefits';
          break;
        case 'records':
          output = 'Records';
          break;
        default:
          output = 'General benefits information';
          break;
      }
    }
    return output;
  };

  liquid.filters.hashReference = (str, length = 100) => {
    if (!str) return null;
    return str
      .toString()
      .toLowerCase()
      .normalize('NFD') // normalize diacritics
      .replace(/[^-a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, length);
  };

  // We might not need this filter, refactor
  liquid.filters.widgetFacilityDetail = facility => {
    const facilityLocatorApiId = facility.split('_')[1].toUpperCase();
    const id = `vha_${facilityLocatorApiId}`;
    return JSON.stringify(id);
  };

  liquid.filters.sortMainFacility = item =>
    item ? item.sort((a, b) => a.entityId - b.entityId) : undefined;

  // Find the current path in an array of nested link arrays and then return it's depth + it's parent and children
  liquid.filters.findCurrentPathDepth = (linksArray, currentPath) => {
    const getDeepLinks = (path, linkArr) => {
      const deepObj = {};
      for (let a = 0; a < linkArr.length; a += 1) {
        if (linkArr[a].url.path === path) {
          deepObj.depth = 1;
          return deepObj;
        }
        if (linkArr[a].links) {
          for (let b = 0; b < linkArr[a].links.length; b += 1) {
            if (linkArr[a].links[b].url.path === path) {
              deepObj.depth = 2;
              return deepObj;
            }
            if (linkArr[a].links[b].links) {
              for (let c = 0; c < linkArr[a].links[b].links.length; c += 1) {
                if (linkArr[a].links[b].links[c].url.path === path) {
                  deepObj.depth = 3;
                  deepObj.links = linkArr[a].links[b];
                  return deepObj;
                }
                if (linkArr[a].links[b].links[c].links) {
                  for (
                    let d = 0;
                    d < linkArr[a].links[b].links[c].links.length;
                    d += 1
                  ) {
                    if (
                      linkArr[a].links[b].links[c].links[d].url.path === path
                    ) {
                      deepObj.depth = 4;
                      deepObj.links = linkArr[a].links[b].links[c];
                      return deepObj;
                    }
                    if (linkArr[a].links[b].links[c].links[d].links) {
                      for (
                        let e = 0;
                        e < linkArr[a].links[b].links[c].links[d].links.length;
                        e++
                      ) {
                        if (
                          linkArr[a].links[b].links[c].links[d].links[e].url
                            .path === path
                        ) {
                          deepObj.depth = 5;
                          deepObj.links = linkArr[a].links[b].links[c].links[d];
                          return deepObj;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return false;
    };

    return JSON.stringify(getDeepLinks(currentPath, linksArray));
  };

  function setDeepObj(parentTree, depth, link) {
    let d = depth;

    let parent = parentTree[parentTree.length - 2];

    // this is here if the parent item does not have a path and it is only for looks
    if (
      parentTree[parentTree.length - 2] &&
      parentTree[parentTree.length - 2].url.path === ''
    ) {
      parent = parentTree[parentTree.length - 3];
      d -= 1;
    }

    return {
      depth: d,
      parent,
      link,
    };
  }

  function getDepth(array, path) {
    // tells us when we have found the path
    let found = false;
    // tells us the parent
    const parentTree = [];

    let deepObj = {};

    function findLink(arr, depth = 0) {
      if (arr === null) {
        return;
      }

      let d = depth;
      // start depth at 1
      d++;
      for (const link of arr) {
        // push the item into the trail
        parentTree.push(link);

        if (link.url.path === path) {
          // we found the path! set 'found' to true and exit the recursion
          deepObj = setDeepObj(parentTree, d, link);
          found = true;
          break;
        } else if (link.links && link.links.length) {
          // we didn't find it yet
          // if the item has links, look for it within the links of this item (recursively)
          findLink(link.links, d);
          if (found) {
            break;
          }
        }
        // we don't need this parent, get rid of it
        parentTree.pop();
      }
    }

    // start the recursion
    findLink(array);

    // we should have a list of the parents that lead to this path
    return deepObj;
  }

  liquid.filters.findCurrentPathDepthRecursive = (linksArray, currentPath) =>
    JSON.stringify(getDepth(linksArray, currentPath));

  liquid.filters.featureFieldRegionalHealthService = entity => {
    if (entity) {
      return entity.fieldRegionalHealthService
        ? entity.fieldRegionalHealthService.entity
        : null;
    }
    return entity && entity.fieldClinicalHealthServices
      ? entity.fieldClinicalHealthServices[0].entity
      : null;
  };

  liquid.filters.orderFieldLocalHealthCareServices = healthServicesArray => {
    const sortHealthServiceAlphabetically = (a, b) => {
      if (
        a.entity.fieldFacilityLocation.entity.title <
        b.entity.fieldFacilityLocation.entity.title
      ) {
        return -1;
      }
      if (
        a.entity.fieldFacilityLocation.entity.title >
        b.entity.fieldFacilityLocation.entity.title
      ) {
        return 1;
      }

      return 0;
    };

    const services = healthServicesArray.reduce(
      (acc, healthService) => {
        if (!healthService.entity?.fieldFacilityLocation?.entity) {
          return acc;
        }

        const facility = healthService.entity.fieldFacilityLocation.entity;

        if (facility.fieldMainLocation) {
          acc.mainClinics.push(healthService);
        } else if (facility.fieldMobile) {
          acc.mobileClinics.push(healthService);
        } else if (
          facility.fieldFacilityClassification === '7' || // Community Living Centers (CLCs)
          facility.fieldFacilityClassification === '8' // Domiciliary Residential Rehabilitation Treatment Programs (DOMs)
        ) {
          acc.CLCsAndDOMs.push(healthService);
        } else {
          acc.alphaClinics.push(healthService);
        }

        return acc;
      },
      {
        mainClinics: [],
        alphaClinics: [],
        CLCsAndDOMs: [],
        mobileClinics: [],
      },
    );

    return [
      ...services.mainClinics.sort(sortHealthServiceAlphabetically),
      ...services.alphaClinics.sort(sortHealthServiceAlphabetically),
      ...services.CLCsAndDOMs.sort(sortHealthServiceAlphabetically),
      ...services.mobileClinics.sort(sortHealthServiceAlphabetically),
    ];
  };

  liquid.filters.localHealthCareServiceIsMentalHealth = healthServiceName => {
    return healthServiceName.toLowerCase().includes('mental health');
  };

  liquid.filters.accessibleNumber = data => {
    if (data) {
      return data
        .split('')
        .join(' ')
        .replace(/ -/g, '.');
    }
    return null;
  };

  liquid.filters.removeDashes = data => {
    return data?.replace?.(/-/g, '') || null;
  };

  liquid.filters.deriveLastBreadcrumbFromPath = (
    breadcrumbs,
    string,
    currentPath,
    replaceLastItem = false,
  ) => {
    const last = {
      url: { path: currentPath, routed: true },
      text: string,
    };

    if (replaceLastItem) {
      // replace last item in breadcrumbs with "last"
      breadcrumbs.splice(breadcrumbs.length - 1, 1, last);
    } else {
      breadcrumbs.push(last);
    }

    return breadcrumbs;
  };

  liquid.filters.deriveLcBreadcrumbs = breadcrumbs => {
    // Remove any resources crumb - we don't want the drupal page title.
    const filteredCrumbs = breadcrumbs.filter(
      crumb => crumb.url.path !== '/resources',
    );

    const firstBreadcrumbIsHome =
      breadcrumbs?.[0].text.toLowerCase() === 'home';

    if (firstBreadcrumbIsHome) {
      // Add the resources crumb with the correct crumb title after "home"
      filteredCrumbs.splice(1, 0, {
        url: { path: '/resources', routed: false },
        text: 'Resources and support',
      });
    }

    return filteredCrumbs;
  };

  liquid.filters.formatForBreadcrumbs = (
    breadcrumbs,
    currentTitle,
    currentPath,
    hideHome,
    customHomeText,
  ) => {
    // return early if no breadcrumbs
    if (!breadcrumbs) return '';

    // Remove "empty path" breadcrumbs
    const filteredCrumbs = breadcrumbs.filter(
      ({ url: { path } }) => path !== '' && path !== null,
    );

    // Add current title and path to end of breadcrumbs array
    if (currentPath) {
      filteredCrumbs.push({
        url: { path: currentPath, routed: false },
        text: currentTitle,
      });
    }

    // Remove duplicate paths and handle custom home text
    const pathsFound = [];
    const reducedCrumbs = filteredCrumbs.reduce((acc, crumb) => {
      // Check if we've seen this path before (skip if it is a duplicate)
      if (pathsFound.indexOf(crumb.url.path) === -1) {
        // Make a copy of the crumb so we can safely alter it (eslint thing)
        const crumbClone = { ...crumb };

        // If this crumb points towards the home page and there is custom home text
        // then apply the custom home text
        if (crumb.url.path === '/' && !hideHome && customHomeText) {
          crumbClone.text = customHomeText;
        }

        pathsFound.push(crumb.url.path);
        acc.push(crumbClone);
      }

      return acc;
    }, []);

    // Re-map path and text to href and label, add lang
    const newBC = reducedCrumbs.map(({ url: { path }, text }) => {
      // Set language to Spanish if "-esp" is at the end of the url,
      // or Tagalog if "-tag" is at the end of the url
      let lang = 'en-US';
      if (path.endsWith('-esp')) lang = 'es';
      if (path.endsWith('-tag')) lang = 'tl';

      return {
        href: path,
        isRouterLink: false,
        label: text,
        lang,
      };
    });

    // Run JSON.stringify twice in order to make Liquid engine happy
    return JSON.stringify(JSON.stringify(newBC));
  };

  liquid.filters.formatForBreadcrumbsHTML = breadcrumbs => {
    // return early if no breadcrumbs
    if (!breadcrumbs) return '';

    // Remove "empty path" breadcrumbs
    const filteredCrumbs = breadcrumbs.filter(
      ({ path }) => path !== '' && path !== null,
    );

    // Add "Home" path since it's not included by default
    filteredCrumbs.unshift({
      path: '',
      name: 'VA.gov home',
    });

    const mappedCrumbs = filteredCrumbs.map(crumb => {
      const {
        path,
        children,
      } = /** @type {{path: string, children: array}} */ (crumb);
      let { name } = /** @type {{name: string}} */ (crumb);

      // // Replace hyphens in the name with spaces
      // name = name.replace('-', ' '); // commenting this out to ensure proper functionality

      // Capitalize the first letter of the name
      name = name.charAt(0).toUpperCase() + name.slice(1);

      const { display_title: displayTitle, title } =
        (children && children[0]?.file) ?? {};
      // Assigns the first non-null value, defaulting back to the original name
      const label = displayTitle || title || name;

      // Set language to Spanish if "-esp" is at the end of the url,
      // or Tagalog if "-tag" is at the end of the url
      let lang = 'en-US';
      if (path.endsWith('-esp')) lang = 'es';
      if (path.endsWith('-tag')) lang = 'tl';

      return {
        href: `/${path}`,
        isRouterLink: false,
        label,
        lang,
      };
    });

    return JSON.stringify(JSON.stringify(mappedCrumbs));
  };

  // used to get a base url path of a health care region from entityUrl.path
  liquid.filters.regionBasePath = path => path.split('/')[1];

  liquid.filters.isPage = (path, page) => path.includes(page);

  // check is this is a root level page
  liquid.filters.isRootPage = path => {
    const isFacilityRoot = /^(?:\/pittsburgh-health-care)+$|^(?:\/pittsburgh-health-care)\/((?!stories|events|locations|press-releases|health-services|jobs-careers).)*$/;
    const isRoot = /^\/[\w-]+$/;
    return isRoot.test(path) || isFacilityRoot.test(path);
  };

  // check if this is an about menu page
  liquid.filters.isAboutItem = (menuArray, path) => {
    const outreachPattern = new RegExp('outreach');
    if (outreachPattern.test(path)) {
      return false;
    }
    const paths = _.flatMap(menuArray, getPath);
    const inMenu = _.indexOf(paths, path);
    return inMenu !== -1;
  };

  liquid.filters.detectLang = url => {
    if (url?.endsWith('-esp')) return 'es';
    if (url?.endsWith('-tag')) return 'tl';
    return 'en';
  };

  // sort a list of objects by a certain property in the object
  liquid.filters.sortObjectsBy = (entities, path) => _.sortBy(entities, path);

  // VBA facilities have accordions with headers that can come from two different
  // object keys depending on the type of service (facilityService or regionalService)
  // This sorts alphabetically regardless of key
  liquid.filters.sortObjectsWithConditionalKeys = entities => {
    const getFieldToCompare = obj => {
      let serviceDetails = obj;

      if (obj?.facilityService) {
        serviceDetails = obj.facilityService;
      } else if (obj?.regionalService) {
        serviceDetails = obj.regionalService;
      }

      return serviceDetails.fieldServiceNameAndDescripti.entity.name;
    };

    return entities.sort((a, b) => {
      const name1 = getFieldToCompare(a);
      const name2 = getFieldToCompare(b);

      if (name1 < name2) {
        return -1;
      }

      if (name1 > name2) {
        return 1;
      }

      return 0;
    });
  };

  liquid.filters.getValueFromObjPath = (obj, path) => _.get(obj, path);

  // get a value from a path of an object in an array
  liquid.filters.getValueFromArrayObjPath = (entities, index, path) =>
    _.get(entities[index], path);

  // needed until all environments have the "Health Service API ID" feature flag
  // when this is no longer needed, simply use
  // `serviceTaxonomy.fieldHealthServiceApiId` as the
  // `data-service` prop for the
  // react component `facility-appointment-wait-times-widget`
  // (line 22 in src/site/facilities/facility_health_service.drupal.liquid)
  liquid.filters.healthServiceApiId = serviceTaxonomy =>
    serviceTaxonomy?.fieldHealthServiceApiId;

  // finds if a page is a child of a certain page using the entityUrl attribute
  // returns true or false
  liquid.filters.isChildPageOf = (childPageEntityUrl, parentPage) =>
    !!childPageEntityUrl.breadcrumb.find(
      b => b.text.toLowerCase() === parentPage.toLowerCase(),
    );

  liquid.filters.isLaterThan = (timestamp1, timestamp2) =>
    moment(timestamp1, 'YYYY-MM-DD').isAfter(moment(timestamp2, 'YYYY-MM-DD'));

  liquid.filters.phoneNumberArrayToObject = phoneNumberArrayToObject;

  liquid.filters.sortEntityMetatags = item =>
    item ? item.sort((a, b) => a.key.localeCompare(b.key)) : undefined;

  liquid.filters.createEmbedYouTubeVideoURL = url => {
    if (!url) {
      return url;
    }

    // Not a youtube link? Return back the raw url.
    if (!_.includes(url, 'youtu')) {
      return url;
    }

    try {
      // Recreate the embedded youtube.com URL so we know it's formatted correctly.
      const urlInstance = new URL(url);
      const pathname = urlInstance?.pathname?.replace('/embed', '');

      // Edge case for https://www.youtube.com/watch?v=HlkZeAYmw94.
      if (urlInstance.searchParams?.get?.('v')) {
        return `https://www.youtube.com/embed/${urlInstance.searchParams?.get?.(
          'v',
        )}`;
      }

      return `https://www.youtube.com/embed${pathname}`;
    } catch (error) {
      return url;
    }
  };

  liquid.filters.deriveCLPTotalSections = (
    maxSections,
    fieldClpVideoPanel,
    fieldClpSpotlightPanel,
    fieldClpStoriesPanel,
    fieldClpResourcesPanel,
    fieldClpEventsPanel,
    fieldClpFaqPanel,
    fieldBenefitCategories,
  ) => {
    const removedSectionsCount = [
      fieldClpVideoPanel,
      fieldClpSpotlightPanel,
      fieldClpStoriesPanel,
      fieldClpResourcesPanel,
      fieldClpEventsPanel,
      fieldClpFaqPanel,
      !_.isEmpty(fieldBenefitCategories),
    ].filter(panel => !panel).length;

    return maxSections - removedSectionsCount;
  };

  liquid.filters.formatSeconds = rawSeconds => {
    // Dates need milliseconds, so multiply by 1000.
    const date = new Date(rawSeconds * 1000);

    // Derive digits.
    const hours = date.getUTCHours() || '';
    const minutes = date.getUTCMinutes() || '';
    const seconds = date.getUTCSeconds() || '';

    // Derive if we should say 'hours', 'minutes', or 'seconds' at the end.
    let text = '';
    if (seconds) {
      text = ' seconds';
    }
    if (minutes) {
      text = ' minutes';
    }
    if (hours) {
      text = ' hours';
    }

    const digits = [hours, minutes, seconds].filter(item => item).join(':');

    // Return a formatted timestamp string.
    return `${digits}${text}`;
  };

  liquid.filters.getTagsList = fieldTags => {
    const {
      entity: {
        fieldTopics = [],
        fieldAudienceBeneficiares,
        fieldNonBeneficiares,
      },
    } = fieldTags;

    const topics = fieldTopics.map(topic => ({
      ...topic.entity,
      categoryLabel: 'Topics',
    }));

    let beneficiariesAudiences = [];
    if (
      fieldAudienceBeneficiares &&
      !Array.isArray(fieldAudienceBeneficiares)
    ) {
      beneficiariesAudiences = [fieldAudienceBeneficiares?.entity];
    } else if (fieldAudienceBeneficiares) {
      beneficiariesAudiences = fieldAudienceBeneficiares.map(
        audience => audience?.entity,
      );
    }

    const audiences = [fieldNonBeneficiares?.entity, ...beneficiariesAudiences]
      .filter(tag => !!tag)
      .map(audience => ({
        ...audience,
        categoryLabel: 'Audience',
      }));

    const tagList = [...topics, ...audiences];

    return _.sortBy(tagList, 'name');
  };

  liquid.filters.replace = (string, oldVal, newVal) => {
    if (!string) return null;
    const regex = new RegExp(oldVal, 'g');
    return string.replace(regex, newVal);
  };

  liquid.filters.filterBy = (
    data,
    filterBy,
    valueFilter,
    includeNull = false,
  ) => {
    if (!data) return null;
    if (includeNull) {
      return data.filter(
        e => _.get(e, filterBy) === valueFilter || _.get(e, filterBy) === null,
      );
    }
    return data.filter(e => _.get(e, filterBy) === valueFilter);
  };

  // Returns items at filterBy path NOT matching values in valueFilter
  // If valueFilter is a string, it may contain multiple values, separated by |
  // Note that null items are NOT returned.
  liquid.filters.rejectBy = (data, filterBy, valueFilter) => {
    if (!data) return null;
    if (typeof valueFilter === 'string' && valueFilter.includes('|')) {
      const filterArray = valueFilter.split('|');
      return data.filter(e => {
        const targetValue = _.get(e, filterBy);
        return targetValue && !filterArray.includes(targetValue.toString());
      });
    }
    return data.filter(e => {
      const targetValue = _.get(e, filterBy);
      return targetValue && targetValue !== valueFilter;
    });
  };

  /**
    * Converts a string to camel case and removes a prefix
    @param {string} prefix - prefix to be removed - make empty string not to change string
    @param {string} string - string to be converted
  */
  liquid.filters.trimAndCamelCase = (toRemove, string) => {
    if (!string || typeof string !== 'string') return null;
    const trimmedString = string.replace(toRemove, '');
    return _.camelCase(trimmedString);
  };
  /**
   *
   * @param {Object} object Object of arrays
   * @param {Array} array
   * @param {string} keyField key for object e.g. "fieldServiceNameAndDescripti.entity.fieldVbaTypeOfCare"
   * @returns {Object} Object with value inserted into keyField
   */
  function processVbaObjectHelper(object, arrayOfServices, typeOfOffice) {
    if (!object || !typeOfOffice || !Array.isArray(arrayOfServices))
      return object;
    const objectCopy = { ...object };
    const visibleArray = arrayOfServices.filter(
      o => o?.fieldServiceNameAndDescripti?.entity?.fieldShowForVbaFacilities,
    );
    for (const el of visibleArray) {
      const {
        fieldVbaTypeOfCare,
        name,
      } = el.fieldServiceNameAndDescripti.entity;
      const key = liquid.filters.trimAndCamelCase('vba_', fieldVbaTypeOfCare);

      const indexOfFacilityService =
        typeOfOffice === 'regionalService'
          ? object[key].findIndex(
              service =>
                service.facilityService?.fieldServiceNameAndDescripti.entity
                  .name === name,
            )
          : -1;
      if (indexOfFacilityService !== -1) {
        objectCopy[key][indexOfFacilityService][typeOfOffice] = el;
      } else {
        objectCopy[key].push({
          [typeOfOffice]: el,
        });
      }
    }
    return objectCopy;
  }
  liquid.filters.processVbaServices = (serviceRegions, offices) => {
    const hasServiceRegions =
      Array.isArray(serviceRegions) && serviceRegions.length !== 0;
    const hasOffices = Array.isArray(offices) && offices.length !== 0;
    let accordions = {
      veteranBenefits: [],
      familyMemberCaregiverBenefits: [],
      serviceMemberBenefits: [],
      otherServices: [],
    };
    if (hasOffices) {
      accordions = processVbaObjectHelper(
        accordions,
        offices,
        'facilityService',
      );
    }
    if (hasServiceRegions) {
      accordions = processVbaObjectHelper(
        accordions,
        serviceRegions,
        'regionalService',
      );
    }
    return accordions;
  };
  liquid.filters.shouldShowIconDiv = (
    fieldOfficeVisits,
    fieldVirtualSupport,
    fieldReferralRequired,
  ) => {
    if (
      (fieldOfficeVisits &&
        fieldOfficeVisits !== 'no' &&
        fieldOfficeVisits !== 'null') ||
      (fieldVirtualSupport &&
        fieldVirtualSupport !== 'no' &&
        fieldVirtualSupport !== 'null') ||
      (fieldReferralRequired &&
        fieldReferralRequired !== 'not_applicable' &&
        fieldReferralRequired !== 'unknown' &&
        fieldReferralRequired !== '2')
    ) {
      return true;
    }
    return false;
  };

  liquid.filters.processCentralizedUpdatesVBA = fieldCcGetUpdatesFromVba => {
    if (!fieldCcGetUpdatesFromVba || !fieldCcGetUpdatesFromVba.fetched)
      return null;

    const processed = {
      links: {},
      sectionHeader: '',
    };
    const { fetched } = fieldCcGetUpdatesFromVba;
    processed.sectionHeader = fetched.fieldSectionHeader?.[0]?.value || '';
    for (const link of fetched.fieldLinks) {
      if (link.url.path.startsWith('/')) {
        processed.links.news = {
          title: link.title,
          uri: link.url.path,
        };
      } else {
        // may throw if we get something that's not a URL in the data
        const url = new URL(link.url.path);
        const hostnameParts = url.hostname.split('.');
        // just retrieving the domain part i.e. facebook/flickr/twitter
        processed.links[hostnameParts.slice(-2, -1)[0]] = {
          title: link.title,
          uri: link.url.path,
        };
      }
    }
    // example:
    // processed = {sectionHeader: "Veteran Benefits Administration", links:{ news: { uri: '', title: '' }, flickr: { uri: '', title: '' } }}
    return processed;
  };

  // Processes the necessary components to display the Centralized Content
  // of Can't Find Benefits. It is not the same as the other centralized content
  // since the url path is necessary
  liquid.filters.processfieldCcCantFindBenefits = field => {
    if (!field || !field.fetched) return null;

    const processed = {
      fieldCta: {},
      fieldSectionHeader: '',
      fieldDescription: '',
    };
    processed.fieldSectionHeader =
      field.fetched.fieldSectionHeader?.[0]?.value || '';

    const ctaEntity = field.fetched.fieldCta[0].entity;
    processed.fieldCta.label = ctaEntity.fieldButtonLabel?.[0]?.value || '';
    processed.fieldCta.link = ctaEntity.fieldButtonLink?.[0]?.url.path || '';

    processed.fieldDescription = field.fetched.fieldDescription?.[0]?.processed;
    return processed;
  };

  liquid.filters.processWysiwygSimple = field => {
    if (!field?.fetched?.fieldWysiwyg?.length) return null;
    return field.fetched.fieldWysiwyg[0]?.value || '';
  };

  liquid.filters.processFieldPhoneNumbersParagraph = fields => {
    if (!fields?.length) return null; // no phone numbers
    // Should only have 1 phone number
    const field = fields[0];
    if (!field.entity) return null; // error in paragraph
    const { entity } = field;
    return {
      label: entity.fieldPhoneLabel,
      contact: entity.fieldPhoneNumber,
      extension: entity.fieldPhoneExtension,
      numberType: entity.fieldPhoneNumberType,
    };
  };

  liquid.filters.processCcFeatured = fieldFeaturedCc => {
    if (!fieldFeaturedCc?.fetched) return null;
    const { fetched } = fieldFeaturedCc;
    return {
      fieldSectionHeader: fetched.fieldSectionHeader[0].value,
      fieldDescription: fetched.fieldDescription[0].value,
      fieldCta: {
        label: fetched.fieldCta[0].entity.fieldButtonLabel[0].value,
        uri: fetched.fieldCta[0].entity.fieldButtonLink[0].url.path,
      },
    };
  };
  // Because an ambiguous array items always provides all the items in the array and the context, exports, etc as well
  // We use the first item as a source of truth for how many elements to assess
  liquid.filters.andFn = (nItems, ...arr) =>
    (arr?.length || -1) >= nItems
      ? arr.slice(0, nItems).every(a => !!a)
      : false;
  liquid.filters.orFn = (nItems, ...arr) =>
    (arr?.length || -1) >= nItems ? arr.slice(0, nItems).some(a => !!a) : false;

  liquid.filters.gt = (a, b) => Number(a) > Number(b);
  liquid.filters.lt = (a, b) => Number(a) < Number(b);
  liquid.filters.gte = (a, b) => Number(a) >= Number(b);
  liquid.filters.processCentralizedContent = (entity, contentType) => {
    if (!entity) return null;

    // Converts all complex key/value pairs in obj to simple strings
    // e.g. key: [{ value: 'foo' }] => key: 'foo'
    // Recursion is used to flatten pairs in entity objects deeper in the data
    const flattenArrayValues = (obj, flattenContentType) => {
      const isEntityArray = a => {
        const uniqKeyValues = a.filter((item, pos) => a.indexOf(item) === pos);
        return uniqKeyValues.length === 1 && uniqKeyValues[0] === 'entity';
      };

      const newObj = {};
      for (const [key] of Object.entries(obj)) {
        if (
          Array.isArray(obj[key]) &&
          obj[key][0]?.value &&
          (Object.keys(obj[key][0]).length === 1 ||
            flattenContentType === 'react_widget')
        ) {
          newObj[key] = obj[key][0].value;
        } else if (
          Array.isArray(obj[key]) &&
          isEntityArray(obj[key].map(objKey => Object.keys(objKey)[0]))
        ) {
          // Recursively flattens nested entity arrays
          newObj[key] = obj[key].map(nestedObj => {
            return { entity: flattenArrayValues(nestedObj.entity) };
          });
        } else {
          newObj[key] = obj[key];
        }
      }
      return newObj;
    };

    // TODO - add more cases as new centralized content types are added
    switch (contentType) {
      case 'wysiwyg': {
        // handle normalized data format
        if (entity.fieldWysiwyg) {
          return entity;
        }
        return {
          fieldWysiwyg: {
            // eslint-disable-next-line camelcase
            processed: entity?.field_wysiwyg[0]?.processed,
          },
        };
      }
      case 'q_a_section': {
        return {
          ...flattenArrayValues(entity),
          fieldQuestions: entity.fieldQuestions?.map(q => {
            if (q.entity.targetId && !q.entity.entityId) {
              renameKey(q.entity, 'targetId', 'entityId');
            }
            return {
              entity: flattenArrayValues(q.entity),
            };
          }),
        };
      }
      case 'list_of_link_teasers': {
        return {
          ...flattenArrayValues(entity),
          fieldVaParagraphs: entity.fieldVaParagraphs.map(p => {
            if (p.entity.targetId && !p.entity.entityId) {
              renameKey(p.entity, 'targetId', 'entityId');
            }
            return {
              entity: {
                ...flattenArrayValues(p.entity),
                fieldLink: p.entity.fieldLink[0],
              },
            };
          }),
        };
      }
      case 'react_widget': {
        const normalizedData = flattenArrayValues(entity, 'react_widget');
        if (!normalizedData.fieldErrorMessage.value) {
          return {
            ...normalizedData,
            fieldErrorMessage: {
              value: normalizedData.fieldErrorMessage,
            },
          };
        }
        return normalizedData;
      }
      default: {
        return entity;
      }
    }
  };

  liquid.filters.concat = (...args) => _.concat(...args);

  liquid.filters.strip = (string = '') => _.trim(string);

  liquid.filters.encode = (string = '') => {
    // Escape early in case of string being `null`.
    if (!string) {
      return '';
    }

    // Encode the string.
    return he.encode(string, { useNamedReferences: true });
  };

  // fieldCcBenefitsHotline is odd because it has no entity
  liquid.filters.processCentralizedBenefitsHotline = fieldCcBenefitsHotline => {
    if (!fieldCcBenefitsHotline || !fieldCcBenefitsHotline.fetched) {
      return null;
    }
    const processedFetched = {};
    for (const [key, value] of Object.entries(fieldCcBenefitsHotline.fetched)) {
      if (value?.length > 0) {
        processedFetched[key] = value[0]?.value || '';
      }
    }
    return processedFetched;
  };
  liquid.filters.shimNonFetchedFeaturedToFetchedFeaturedContent = featuredContentEntity => {
    if (
      !featuredContentEntity ||
      !featuredContentEntity.fieldDescription ||
      !featuredContentEntity.fieldSectionHeader
    ) {
      return null;
    }
    const {
      fieldDescription,
      fieldSectionHeader,
      fieldCta,
    } = featuredContentEntity;
    const updatedCta = [];
    if (
      fieldCta?.entity?.fieldButtonLink &&
      fieldCta?.entity?.fieldButtonLabel
    ) {
      updatedCta.push({
        entity: {
          fieldButtonLabel: [{ value: fieldCta.entity.fieldButtonLabel }],
          fieldButtonLink: [fieldCta.entity.fieldButtonLink],
        },
      });
    }
    const fetched = {
      fieldDescription: [fieldDescription],
      fieldSectionHeader: [{ value: fieldSectionHeader }],
      fieldCta: updatedCta,
    };
    return { fetched };
  };
  // fieldCcVetCenterFeaturedCon data structure is different
  // from objects inside fieldVetCenterFeatureContent. Recreates the array
  // with the expected structure so that it can be directly passed inside the template
  liquid.filters.appendCentralizedFeaturedContent = (
    ccFeatureContent,
    featureContentArray,
    placement = 'prepend',
  ) => {
    if (!ccFeatureContent || !ccFeatureContent.fetched) {
      return featureContentArray;
    }
    const {
      fieldDescription,
      fieldSectionHeader,
      fieldCta,
    } = ccFeatureContent.fetched;

    if (!fieldDescription || !fieldSectionHeader) return featureContentArray;

    const featureContentObj = {
      entity: {
        fieldDescription: {
          processed: fieldDescription[0]?.processed || '',
        },
        fieldSectionHeader: fieldSectionHeader[0]?.value || '',
      },
    };

    if (
      fieldCta.length > 0 &&
      fieldCta[0]?.entity.fieldButtonLink &&
      fieldCta[0]?.entity.fieldButtonLabel
    ) {
      const buttonFeatured = {
        entity: {
          fieldButtonLink: {
            uri: fieldCta[0]?.entity.fieldButtonLink[0]?.uri || '',
            url:
              fieldCta[0]?.entity.fieldButtonLink[0]?.url?.path ||
              fieldCta[0]?.entity.fieldButtonLink[0]?.url ||
              '',
          },
          fieldButtonLabel: fieldCta[0].entity.fieldButtonLabel[0]?.value || '',
        },
      };
      featureContentObj.entity.fieldCta = buttonFeatured;
    }
    return placement === 'append'
      ? [...featureContentArray, featureContentObj] // append -- VBA
      : [featureContentObj, ...featureContentArray]; // prepend -- VetCenter - default
  };

  liquid.filters.filterUpcomingEvents = filterUpcomingEvents;

  //* Sorts event dates (fieldDatetimeRangeTimezone) starting with the most upcoming event.
  //* Also sorts press releases (fieldReleaseDate) from newest to oldest.
  liquid.filters.sortByDateKey = (
    dates,
    dateKey = 'fieldDatetimeRangeTimezone',
    reverse = false,
  ) => {
    if (!dates) return null;
    return dates.sort((a, b) => {
      const start1 = moment(
        liquid.filters.deriveMostRecentDate(a[dateKey]).value,
      );
      const start2 = moment(
        liquid.filters.deriveMostRecentDate(b[dateKey]).value,
      );

      return reverse ? start2 - start1 : start1 - start2;
    });
  };

  //* Filters and Sorts event dates (fieldDatetimeRangeTimezone) starting with the most upcoming event.
  liquid.filters.filterAndSortEvents = data => {
    if (!data) return null;
    const currentTimestamp = moment().unix();

    const filteredEvents = data.filter(event => {
      const occurrenceArray = event.fieldDatetimeRangeTimezone.map(
        occurrence => {
          return occurrence.value;
        },
      );
      const futureOccurrences = occurrenceArray.filter(
        occurrence => occurrence >= currentTimestamp,
      );

      return futureOccurrences.length > 0;
    });

    return liquid.filters.sortByDateKey(
      filteredEvents,
      'fieldDatetimeRangeTimezone',
      false,
    );
  };

  liquid.filters.hasContentAtPath = (rootArray, path) => {
    const hasContent = e => _.get(e, path)?.length > 0;
    return rootArray.some(hasContent);
  };

  liquid.filters.hasCharacterOtherThanSpace = str => {
    if (!str) return false;
    const substring = 'internal:/';
    let newStr;

    if (str.includes(substring)) {
      newStr = str.replace(substring, '');
      return /\S/.test(newStr);
    }
    return /\S/.test(str);
  };

  liquid.filters.formatTitleTag = title => {
    let formattedTitle = _.trim(title);

    // Escape early if no title is provided.
    if (!formattedTitle) {
      return formattedTitle;
    }

    // Decode the title.
    formattedTitle = he.decode(formattedTitle);

    // Ensure every word is capitalized.
    formattedTitle = formattedTitle
      ?.split(' ')
      ?.map(word => _.upperFirst(word))
      ?.join(' ');

    // Ensure every word is capitalized following a hyphen.
    formattedTitle = formattedTitle
      ?.split('-')
      ?.map(word => _.upperFirst(word))
      ?.join('-');

    // Add ' | Veterans Affairs' to the end of the title.
    if (!_.endsWith(_.toLower(formattedTitle), ' | veterans affairs')) {
      formattedTitle = `${formattedTitle} | Veterans Affairs`;
    }

    // Remove ' | | ' and ' |  | ' from the title.
    formattedTitle = formattedTitle?.replace(/\s*\|\s*\|\s*/, ' | ');

    return formattedTitle;
  };

  liquid.filters.isPaginatedPath = path => {
    // Split the paths into sections.
    const pathSections = path?.split('/')?.filter(section => !!section);

    // Derive the last section.
    const lastSection = pathSections?.[pathSections?.length - 1];

    // If the last path section is a number greater than 2, return true.
    return parseInt(lastSection, 10) >= 2;
  };

  liquid.filters.getValuesForPath = (array, path) => {
    if (!array) return null;
    return array.map(e => _.get(e, path));
  };

  liquid.filters.formatPath = path => {
    // Return back what was passed to us if it's falsey.
    if (!path) return path;

    // Return back what was passed to us if it's already a valid URL.
    if (path === '/' || path === '*' || path === '!') {
      return path;
    }

    // Prepare to format the path.
    let formattedPath = path;

    // Replace !some/path/ with !/some/path/.
    if (formattedPath?.startsWith('!') && !formattedPath?.startsWith('!/')) {
      formattedPath = `!/${formattedPath.substring(1)}`;
    }

    // Replace *some/path/ with */some/path/.
    if (formattedPath?.startsWith('*') && !formattedPath?.startsWith('*/')) {
      formattedPath = `*/${formattedPath.substring(1)}`;
    }

    // Ensure path starts with a leading slash.
    if (
      !formattedPath?.startsWith('/') &&
      !formattedPath?.startsWith('*') &&
      !formattedPath?.startsWith('!')
    ) {
      formattedPath = `/${formattedPath}`;
    }

    // Ensure path ends with a trailing slash.
    if (!formattedPath?.endsWith('/')) {
      formattedPath = `${formattedPath}/`;
    }
    return formattedPath;
  };

  liquid.filters.isBannerVisible = (targetPaths, currentPath) => {
    // The banner is not visible if the target paths or the current path are missing.
    if (!targetPaths || !currentPath) {
      return false;
    }

    // Format the current path.
    const formattedCurrentPath = liquid.filters.formatPath(currentPath);

    // Format the targets paths
    const formattedTargetPaths = targetPaths.map(liquid.filters.formatPath);

    // Derive exception paths.
    const exceptionPaths = formattedTargetPaths
      ?.filter(path => path?.startsWith('!'))
      ?.map(path => {
        // Replace the first ! operator.
        return path?.replace('!', '');
      });

    // The banner is not visible if it's an exact exception match.
    if (exceptionPaths?.includes(formattedCurrentPath)) {
      return false;
    }

    // Derive exception catch-all paths.
    const exceptionCatchAllPaths = exceptionPaths
      ?.filter(exceptionPath => exceptionPath?.includes('*'))
      ?.map(exceptionPath => exceptionPath.replace(/\*\/?$/gm, ''));

    // Derive if this page is under a catch-all exception path.
    const isExceptionCatchAllPath = exceptionCatchAllPaths?.some(
      exceptionPath =>
        formattedCurrentPath?.startsWith(exceptionPath) &&
        formattedCurrentPath !== exceptionPath,
    );

    // If it is an exception catch-all path, the banner is not visible.
    if (isExceptionCatchAllPath) {
      return false;
    }

    // If it's an exact match and not an exception, the banner is visible.
    if (formattedTargetPaths?.includes(formattedCurrentPath)) {
      return true;
    }

    // Derive catch-all paths.
    const catchAllTargetPaths = formattedTargetPaths
      ?.filter(path => path?.includes('*') && !path?.startsWith('!'))
      ?.map(catchAllPath => catchAllPath.replace(/\*\/?$/gm, ''));

    // Derive if this page is under a catch-all target path.
    const isCatchAllPath = catchAllTargetPaths?.some(
      catchAllPath =>
        formattedCurrentPath?.startsWith(catchAllPath) &&
        formattedCurrentPath !== catchAllPath,
    );

    // If it is a catch-all path and not an exception, the banner is visible.
    if (isCatchAllPath) {
      return true;
    }

    // The banner is not visible by default.
    return false;
  };

  liquid.filters.deriveVisibleBanners = (banners, currentPath) => {
    const MAX_VISIBLE_BANNERS_PER_PAGE = 3;

    // If there are no banners, return an empty array.
    if (_.isEmpty(banners)) return [];

    // If there are no current path, return an empty array.
    if (!currentPath) return [];

    // Populate our list of visible banners.
    const visibleBanners = [];
    for (let index = 0; index < banners.length; index++) {
      // Derive the banner.
      const banner = banners[index];

      // Derive if the banner is visible.
      const isVisible = liquid.filters.isBannerVisible(
        banner.fieldTargetPaths,
        currentPath,
      );

      // Add the banner to our list if it is visible.
      if (isVisible) {
        visibleBanners.push(banner);
      }

      // If we have MAX_VISIBLE_BANNERS_PER_PAGE banners, break.
      if (visibleBanners.length >= MAX_VISIBLE_BANNERS_PER_PAGE) {
        break;
      }
    }

    // Return the visible banners.
    return visibleBanners;
  };

  liquid.filters.formatAlertType = alertType => {
    switch (alertType?.toLowerCase()) {
      case 'info':
      case 'information':
        return 'info';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  liquid.filters.deriveLanguageTranslation = (lang, whichNode, id) => {
    const language = lang || 'en';

    const languages = {
      es: {
        downloadVaForm: `Descargar el formulario VA ${id}`,
      },
      en: {
        downloadVaForm: `Download VA Form ${id}`,
      },
    };

    return languages[language][whichNode];
  };

  // Recursive function to filter sidebar data per the following rules:
  //  - If menu item's linked entity is published, always show
  //  - If menu item's linked entity is draft, show only on preview
  //  - If menu item's linked entity is archived, never show
  liquid.filters.filterSidebarData = (sidebarData, isPreview = false) => {
    if (!sidebarData?.links || sidebarData?.links?.length === 0) {
      return sidebarData;
    }

    const hasLinkedEntity = link => link?.entity?.linkedEntity;
    const isLinkedEntityPublished = link =>
      link?.entity?.linkedEntity?.entityPublished || false;
    const isLinkedEntityDraft = link =>
      link?.entity?.linkedEntity?.moderationState === 'draft' || false;

    const filteredLinks = sidebarData.links
      .filter(link => {
        // if there's no linked entity, this is a header; it'll have children so keep it
        if (!hasLinkedEntity(link)) {
          return true;
        }

        // if there is a linked entity, keep it only if it should be kept per rules above
        if (
          isLinkedEntityPublished(link) ||
          (isLinkedEntityDraft(link) && isPreview)
        ) {
          return true;
        }

        return false;
      })
      .map(link => {
        // recursively call this function to filter children
        return liquid.filters.filterSidebarData(link, isPreview);
      });

    return {
      ...sidebarData,
      links: filteredLinks,
    };
  };

  liquid.filters.topTaskLovellComp = (
    linkType,
    basePath,
    buildtype,
    fieldAdministration,
    fieldVamcEhrSystem,
    fieldRegionPage,
    fieldOffice,
  ) => {
    const isNotProd = buildtype !== 'vagovprod';
    const flag =
      fieldVamcEhrSystem ||
      fieldOffice?.entity?.fieldVamcEhrSystem ||
      fieldRegionPage?.entity?.fieldVamcEhrSystem ||
      '';
    const isPageLovell = fieldAdministration?.entity.entityId === '1039';

    if (flag === 'cerner' || (flag === 'cerner_staged' && isNotProd)) {
      if (linkType === 'make-an-appointment' && isPageLovell) {
        return {
          text: 'MHS Genesis Patient Portal',
          url: 'https://my.mhsgenesis.health.mil/',
        };
      }
    } else if (linkType === 'make-an-appointment') {
      // If we remove this eslint complains of the nested if, so
      // keeping this as a placeholder for future other linktypes for the MHS Genesis site (e.g. Pharmacy)
      return {
        text: 'Make an appointment',
        url: `/${basePath}/make-an-appointment`,
      };
    }
    // fallback as default
    return {
      text: 'Make an appointment',
      url: `/${basePath}/make-an-appointment`,
    };
  };

  liquid.filters.topTaskUrl = (flag, path, buildtype) => {
    const isNotProd = buildtype !== 'vagovprod';

    // If cerner, or if cerner-staged in a non-prod environment
    if (flag === 'cerner' || (flag === 'cerner_staged' && isNotProd)) {
      if (path === 'refill-track-prescriptions/') {
        return 'https://patientportal.myhealth.va.gov/pages/medications/current';
      }

      if (path === 'secure-messaging/') {
        return 'https://patientportal.myhealth.va.gov/pages/messaging/inbox';
      }

      if (path === 'schedule-view-va-appointments/') {
        return 'https://patientportal.myhealth.va.gov/pages/scheduling/upcoming';
      }

      if (path === 'get-medical-records/') {
        return 'https://patientportal.myhealth.va.gov/pages/health_record/clinical_documents/open_notes?pagelet=https%3A%2F%2Fportal.myhealth.va.gov%2Fperson%2F1056308125V679416%2Fhealth-record%2Fopen-notes';
      }

      if (path === 'view-test-and-lab-results/') {
        return 'https://patientportal.myhealth.va.gov/pages/health_record/results';
      }
    }

    // Vista equivalent
    return `/health-care/${path}`;
  };

  liquid.filters.isVisn8 = visn => {
    if (!visn) return null;
    return visn.split('|')[0].trim() === 'VISN 8';
  };

  liquid.filters.featureAddVaHealthConnectNumber = () => {
    return cmsFeatureFlags?.FEATURE_HEALTH_CONNECT_NUMBER;
  };

  liquid.filters.pathContainsSubstring = (path, searchValue) => {
    if (!path) return null;
    const basePath = liquid.filters.regionBasePath(path);
    return basePath.includes(searchValue);
  };

  liquid.filters.currentTime = () => {
    return moment().unix();
  };

  liquid.filters.deriveMostRecentDate = deriveMostRecentDate;
  liquid.filters.shouldShowIntroText = (introTextType, introTextCustom) => {
    if (introTextType === 'remove_text') {
      return false;
    }
    if (
      introTextType === 'use_default_text' ||
      (introTextType === 'customize_text' && introTextCustom)
    )
      return true;
    // just in case there's a new or data value like "null" that sometimes happens in drupal
    return false;
  };

  // from the matrix of when to show Service Location Appointments header and text
  liquid.filters.shouldShowServiceLocationAppointments = serviceLocation => {
    const {
      fieldVirtualSupport: virtualSupport,
      fieldOfficeVisits: officeVisits,
    } = serviceLocation;
    // Hide? if no selection made for either virtual or office visits
    if (!virtualSupport && !officeVisits) {
      return false;
    }
    // Show if either virtual or office visits is yes_appointment_only
    if (
      virtualSupport === 'yes_appointment_only' ||
      officeVisits === 'yes_appointment_only'
    ) {
      return true;
    }
    if (
      virtualSupport === 'virtual_visits_may_be_available' ||
      officeVisits === 'yes_with_or_without_appointment'
    ) {
      return true;
    }
    return false;
  };

  // Given an array of services provided at a facility,
  // return a flattened array of service locations that
  // offer service of type `serviceType`
  liquid.filters.serviceLocationsAtFacilityByServiceType = (
    allServicesAtFacility,
    serviceType,
  ) => {
    return allServicesAtFacility.reduce((acc, service) => {
      if (
        serviceType === service?.fieldServiceNameAndDescripti?.entity?.name &&
        service?.fieldServiceLocation
      ) {
        return [...acc, ...service.fieldServiceLocation];
      }
      return acc;
    }, []);
  };

  // Given an array of facilities in a region, with each facility array
  // containing an array of services provided at that facility,
  // return an array of normalized facility objects representing
  // only facilities that offer service of type `serviceType`
  liquid.filters.healthCareRegionNonClinicalServiceLocationsByType = (
    facilitiesInRegion,
    serviceType,
  ) => {
    return facilitiesInRegion
      .map(facility => ({
        entityLabel: facility?.entityLabel,
        entityUrl: facility?.entityUrl,
        fieldAddress: facility?.fieldAddress,
        fieldOfficeHours: facility?.fieldOfficeHours,
        fieldPhoneNumber: facility?.fieldPhoneNumber,
        locations: liquid.filters.serviceLocationsAtFacilityByServiceType(
          facility?.reverseFieldFacilityLocationNode?.entities || [],
          serviceType,
        ),
      }))
      .filter(facility => facility.locations.length > 0);
  };

  liquid.filters.deriveFormattedTimestamp = fieldDatetimeRangeTimezone => {
    const startsAtUnix = fieldDatetimeRangeTimezone?.value;
    const endsAtUnix = fieldDatetimeRangeTimezone?.endValue;
    const timezone = fieldDatetimeRangeTimezone?.timezone;

    // Derive starts at and ends at.
    const formattedStartsAt = moment
      .tz(startsAtUnix * 1000, timezone)
      .format('ddd. MMM D, YYYY, h:mm a');
    const formattedEndsAt = moment
      .tz(endsAtUnix * 1000, timezone)
      .format('h:mm a');
    const endsAtTimezone = moment
      .tz(endsAtUnix * 1000, timezone)
      .format('z')
      .replace(/S|D/i, '');

    return `${formattedStartsAt} – ${formattedEndsAt} ${endsAtTimezone}`;
  };

  liquid.filters.organizeSatelliteVetCenters = centers => {
    const { outstations, CAPs } = centers.reduce(
      (acc, center) => {
        if (center.entityBundle === 'vet_center_outstation') {
          acc.outstations.push(center);
        } else if (center.entityBundle === 'vet_center_cap') {
          acc.CAPs.push(center);
        }
        return acc;
      },
      {
        outstations: [],
        CAPs: [],
      },
    );

    return [
      ...liquid.filters.sortObjectsBy(outstations, 'title'),
      ...liquid.filters.sortObjectsBy(CAPs, 'title'),
    ];
  };

  liquid.filters.dynamicVetCenterHoursKey = forloopindex => {
    return `vetCenterHoursKey_${forloopindex}`;
  };

  liquid.filters.getSurvey = (buildtype, url) => {
    const surveyData = medalliaSurveys;
    const defaultStagingSurvey = SURVEY_NUMBERS.DEFAULT_STAGING_SURVEY;
    const defaultProdSurvey = SURVEY_NUMBERS.DEFAULT_PROD_SURVEY;
    const isStaging = ['localhost', 'vagovstaging', 'vagovdev'].includes(
      buildtype,
    );
    const effectiveBuildType = isStaging ? 'staging' : 'production';

    if (typeof url !== 'string' || url === null) {
      return isStaging ? defaultStagingSurvey : defaultProdSurvey;
    }
    // Check if the URL exists in the main custom survey URL object
    if (url in surveyData.urls) {
      const surveyInfo = surveyData.urls[url];
      // Return the survey ID for the effective build type, or the default based on the build type
      return (
        surveyInfo[effectiveBuildType] ||
        (isStaging ? defaultStagingSurvey : defaultProdSurvey)
      );
    }
    // Check if the URL matches any subpaths
    for (const [subpath, surveyInfo] of Object.entries(
      surveyData.urlsWithSubPaths,
    )) {
      if (url.startsWith(subpath)) {
        // Return the survey ID for the effective build type, or the default based on the build type
        return (
          surveyInfo[effectiveBuildType] ||
          (isStaging ? defaultStagingSurvey : defaultProdSurvey)
        );
      }
    }

    // If no URL match is found, return the default survey number based on the build type
    return isStaging ? defaultStagingSurvey : defaultProdSurvey;
  };

  liquid.filters.officeHoursDayFormatter = (day, short = true) => {
    let formattedDay = '';
    switch (day) {
      case 0:
        formattedDay = short ? `Sun` : `Sunday`;
        break;
      case 1:
        formattedDay = short ? `Mon` : 'Monday';
        break;
      case 2:
        formattedDay = short ? `Tue` : 'Tuesday';
        break;
      case 3:
        formattedDay = short ? `Wed` : 'Wednesday';
        break;
      case 4:
        formattedDay = short ? `Thu` : 'Thursday';
        break;
      case 5:
        formattedDay = short ? `Fri` : 'Friday';
        break;
      case 6:
        formattedDay = short ? `Sat` : 'Saturday';
        break;

      default:
        break;
    }
    return formattedDay;
  };

  liquid.filters.officeHoursTimeFormatter = time =>
    moment(time, 'Hmm')
      .format('h:mm a')
      .replace(`am`, `a.m.`)
      .replace(`pm`, `p.m.`);

  liquid.filters.deriveTimeForJSONLD = (time, timetype, comment) => {
    if (comment === '24/7') {
      if (timetype === 'endhours') {
        return '23:59:59';
      }
      if (timetype === 'starthours') {
        return '00:00:00';
      }
    }
    if (time === null || parseInt(time, 10) === -1) {
      return '';
    }
    return moment(time, 'Hmm').format('HH:mm:ss');
  };

  liquid.filters.officeHoursDataFormat = data => {
    const formattedData = [];
    for (let i = 0; i < 7; i++) {
      let day = {
        day: i,
        starthours: null,
        endhours: null,
        comment: 'Closed',
      };
      data.forEach(item => {
        if (item.day === i) {
          day = {
            day: item.day,
            starthours: item.starthours,
            endhours: item.endhours,
            comment: item.comment,
          };
        }
      });
      formattedData.push(day);
    }

    return [
      ...formattedData.filter(a => a.day !== 0),
      ...formattedData.filter(a => a.day === 0),
    ];
  };

  liquid.filters.shouldShowMobileAppPromoBanner = currentPath => {
    const urlsForBanner = [
      '/health-care/refill-track-prescriptions',
      '/health-care/secure-messaging',
      '/health-care/get-medical-records',
      '/disability/view-disability-rating',
      '/claim-or-appeal-status',
      '/disability/upload-supporting-evidence',
      '/records/download-va-letters',
      '/va-payment-history',
      '/change-direct-deposit',
    ];

    return urlsForBanner.includes(currentPath);
  };

  liquid.filters.useTelephoneWebComponent = telephone => {
    if (/[a-zA-Z+]/.test(telephone)) {
      return false;
    }
    return true;
  };

  // In some instances, we get a dynamic hub name from Drupal
  // In order to use a <va-icon>, we need to map the hub name from Drupal
  // to its hub icon in the Design System (https://design.va.gov/foundation/icons)
  // This filter gives us a <va-icon> pointing to the correct hub icon
  //
  // Visual example: /initiatives/vote/ under "Learn more about related VA benefits"
  liquid.filters.getHubIcon = (hub, iconSize, iconClasses = '') => {
    const hubIcons = {
      'health-care': {
        icon: 'medical_services',
        backgroundColor: 'hub-health-care',
      },
      careers: {
        icon: 'work',
        backgroundColor: 'hub-careers',
      },
      'life-insurance': {
        icon: 'shield',
        backgroundColor: 'hub-life-insurance',
      },
      'service-member': {
        icon: 'flag',
        backgroundColor: 'hub-service-member',
      },
      disability: {
        icon: 'description',
        backgroundColor: 'hub-disability',
      },
      pension: {
        icon: 'handshake',
        backgroundColor: 'hub-pension',
      },
      burials: {
        icon: 'star',
        backgroundColor: 'hub-burials',
      },
      'family-member': {
        icon: 'groups',
        backgroundColor: 'hub-family-member',
      },
      education: {
        icon: 'school',
        backgroundColor: 'hub-education',
      },
      housing: {
        icon: 'home',
        backgroundColor: 'hub-housing',
      },
      records: {
        icon: 'identification',
        backgroundColor: 'hub-records',
      },
      'va-dept-info': {
        icon: 'location_city',
        backgroundColor: 'primary-darker',
      },
    };

    if (!hub || !hubIcons[hub]) {
      return null;
    }

    const hubData = hubIcons[hub];

    return `
      <va-icon
        icon="${hubData.icon}"
        size="${iconSize}"
        class="hub-icon vads-u-color--white vads-u-background-color--${hubData.backgroundColor} vads-u-display--flex vads-u-align-items--center vads-u-justify-content--center ${iconClasses}"
      ></va-icon>
    `;
  };

  liquid.filters.formatSocialPlatform = platform => {
    const twitterString = platform.match(/twitter/i);
    const youTubeString = platform.match(/youtube/i);

    if (twitterString) {
      return platform.replace(twitterString, 'X (formerly Twitter)');
    }

    if (youTubeString) {
      return platform.replace(youTubeString, 'YouTube');
    }

    return platform;
  };

  liquid.filters.determineFieldLink = fieldLink => {
    if (!_.isEmpty(fieldLink?.url?.path)) {
      return fieldLink.url.path;
    }
    if (!_.isEmpty(fieldLink?.uri)) {
      return fieldLink.uri;
    }
    return null;
  };

  liquid.filters.assignHardcodedMetaDescription = url => {
    if (!url) {
      return null;
    }

    const META_DESCRIPTIONS = {
      '/policies':
        'Find VA policies on privacy and patient rights, family rights, visitation, and more.',
    };

    for (const [endOfPath, content] of Object.entries(META_DESCRIPTIONS)) {
      if (url?.endsWith(endOfPath)) {
        return content;
      }
    }

    return null;
  };
};
