/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import { query, postProcess } from '../index';
import queryResult from './fixtures/queryResult.json';

describe('digitalForm', () => {
  describe('query', () => {
    it('returns digital_form entities', () => {
      expect(query).to.have.string('digital_form');
    });

    it('imports the digitalForm fragment', () => {
      expect(query).to.have.string('fragment digitalForm');
      expect(query).to.have.string('... digitalForm');
    });

    it('disables status filtering in non-prod environments', () => {
      expect(query).to.not.have.string('field: "status"');
    });
  });

  describe('postProcess', () => {
    it('imports postProcessDigitalForm', () => {
      expect(() => postProcess(queryResult)).to.not.throw();
    });
  });
});
