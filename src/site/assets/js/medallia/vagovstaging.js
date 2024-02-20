(function () {
  if (window.KAMPYLE_ONSITE_SDK) {
      onsiteLoaded();
  } else {
      window.addEventListener('neb_OnsiteLoaded', onsiteLoaded);
  }
})()

function onsiteLoaded() {
  const surveyNumber = getSurveyNumber(window.location.pathname);
  var neb_status = KAMPYLE_ONSITE_SDK.loadForm(surveyNumber);
    if (neb_status === true) {
      console.log(`survey number ${surveyNumber} has loaded`)
  }
}
  
// const vagovstagingsurveys = {
//   "/search": 20,
//   "/contact-us/virtual-agent": 26
// }

// function getSurveyNumber (url) {
//     let pathUrl = trimSlash(url.toString())
//     return vagovstagingsurveys[pathUrl] ? vagovstagingsurveys[pathUrl] : 11;
// }

const medalliaSurveys = {
  "urls":  {
    "/search": {
      "production": 21,
      "staging": 20
    },
    "/contact-us/virtual-agent": {
      "production": 25,
      "staging": 26
    },
    "/school-administrators": {
      "production": 17,
      "staging": 37
    }
  },

  "urlsWithSubPaths": {
    "/health-care": {
      "production": 17,
      "staging": 41
    },
    "/my-health/medical-records/summaries-and-notes/visit-summary": {
      "production": 17,
      "staging": 41
    }   
  }
}

function getSurvey(buildtype, url) {
  const surveyData = medalliaSurveys;
  const defaultStagingSurvey = 11;
  const defaultProdSurvey = 17;
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
}

function trimSlash(url) {
    if (url.length === 0) return 
    return url.charAt(url.length - 1) === '/' ? url.slice(0, url.length - 1) : url;
}
