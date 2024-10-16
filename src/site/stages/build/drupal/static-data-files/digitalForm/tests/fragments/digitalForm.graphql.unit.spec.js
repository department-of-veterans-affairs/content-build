/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import digitalForm from '../../fragments/digitalForm.graphql';

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
    [
      'address',
      'identificationInformation',
      'nameAndDateOfBirth',
      'phoneAndEmail',
    ].forEach(fragment => {
      it(`imports the ${fragment} fragment`, () => {
        expect(digitalForm).to.have.string(`fragment ${fragment}`);
        expect(digitalForm).to.have.string(`...${fragment}`);
      });
    });
  });
});
