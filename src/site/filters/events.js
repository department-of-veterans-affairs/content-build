const _ = require('lodash');
const moment = require('moment-timezone');

const deriveMostRecentDate = (
  fieldDatetimeRangeTimezone,
  now = moment().unix(), // This is done so that we can mock the current time in tests.
) => {
  if (!fieldDatetimeRangeTimezone) return fieldDatetimeRangeTimezone;

  if (!_.isArray(fieldDatetimeRangeTimezone)) {
    return fieldDatetimeRangeTimezone;
  }

  if (fieldDatetimeRangeTimezone?.length === 1) {
    return fieldDatetimeRangeTimezone[0];
  }

  const dates = _.sortBy(fieldDatetimeRangeTimezone, 'endValue');
  const futureDates = _.filter(dates, date => date?.endValue - now > 0);

  if (_.isEmpty(futureDates)) {
    return dates[dates?.length - 1];
  }

  return futureDates[0];
};

const filterUpcomingEvents = data => {
  if (!data) return null;

  const currentTimestamp = new Date().getTime();

  return data.filter?.(event => {
    const mostRecentEvent = deriveMostRecentDate(
      event.fieldDatetimeRangeTimezone,
    );

    return mostRecentEvent?.value * 1000 >= currentTimestamp;
  });
};

module.exports = {
  deriveMostRecentDate,
  filterUpcomingEvents,
};
