# SmartBanner JS
- Github: https://github.com/ain/smartbanner.js
- NPM: https://www.npmjs.com/package/smartbanner.js

GNU General Public License information is in src/site/assets/js/smartbanner/LICENSE.md

## Overview
SmartBanner JS mimics the [iOS Safari mobile app promotional banners](https://developer.apple.com/documentation/webkit/promoting_apps_with_smart_app_banners) for non-Safari-iOS and Android browsers.

To avoid [Content Security Policy issues](https://github.com/department-of-veterans-affairs/va.gov-cms/issues/15318#issuecomment-1875753364) ([Postmortem](https://github.com/department-of-veterans-affairs/va.gov-team-sensitive/blob/master/Postmortems/2023/2023-12-05-smartbanner-errors.md)) in staging and production, the SmartBanner code is implemented directly in src/site/assets/js/smartbanner.

### Styles
SmartBanner JS styles are in src/site/sass/style.scss. 