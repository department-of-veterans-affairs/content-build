const _ = require('lodash');
const moment = require('moment-timezone');

const deriveMostRecentDate = (
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

const filterPastEvents = data => {
  if (!data) return null;
  const currentTimestamp = new Date().getTime();
  return data.filter(event => {
    const mostRecentEvent = deriveMostRecentDate(
      event.fieldDatetimeRangeTimezone[0]
        ? event.fieldDatetimeRangeTimezone[0]
        : event.fieldDatetimeRangeTimezone,
    );
    return mostRecentEvent.value * 1000 < currentTimestamp;
  });
};

const filterUpcomingEvents = data => {
  if (!data) return null;
  const currentTimestamp = new Date().getTime();
  return data.filter(event => {
    const mostRecentEvent = deriveMostRecentDate(
      event.fieldDatetimeRangeTimezone,
    );
    return mostRecentEvent?.value * 1000 >= currentTimestamp;
  });
};

module.exports = {
  deriveMostRecentDate,
  filterPastEvents,
  filterUpcomingEvents,
};
