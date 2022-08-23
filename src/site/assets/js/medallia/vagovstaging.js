  
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
  
const vagovstagingsurveys = {
  "/search": 20,
  "/contact-us/virtual-agent": 24
}

function getSurveyNumber (url) {
    let pathUrl = trimSlash(url.toString())
    return vagovstagingsurveys[pathUrl] ? vagovstagingsurveys[pathUrl] : 11;
}

function trimSlash(url) {
    if (url.length === 0) return 
    return url.charAt(url.length - 1) === '/' ? url.slice(0, url.length - 1) : url;
}
