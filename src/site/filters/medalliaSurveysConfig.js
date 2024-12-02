const SURVEY_NUMBERS = {
  DEFAULT_STAGING_SURVEY: 11,
  DEFAULT_PROD_SURVEY: 17,
  SEARCH_PROD: 21,
  SEARCH_STAGING: 20,
  CONTACT_US_VIRTUAL_AGENT_PROD: 25,
  CONTACT_US_VIRTUAL_AGENT_STAGING: 26,
  SCHOOL_ADMINISTRATORS_PROD: 17,
  SCHOOL_ADMINISTRATORS_STAGING: 37,
  HEALTH_CARE_PROD: 17,
  HEALTH_CARE_STAGING: 41,
  AFTER_VISIT_SUMMARY_PROD: 56,
  AFTER_VISIT_SUMMARY_STAGING: 55,
};

const medalliaSurveys = {
  urls: {
    '/search': {
      production: SURVEY_NUMBERS.SEARCH_PROD,
      staging: SURVEY_NUMBERS.SEARCH_STAGING,
    },
    '/contact-us/virtual-agent': {
      production: SURVEY_NUMBERS.CONTACT_US_VIRTUAL_AGENT_PROD,
      staging: SURVEY_NUMBERS.CONTACT_US_VIRTUAL_AGENT_STAGING,
    },
    '/school-administrators': {
      production: SURVEY_NUMBERS.SCHOOL_ADMINISTRATORS_PROD,
      staging: SURVEY_NUMBERS.SCHOOL_ADMINISTRATORS_STAGING,
    },
  },
  urlsWithSubPaths: {
    '/health-care': {
      production: SURVEY_NUMBERS.HEALTH_CARE_PROD,
      staging: SURVEY_NUMBERS.HEALTH_CARE_STAGING,
    },
    '/my-health/medical-records/summaries-and-notes/visit-summary': {
      production: SURVEY_NUMBERS.AFTER_VISIT_SUMMARY_PROD,
      staging: SURVEY_NUMBERS.AFTER_VISIT_SUMMARY_STAGING,
    },
    '/resources': {
      production: SURVEY_NUMBERS.DEFAULT_PROD_SURVEY,
      staging: SURVEY_NUMBERS.DEFAULT_STAGING_SURVEY,
    },
  },
};

module.exports = { SURVEY_NUMBERS, medalliaSurveys };
