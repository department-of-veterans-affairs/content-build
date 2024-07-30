/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import digitalForm from './digitalForm.graphql';

describe('digitalForm fragment', () => {
  it('includes form fields', () => {
    expect(digitalForm).to.have.string('nid');
    expect(digitalForm).to.have.string('entityLabel');
    expect(digitalForm).to.have.string('fieldVaFormNumber');
    expect(digitalForm).to.have.string('fieldOmbNumber');
    expect(digitalForm).to.have.string('fieldChapters');
  });

  describe('chapter fragments', () => {
    it('imports the nameAndDateOfBirth fragment');
  });
});
