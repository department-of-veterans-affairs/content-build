/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import identificationInformation from '../../fragments/identificationInformation.graphql';

describe('identificationInformation fragment', () => {
  it('includes fieldTitle', () => {
    expect(identificationInformation).to.have.string('fieldTitle');
  });
  it('includes fieldIncludeVeteranSService', () => {
    expect(identificationInformation).to.have.string(
      'fieldIncludeVeteranSService',
    );
  });
});
