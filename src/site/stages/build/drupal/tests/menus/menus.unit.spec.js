/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';

const {
  convertLinkToAbsolute,
  convertLinkToRelative,
  isMatchingVaGovHost,
  formatLink,
} = require('../../menus');

describe('menus.js link utilities', () => {
  const hostUrl = 'https://www.va.gov';

  describe('convertLinkToAbsolute', () => {
    it('should convert a relative path to an absolute URL', () => {
      expect(convertLinkToAbsolute(hostUrl, '/health-care/')).to.equal(
        'https://www.va.gov/health-care/',
      );
    });
    it('should handle absolute URLs', () => {
      expect(
        convertLinkToAbsolute(hostUrl, 'https://www.va.gov/health-care/'),
      ).to.equal('https://www.va.gov/health-care/');
    });
  });

  describe('convertLinkToRelative', () => {
    it('should return relative path unchanged', () => {
      expect(convertLinkToRelative('/health-care/')).to.equal('/health-care/');
    });
    it('should convert absolute va.gov URL to relative', () => {
      expect(convertLinkToRelative('https://www.va.gov/health-care/')).to.equal(
        '/health-care/',
      );
    });
    it('should convert absolute va.gov URL with search/hash', () => {
      expect(
        convertLinkToRelative(
          'https://www.va.gov/health-care/?foo=bar#section',
        ),
      ).to.equal('/health-care/?foo=bar#section');
    });
    it('should return invalid URL as is', () => {
      expect(convertLinkToRelative('not-a-url')).to.equal('not-a-url');
    });
  });

  describe('isMatchingVaGovHost', () => {
    it('should return true for www.va.gov URLs', () => {
      expect(isMatchingVaGovHost('https://www.va.gov/health-care/')).to.equal(
        true,
      );
    });
    it('should return false for other hosts', () => {
      expect(isMatchingVaGovHost('https://google.com/')).to.equal(false);
    });
    it('should return false for invalid URLs', () => {
      expect(isMatchingVaGovHost('not-a-url')).to.equal(false);
    });
  });

  describe('formatLink', () => {
    it('should convert va.gov absolute URL to relative if hostUrl is va.gov', () => {
      expect(
        formatLink('https://www.va.gov/health-care/', 'https://www.va.gov'),
      ).to.equal('/health-care/');
    });
    it('should return pathName as is if hostUrl is va.gov and not matching va.gov host', () => {
      expect(formatLink('/health-care/', 'https://www.va.gov')).to.equal(
        '/health-care/',
      );
    });
    it('should convert to absolute if hostUrl is not in relativeLinkHosts', () => {
      expect(formatLink('/health-care/', 'https://otherhost.com')).to.equal(
        'https://otherhost.com/health-care/',
      );
    });
  });
});
