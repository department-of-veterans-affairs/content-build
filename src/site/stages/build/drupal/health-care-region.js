/* eslint-disable no-param-reassign, no-continue */

const _ = require('lodash');
const moment = require('moment');
const liquid = require('tinyliquid');
const { logDrupal: log } = require('./utilities-drupal');
const {
  createEntityUrlObj,
  paginatePages,
  updateEntityUrlObj,
  generateBreadCrumbs,
} = require('./page');

/**
 * Sort services.
 *
 * @param sortItem The services array.
 * @return []
 */

// Creates the past-events listing pages
function createPastEventListPages(page, drupalPagePath, files) {
  const sidebar = page.facilitySidebar;
  // Events listing page
  const allEvents = page.pastEvents;

  // store past & current events
  const pastEventTeasers = {
    entities: [],
  };

  // separate current events from past events;
  allEvents.entities.forEach(eventTeaser => {
    const startDate = liquid.filters.deriveMostRecentDate(
      eventTeaser.fieldDatetimeRangeTimezone,
    ).value;

    // Check if the date is in the past
    const startDateUTC = startDate;
    const currentDateUTC = new Date().getTime() / 1000;

    if (startDateUTC < currentDateUTC) {
      pastEventTeasers.entities.push(eventTeaser);
    }
  });

  // sort past events into reverse chronological order by start date
  pastEventTeasers.entities = _.orderBy(
    pastEventTeasers.entities,
    event =>
      liquid.filters.deriveMostRecentDate(event.fieldDatetimeRangeTimezone)
        .value,
    ['desc'],
  );

  // Derive the path + breadcrumbs for past events.
  const pastEventsEntityURL = createEntityUrlObj(drupalPagePath);

  // Derive the data that the event_listing template receives.
  const pastEventsObj = {
    alert: page.alert,
    allEventTeasers: pastEventTeasers,
    entityUrl: pastEventsEntityURL,
    eventTeasers: pastEventTeasers,
    facilitySidebar: sidebar,
    fieldIntroText: page.fieldIntroText,
    outreachSidebar: page.outreachSidebar,
    title: page.title,
  };

  const pastEventsPage = updateEntityUrlObj(
    pastEventsObj,
    drupalPagePath,
    'Past events',
  );
  const pastEventsPagePath = pastEventsPage.entityUrl.path;
  pastEventsPage.regionOrOffice = page.title;
  pastEventsPage.entityUrl = generateBreadCrumbs(pastEventsPagePath);

  paginatePages(
    pastEventsPage,
    files,
    'allEventTeasers',
    'event_listing.drupal.liquid',
    'past-events',
  );
}

/**
 * Compiles fields for event listing pages.
 *
 *  @param {page} page The page object.
 *  @return nothing
 */
function compileEventListingPage(page) {
  // Combine events from reverse entity reference queries, if additional
  // listings data exists and feature flag is on.
  if (page?.reverseFieldAdditionalListingsNode?.entities) {
    page.reverseFieldListingNode.entities.push(
      ...page.reverseFieldAdditionalListingsNode.entities,
    );
  }
  // Compile final template variables.
  page.pastEventTeasers = page.pastEvents;
  page.allEventTeasers = page.reverseFieldListingNode;
}

// Creates the facility pages
function createHealthCareRegionListPages(page, drupalPagePath, files) {
  const sidebar = page.facilitySidebar;

  // Press Release listing page
  const prEntityUrl = createEntityUrlObj(drupalPagePath);
  const prObj = {
    allPressReleaseTeasers: page.allPressReleaseTeasers,
    fieldPressReleaseBlurb: page.fieldPressReleaseBlurb,
    facilitySidebar: sidebar,
    entityUrl: prEntityUrl,
    title: page.title,
    alert: page.alert,
  };
  const prPage = updateEntityUrlObj(prObj, drupalPagePath, 'News Releases');
  const prPath = prPage.entityUrl.path;
  prPage.regionOrOffice = page.title;
  prPage.entityUrl = generateBreadCrumbs(prPath);

  paginatePages(
    prPage,
    files,
    'allPressReleaseTeasers',
    'press_releases_page.drupal.liquid',
    'news releases',
  );

  // News Story listing page
  const nsEntityUrl = createEntityUrlObj(drupalPagePath);
  const nsObj = {
    allNewsStoryTeasers: page.allNewsStoryTeasers,
    newsStoryTeasers: page.newsStoryTeasers,
    facilitySidebar: sidebar,
    entityUrl: nsEntityUrl,
    title: page.title,
    alert: page.alert,
  };
  const nsPage = updateEntityUrlObj(
    nsObj,
    drupalPagePath,
    'Community stories',
    'stories',
  );
  const nsPath = nsPage.entityUrl.path;
  nsPage.regionOrOffice = page.title;
  nsPage.entityUrl = generateBreadCrumbs(nsPath);

  paginatePages(
    nsPage,
    files,
    'allNewsStoryTeasers',
    'news_stories_page.drupal.liquid',
    'news stories',
  );
}

