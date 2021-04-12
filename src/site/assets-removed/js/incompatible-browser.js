/* eslint-disable no-unused-expressions */
function checkBrowserCompatibility() {
  const domReady = function(callback) {
    document.readyState === 'interactive' || document.readyState === 'complete'
      ? callback()
      : document.addEventListener('DOMContentLoaded', callback);
  };

  domReady(function() {
    // check whether browser is IE10 and older
    if (window.navigator.userAgent.indexOf('MSIE ') > 0) {
      const browserWarning = document.getElementsByClassName(
        'incompatible-browser-warning',
      )[0];

      if (browserWarning) {
        browserWarning.classList.add('visible');
      }
    }
  });
}

if (module) {
  module.exports = checkBrowserCompatibility;
}
