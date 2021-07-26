const { expect } = require('chai');

const isCMSUrl = require('../../helpers/isCMSUrl');

describe('isCMSUrl', () => {
  const cmsLinks = [
    'https://prod.cms.va.gov/node/27168',
    'https://prod.cms.va.gov/',
    'https://prod.cms.va.gov/locations/portland-va-clinic/homeless-veteran-care',
    'https://staging.cms.va.gov/node/27168',
    'https://staging.cms.va.gov/node/27168/edit',
    'https://prod.cms.va.gov/sites/default/files/2021-07/Jonathan-Atkinson_low-res-TEAMS.jpg',
  ];

  const nonCMSLinks = [
    'https://www.google.com',
    'https://www.va.gov/locations/portland-va-clinic',
    'https://www.va.gov/find-locations/facility/vha_589GV',
    'https://s3-us-gov-west-1.amazonaws.com/content.www.va.gov/img/styles/2_3_medium_thumbnail/public/2021-07/Jonathan-Atkinson_low-res-TEAMS.jpg',
  ];

  const buildOptions = {
    'drupal-address': 'https://prod.cms.va.gov',
    'drupal-user': '',
    'drupal-password': '',
    'drupal-max-parallel-requests': 15,
    buildtype: 'localhost',
  };

  for (const cmsLink of cmsLinks) {
    it(`returns true if link points to CMS - ${cmsLink}`, () => {
      const file = {
        isDrupalPage: true,
      };
      const result = isCMSUrl(cmsLink, file, buildOptions);
      expect(result).to.be.true;
    });
  }

  for (const nonCMSLink of nonCMSLinks) {
    it(`returns false if link does not point to CMS - ${nonCMSLink}`, () => {
      const file = {
        isDrupalPage: true,
      };
      const result = isCMSUrl(nonCMSLink, file, buildOptions);
      expect(result).to.be.false;
    });
  }

  it('returns false if not a Drupal Page', () => {
    const file = {
      isDrupalPage: false,
    };
    const result = isCMSUrl(cmsLinks[0], file, buildOptions);
    expect(result).to.be.false;
  });
});
