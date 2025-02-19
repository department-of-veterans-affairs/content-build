/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import { stripPrefix } from '../utils';

describe('digitalForm utils', () => {
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
