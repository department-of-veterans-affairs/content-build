// Node modules.
const _ = require('lodash');
const converter = require('number-to-words');
const he = require('he');
const liquid = require('tinyliquid');
const moment = require('moment-timezone');
const set = require('lodash/fp/set');
// Relative imports.
const phoneNumberArrayToObject = require('./phoneNumberArrayToObject');
const renameKey = require('../../platform/utilities/data/renameKey');
const stagingSurveys = require('./medalliaStagingSurveys.json');
const prodSurveys = require('./medalliaProdSurveys.json');

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
    } else {
      // eslint-disable-next-line no-console
      console.log('Invalid time zone: ', timezone);
      return 'ET';
    }
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
    const replacePattern = /\(?(\d{3})\)?[- ]?(\d{3}-\d{4})(?!([^<]*>)|(((?!<a).)*<\/a>))/g;
    if (data) {
      return data.replace(
        replacePattern,
        '<a target="_blank" href="tel:$1-$2">$1-$2</a>',
      );
    }

    return data;
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

  liquid.filters.featureSingleValueFieldLink = fieldLink => {
    if (fieldLink && cmsFeatureFlags.FEATURE_SINGLE_VALUE_FIELD_LINK) {
      return fieldLink[0];
    }

    return fieldLink;
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

  liquid.filters.deriveLcBreadcrumbs = (
    breadcrumbs,
    string,
    currentPath,
    pageTitle,
  ) => {
    // Remove any resources crumb - we don't want the drupal page title.
    const filteredCrumbs = breadcrumbs.filter(
      crumb => crumb.url.path !== '/resources',
    );
    // Add the resources crumb with the correct crumb title.
    filteredCrumbs.push({
      url: { path: '/resources', routed: false },
      text: 'Resources and support',
    });

    if (pageTitle) {
      filteredCrumbs.push({
        url: { path: currentPath, routed: true },
        text: string,
      });
    }

    return filteredCrumbs;
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
    // Dates need milliseconds, so mulitply by 1000.
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

    const audiences = [
      fieldAudienceBeneficiares?.entity,
      fieldNonBeneficiares?.entity,
    ]
      .filter(tag => !!tag)
      .map(audience => ({
        ...audience,
        categoryLabel: 'Audience',
      }));

    const tagList = [...topics, ...audiences];

    return _.sortBy(tagList, 'name');
  };

  liquid.filters.replace = (string, oldVal, newVal) => {
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

  liquid.filters.processCentralizedContent = (entity, contentType) => {
    if (!entity) return null;

    // Converts all complex key/value pairs in obj to simple strings
    // e.g. key: [{ value: 'foo' }] => key: 'foo'
    const flattenArrayValues = obj => {
      const newObj = {};
      for (const [key] of Object.entries(obj)) {
        if (Array.isArray(obj[key]) && obj[key][0]?.value) {
          newObj[key] = obj[key][0].value;
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
        } else {
          return {
            fieldWysiwyg: {
              // eslint-disable-next-line camelcase
              processed: entity?.field_wysiwyg[0]?.processed,
            },
          };
        }
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
        const normalizedData = flattenArrayValues(entity);
        if (!normalizedData.fieldErrorMessage.value) {
          return {
            ...normalizedData,
            fieldErrorMessage: {
              value: normalizedData.fieldErrorMessage,
            },
          };
        } else return normalizedData;
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

  // fieldCcVetCenterFeaturedCon data structure is different
  // from objects inside fieldVetCenterFeatureContent. Recreates the array
  // with the expected structure so that it can be directly passed inside the template
  liquid.filters.appendCentralizedFeaturedContent = (
    ccFeatureContent,
    featureContentArray,
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
          processed: fieldDescription[0]?.processed,
        },
        fieldSectionHeader: fieldSectionHeader[0]?.value,
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
            uri: fieldCta[0]?.entity.fieldButtonLink[0].uri,
          },
          fieldButtonLabel: fieldCta[0].entity.fieldButtonLabel[0].value,
        },
      };
      featureContentObj.entity.fieldCta = buttonFeatured;
    }
    return [featureContentObj, ...featureContentArray];
  };

  liquid.filters.filterPastEvents = data => {
    if (!data) return null;
    const currentTimestamp = new Date().getTime();
    return data.filter(event => {
      const mostRecentEvent = liquid.filters.deriveMostRecentDate(
        event.fieldDatetimeRangeTimezone,
      );
      return mostRecentEvent.value * 1000 < currentTimestamp;
    });
  };

  liquid.filters.filterUpcomingEvents = data => {
    if (!data) return null;
    const currentTimestamp = new Date().getTime();
    return data.filter(event => {
      const mostRecentEvent = liquid.filters.deriveMostRecentDate(
        event.fieldDatetimeRangeTimezone,
      );
      return mostRecentEvent.value * 1000 >= currentTimestamp;
    });
  };

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

  //* paginatePages has limitations, it is not yet fully operational.
  liquid.filters.paginatePages = (page, items, aria) => {
    const perPage = 10;

    const ariaLabel = aria ? ` of ${aria}` : '';

    const paginationPath = pageNum => {
      return pageNum === 0 ? '' : `/page-${pageNum + 1}`;
    };

    const pageReturn = [];

    if (items.length > 0) {
      const pagedEntities = _.chunk(items, perPage);

      for (let pageNum = 0; pageNum < pagedEntities.length; pageNum++) {
        let pagedPage = Object.assign({}, page);
        if (pageNum > 0) {
          pagedPage = set(
            'entityUrl.path',
            `${page.entityUrl.path}${paginationPath(pageNum)}`,
            page,
          );
        }

        pagedPage.pagedItems = pagedEntities[pageNum];
        const innerPages = [];

        if (pagedEntities.length > 0) {
          // add page numbers
          const numPageLinks = 3;
          let start;
          let length;
          if (pagedEntities.length <= numPageLinks) {
            start = 0;
            length = pagedEntities.length;
          } else {
            length = numPageLinks;

            if (pageNum + numPageLinks > pagedEntities.length) {
              start = pagedEntities.length - numPageLinks;
            } else {
              start = pageNum;
            }
          }

          for (let num = start; num < start + length; num++) {
            innerPages.push({
              href:
                num === pageNum
                  ? null
                  : `${page.entityUrl.path}${paginationPath(num)}`,
              label: num + 1,
              class: num === pageNum ? 'va-pagination-active' : '',
            });
          }

          pagedPage.paginator = {
            ariaLabel,
            prev:
              pageNum > 0
                ? `${page.entityUrl.path}${paginationPath(pageNum - 1)}`
                : null,
            inner: innerPages,
            next:
              pageNum < pagedEntities.length - 1
                ? `${page.entityUrl.path}${paginationPath(pageNum + 1)}`
                : null,
          };
          pageReturn.push(pagedPage);
        }
      }
    }

    if (!pageReturn[0]) {
      return {};
    }

    return {
      pagedItems: pageReturn[0].pagedItems,
      paginator: pageReturn[0].paginator,
    };
  };

  liquid.filters.isFirstPage = paginator => {
    return !paginator || paginator.prev === null;
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
    } else return /\S/.test(str);
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
    if (!formattedPath?.endsWith('/') && !formattedPath?.endsWith('*')) {
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

    // Derive exception paths.
    const exceptionPaths = targetPaths
      ?.filter(path => path?.startsWith('!'))
      ?.map(path => {
        // Replace the first ! operator.
        const formattedExceptionPath = path?.replace('!', '');

        // Format the exception path.
        return liquid.filters.formatPath(formattedExceptionPath);
      });

    // The banner is not visible if it's an exact exception match.
    if (exceptionPaths?.includes(formattedCurrentPath)) {
      return false;
    }

    // Derive exception catch-all paths.
    const exceptionCatchAllPaths = exceptionPaths
      ?.filter(exceptionPath => exceptionPath?.includes('*'))
      ?.map(exceptionPath => exceptionPath.replace('*', ''));

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
    if (targetPaths?.includes(formattedCurrentPath)) {
      return true;
    }

    // Derive catch-all paths.
    const catchAllTargetPaths = targetPaths
      ?.filter(path => path?.includes('*') && !path?.startsWith('!'))
      ?.map(catchAllPath => catchAllPath.replace('*', ''));

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

  // Sets the value at path of object. If a portion of path doesn't exist, it's created.
  const setData = (data, path, value) => {
    return _.set(data, path, value);
  };

  // If preview mode, filter facilities to show published and draft facilities.
  // If NOT in preview mode, filter facilities to only show published facilities.
  liquid.filters.filterSidebarData = (sidebarData, isPreview = false) => {
    if (!sidebarData || !sidebarData.links[0]?.links) return null;

    const findLocationsArr = () => {
      const servicesAndLocationsObj = _.find(sidebarData.links[0].links, [
        'label',
        'SERVICES AND LOCATIONS',
      ]);
      if (servicesAndLocationsObj && servicesAndLocationsObj.links) {
        const locationsObj = _.find(servicesAndLocationsObj.links, [
          'label',
          'Locations',
        ]);
        if (locationsObj && locationsObj.links.length) {
          return locationsObj.links;
        } else return null;
      } else return null;
    };

    const locationsArr = findLocationsArr();
    const locationsPath = 'links[0]links[0]links[1]links';

    if (isPreview && locationsArr) {
      const publishedAndDraftFacilities = liquid.filters.rejectBy(
        locationsArr,
        'entity.linkedEntity.moderationState',
        'archived',
      );
      return setData(sidebarData, locationsPath, publishedAndDraftFacilities);
    } else if (!isPreview && locationsArr) {
      const publishedFacilities = liquid.filters.rejectBy(
        locationsArr,
        'entity.linkedEntity.entityPublished',
        false,
      );
      return setData(sidebarData, locationsPath, publishedFacilities);
    } else {
      return sidebarData;
    }
  };

  liquid.filters.topTaskUrl = (flag, path, systemName) => {
    if (flag === 'cerner' && path === 'refill-track-prescriptions/') {
      return 'https://patientportal.myhealth.va.gov/pages/medications/current';
    } else if (flag === 'cerner' && path === 'secure-messaging/') {
      return 'https://patientportal.myhealth.va.gov/pages/messaging/inbox';
    } else if (flag === 'cerner' && path === 'schedule-view-va-appointments/') {
      return 'https://patientportal.myhealth.va.gov/pages/scheduling/upcoming';
    } else if (flag === 'cerner' && path === 'get-medical-records/') {
      return 'https://patientportal.myhealth.va.gov/pages/health_record/clinical_documents/open_notes?pagelet=https%3A%2F%2Fportal.myhealth.va.gov%2Fperson%2F1056308125V679416%2Fhealth-record%2Fopen-notes';
    } else if (flag === 'cerner' && path === 'view-test-and-lab-results/') {
      return 'https://patientportal.myhealth.va.gov/pages/health_record/results';
    } else if (
      flag === 'cerner' ||
      (systemName === 'VA Central Ohio health care' &&
        path === 'schedule-view-va-appointments/')
    ) {
      return 'https://patientportal.myhealth.va.gov';
    } else {
      return `/health-care/${path}`;
    }
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

  liquid.filters.deriveMostRecentDate = (
    fieldDatetimeRangeTimezone,
    now = moment().unix(), // This is done so that we can mock the current time in tests.
  ) => {
    // Escape early if no fieldDatetimeRangeTimezone was passed.
    if (!fieldDatetimeRangeTimezone) return fieldDatetimeRangeTimezone;

    // Return back fieldDatetimeRangeTimezone if it is already a singular most recent date.
    if (!_.isArray(fieldDatetimeRangeTimezone)) {
      return fieldDatetimeRangeTimezone;
    }

    // Return back fieldDatetimeRangeTimezone's first item if it only has 1 item.
    if (fieldDatetimeRangeTimezone?.length === 1) {
      return fieldDatetimeRangeTimezone[0];
    }

    // Derive date times relative to now.
    const dates = _.sortBy(fieldDatetimeRangeTimezone, 'endValue');
    const futureDates = _.filter(dates, date => date?.endValue - now > 0);

    // Return the most recent past date if there are no future dates.
    if (_.isEmpty(futureDates)) {
      return dates[dates?.length - 1];
    }

    // Return the most recent future date if there are future dates.
    return futureDates[0];
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
        fieldAddress: facility?.fieldAddress,
        fieldOfficeHours: facility?.fieldOfficeHours,
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

  liquid.filters.dynamicVetCenterHoursKey = forloopindex => {
    return `vetCenterHoursKey_${forloopindex}`;
  };

  liquid.filters.featureCareWeProvide = () => {
    return cmsFeatureFlags?.FEATURE_CARE_WE_PROVIDE;
  };

  liquid.filters.getSurvey = (buildtype, url) => {
    if (
      buildtype === 'localhost' ||
      buildtype === 'vagovstaging' ||
      buildtype === 'vagovdev'
    ) {
      return stagingSurveys[url] ? stagingSurveys[url] : 11;
    } else if (buildtype === 'vagovprod') {
      return prodSurveys[url] ? prodSurveys[url] : 17;
    }
    return null;
  };

  liquid.filters.officeHoursDayFormatter = day => {
    let formattedDay = '';
    switch (day) {
      case 0:
        formattedDay = `Sun`;
        break;
      case 1:
        formattedDay = `Mon`;
        break;
      case 2:
        formattedDay = `Tue`;
        break;
      case 3:
        formattedDay = `Wed`;
        break;
      case 4:
        formattedDay = `Thu`;
        break;
      case 5:
        formattedDay = `Fri`;
        break;
      case 6:
        formattedDay = `Sat`;
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
};
