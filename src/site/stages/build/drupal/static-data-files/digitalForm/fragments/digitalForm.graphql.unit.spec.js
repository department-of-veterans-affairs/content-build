/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import digitalForm from './digitalForm.graphql';

describe('digitalForm fragment', () => {
  it('includes form fields', () => {
    expect(digitalForm).to.have.string('nid');
    expect(digitalForm).to.have.string('entityLabel');
    expect(digitalForm).to.have.string('fieldVaFormNumber');
    expect(digitalForm).to.have.string('fieldChapters');
  });

  it('include OMB info', () => {
    expect(digitalForm).to.have.string('fieldOmbNumber');
    expect(digitalForm).to.have.string('fieldRespondentBurden');
    expect(digitalForm).to.have.string('fieldExpirationDate');
  });

  describe('chapter fragments', () => {
    it('imports the address fragment', () => {
      expect(digitalForm).to.have.string('fragment address');
      expect(digitalForm).to.have.string('...address');
    });

    it('imports the identificationInformation fragment', () => {
      expect(digitalForm).to.have.string('fragment identificationInformation');
      expect(digitalForm).to.have.string('...identificationInformation');
    });

    it('imports the nameAndDateOfBirth fragment', () => {
      expect(digitalForm).to.have.string('fragment nameAndDateOfBirth');
      expect(digitalForm).to.have.string('...nameAndDateOfBirth');
    });
  });
});
