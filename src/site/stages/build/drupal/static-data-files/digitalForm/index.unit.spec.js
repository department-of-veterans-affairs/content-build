/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import { query, postProcess } from './index';

describe('digitalForm', () => {
  describe('query', () => {
    it('returns digital_form entities', () => {
      expect(query).to.have.string('digital_form');
    });
    it('imports the digitalForm fragment', () => {
      expect(query).to.have.string('fragment digitalForm');
      expect(query).to.have.string('... digitalForm');
    });
  });

  describe('postProcess', () => {
    it('imports postProcessDigitalForm', () => {
      expect(() => postProcess('test result')).to.not.throw();
    });
  });
});
