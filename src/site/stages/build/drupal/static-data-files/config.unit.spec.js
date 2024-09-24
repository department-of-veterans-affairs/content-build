/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import { DATA_FILES } from './config';

describe('config', () => {
  describe('DATA_FILES', () => {
    it('includes Digital Forms', () => {
      expect(
        DATA_FILES.filter(dataFile => dataFile.description === 'Digital Forms')
          .length,
      ).to.eq(1);
    });
  });
});
