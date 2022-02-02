  
  if (window.KAMPYLE_ONSITE_SDK) {
    onsiteLoaded();
  } else {
    window.addEventListener('neb_OnsiteLoaded', onsiteLoaded);
  }

  function onsiteLoaded() {
    // load the form and store status (true/false) in neb_status
    var neb_status = KAMPYLE_ONSITE_SDK.loadForm(getSurveyNumber(window.location.pathname));
      if (neb_status === true) {
        console.log(`the form has loaded ${getSurveyNumber(window.location.pathname)} form`)
      // if form is loaded then decide what to do  
      // your code goes here
    }
  }

function getSurveyNumber(url) {
    let pathurl = trimSlash(url)

    if (vagovstagingsurveys[pathurl]) {
        console.log('returning in getSurveyNumberhelper: ', vagovstagingsurveys[pathurl]);
        return vagovstagingsurveys[pathurl];
    } else {
        console.log('not on /search. pathurl is: ', pathurl);
        return 11;
    }
}

const vagovstagingsurveys = {
    "/search": 20
}

function trimSlash(url) {
    if (url.charAt(url.length - 1) === '/') {
      console.log('trimmed slash')  
      return url.slice(0,url.length-1);
    } else {
        console.log('did not trim slash')
        return url;
    }
}
