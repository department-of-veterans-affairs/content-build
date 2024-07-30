/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import { query } from './index';

describe('digitalForm', () => {
  describe('query', () => {
    it('returns digital_form entities', () => {
      expect(query).to.have.string('digital_form');
    });
    it('imports the digitalForm fragment');
  });

  describe('postProcess', () => {
    it('imports postProcessDigitalForm');
  });
});
