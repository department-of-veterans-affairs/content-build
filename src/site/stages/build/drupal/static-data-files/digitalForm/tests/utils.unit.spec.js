/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import { formatDate, stripPrefix } from '../utils';

describe('digitalForm utils', () => {
  describe('formatDate', () => {
    it('formats a date string', () => {
      const originalDate = '2025-12-23';
      const formattedDate = '12/23/2025';

      expect(formatDate(originalDate)).to.eq(formattedDate);
    });

    it('removes leading zeros', () => {
      const originalDate = '2020-02-09';
      const formattedDate = '2/9/2020';

      expect(formatDate(originalDate)).to.eq(formattedDate);
    });
  });

  describe('stripPrefix', () => {
    it('removes the "Digital Form" prefix', () => {
      const prefixedLabel = 'Digital Form: Address';

      expect(stripPrefix(prefixedLabel)).to.eq('Address');
    });

    it('does not alter string without the prefix', () => {
      const nonPrefixedLabel = 'Name of the form';

      expect(stripPrefix(nonPrefixedLabel)).to.eq(nonPrefixedLabel);
    });
  });
});
