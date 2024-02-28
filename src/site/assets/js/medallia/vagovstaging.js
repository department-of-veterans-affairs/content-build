const { SURVEY_NUMBERS, medalliaSurveys } = require('../../../filters/medalliaSurveysConfig')

(function () {
  if (window.KAMPYLE_ONSITE_SDK) {
      onsiteLoaded();
  } else {
      window.addEventListener('neb_OnsiteLoaded', onsiteLoaded);
  }
})()

function onsiteLoaded() {
  const surveyNumber = getSurvey(window.dataLayer[1].environment, window.location.pathname);
  var neb_status = KAMPYLE_ONSITE_SDK.loadForm(surveyNumber);
    if (neb_status === true) {
      console.log(`survey number ${surveyNumber} has loaded`)
  }
}

// const medalliaSurveys = {
//   "urls":  {
//     "/search": {
//       "production": 21,
//       "staging": 20
//     },
//     "/contact-us/virtual-agent": {
//       "production": 25,
//       "staging": 26
//     },
//     "/school-administrators": {
//       "production": 17,
//       "staging": 37
//     }
//   },

//   "urlsWithSubPaths": {
//     "/health-care": {
//       "production": 17,
//       "staging": 41
//     },
//     "/my-health/medical-records/summaries-and-notes/visit-summary": {
//       "production": 17,
//       "staging": 41
//     }   
//   }
// }
// const SURVEY_NUMBERS = {
//   DEFAULT_STAGING_SURVEY: 11,
//   DEFAULT_PROD_SURVEY: 17,
//   SEARCH_PROD: 21,
//   SEARCH_STAGING: 20,
//   CONTACT_US_VIRTUAL_AGENT_PROD: 25,
//   CONTACT_US_VIRTUAL_AGENT_STAGING: 26,
//   SCHOOL_ADMINISTRATORS_PROD: 17,
//   SCHOOL_ADMINISTRATORS_STAGING: 37,
//   HEALTH_CARE_PROD: 17,
//   HEALTH_CARE_STAGING: 41,
//   VISIT_SUMMARY_PROD: 17,
//   VISIT_SUMMARY_STAGING: 41,
// };

// const medalliaSurveys = {
//   urls: {
//     '/search': {
//       production: SURVEY_NUMBERS.SEARCH_PROD,
//       staging: SURVEY_NUMBERS.SEARCH_STAGING,
//     },
//     '/contact-us/virtual-agent': {
//       production: SURVEY_NUMBERS.CONTACT_US_VIRTUAL_AGENT_PROD,
//       staging: SURVEY_NUMBERS.CONTACT_US_VIRTUAL_AGENT_STAGING,
//     },
//     '/school-administrators': {
//       production: SURVEY_NUMBERS.SCHOOL_ADMINISTRATORS_PROD,
//       staging: SURVEY_NUMBERS.SCHOOL_ADMINISTRATORS_STAGING,
//     },
//   },
//   urlsWithSubPaths: {
//     '/health-care': {
//       production: SURVEY_NUMBERS.HEALTH_CARE_PROD,
//       staging: SURVEY_NUMBERS.HEALTH_CARE_STAGING,
//     },
//     '/my-health/medical-records/summaries-and-notes/visit-summary': {
//       production: SURVEY_NUMBERS.VISIT_SUMMARY_PROD,
//       staging: SURVEY_NUMBERS.VISIT_SUMMARY_STAGING,
//     },
//   },
// };

function getSurvey(buildtype, url) {
  const surveyData = medalliaSurveys;
  const defaultStagingSurvey = SURVEY_NUMBERS.DEFAULT_STAGING_SURVEY;
  const defaultProdSurvey = SURVEY_NUMBERS.DEFAULT_PROD_SURVEY;
  const isStaging = ['localhost', 'vagovstaging', 'vagovdev'].includes(
    buildtype,
  );
  const effectiveBuildType = isStaging ? 'staging' : 'production';
  const pathUrl = trimSlash(url.toString())

  if (typeof pathUrl !== 'string' || pathUrl === null) {
    return isStaging ? defaultStagingSurvey : defaultProdSurvey;
  }
  if (pathUrl in surveyData.urls) {
    const surveyInfo = surveyData.urls[pathUrl];
    return (
      surveyInfo[effectiveBuildType] ||
      (isStaging ? defaultStagingSurvey : defaultProdSurvey)
    );
  }
  for (const [subpath, surveyInfo] of Object.entries(
    surveyData.urlsWithSubPaths,
  )) {
    if (pathUrl.startsWith(subpath)) {
      return (
        surveyInfo[effectiveBuildType] ||
        (isStaging ? defaultStagingSurvey : defaultProdSurvey)
      );
    }
  }
  return isStaging ? defaultStagingSurvey : defaultProdSurvey;
}

function trimSlash(url) {
    if (url.length === 0) return 
    return url.charAt(url.length - 1) === '/' ? url.slice(0, url.length - 1) : url;
}