/**
 * Modify the page object to add social links.
 *
 * @param {page} page The page object.
 * @param {pages} pages an array of page of objects containing a region page
 * @return nothing
 */
function addGetUpdatesFields(page, pages) {
  const regionPageUrlPath = page.entityUrl.breadcrumb[1]?.url?.path;
  if (
    !regionPageUrlPath &&
    page.entityUrl.breadcrumb[1]?.text !== 'Manila VA Clinic'
  ) {
    log(
      `WARNING: CMS error while building breadcrumbs: "${page.entityUrl.path}" is missing reference to a parent or grandparent.`,
    );
  }
  // If regionPageUrlPath is empty, this will simply not find a region page, and this function will complete.
  const regionPage = pages.find(p => p.entityUrl.path === regionPageUrlPath);

  if (regionPage) {
    page.fieldLinks = regionPage.fieldLinks;
  }
}

/**
 * Sorts release dates (fieldReleaseDate) from oldest to newest, removing expired items.
 *
 * @param {releaseDates} array The dates array.
 * @param {reverse} bool Sorting order set to default false.
 * @param {stale} bool Remove expired date items set to default false.
 * @return Filtered array of sorted items.
 */
function releaseDateSorter(legacyDates = [], reverse = false, stale = true) {
  let sorted = legacyDates.entities.sort((a, b) => {
    const start1 = moment(a.fieldReleaseDate.value);
    const start2 = moment(b.fieldReleaseDate.value);
    return reverse ? start2 - start1 : start1 - start2;
  });

  if (stale) {
    sorted = sorted.filter(item =>
      moment(item.fieldReleaseDate.value).isAfter(moment()),
    );
  }

  return sorted;
}

/**
 * Sorts event dates (fieldDatetimeRangeTimezone) from oldest to newest, removing expired items.
 *
 * @param {dates} array The dates array.
 * @param {reverse} bool Sorting order set to default false.
 * @param {stale} bool Remove expired date items set to default false.
 * @return Filtered array of sorted items.
 */
function eventDateSorter(dates = [], reverse = false, stale = true) {
  let sorted = dates.entities.sort((a, b) => {
    const start1 = liquid.filters.deriveMostRecentDate(
      a.fieldDatetimeRangeTimezone,
    ).value;
    const start2 = liquid.filters.deriveMostRecentDate(
      b.fieldDatetimeRangeTimezone,
    ).value;
    return reverse ? start2 - start1 : start1 - start2;
  });

  const currentDateUTC = new Date().getTime() / 1000;

  if (stale) {
    sorted = sorted.filter(
      item =>
        liquid.filters.deriveMostRecentDate(item.fieldDatetimeRangeTimezone)
          .value > currentDateUTC,
    );
  }

  return sorted;
}

/**
 * Add pagers to cms content listing pages.
 *
 * @param {page} page The page object.
 * @param {files} files The generated file.
 * @param {field} field The target field.
 * @param {template} template The template for output formatting.
 * @param {files} files The acessibility aria.
 * @return nothing
 */
function addPager(page, files, field, template, aria) {
  // Sort events and remove stale items.
  if (page.allEventTeasers) {
    page.allEventTeasers.entities = eventDateSorter(page.allEventTeasers);
  }

  // Sort news teasers.
  if (page.allPressReleaseTeasers) {
    page.allPressReleaseTeasers.entities = releaseDateSorter(
      page.allPressReleaseTeasers,
      true,
      false,
    );
  }
  // Add our pager to page output.
  const pagingObject = paginatePages(page, files, field, template, aria);

  if (pagingObject[0]) {
    page.pagedItems = pagingObject[0].pagedItems;
    page.paginator = pagingObject[0].paginator;
  }
}

module.exports = {
  createHealthCareRegionListPages,
  createPastEventListPages,
  addGetUpdatesFields,
  addPager,
  compileEventListingPage,
};
