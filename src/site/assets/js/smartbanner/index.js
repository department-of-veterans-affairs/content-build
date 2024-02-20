// Pulled from SmartBanner JS
// https://github.com/ain/smartbanner.js/blob/main/src/index.js

const SmartBanner = require('../smartbanner');

let smartbanner;

window.addEventListener('load', function() {
  smartbanner = new SmartBanner();

  if (smartbanner.apiEnabled) {
    window.smartbanner = smartbanner;
  } else {
    smartbanner.publish();
  }
});
