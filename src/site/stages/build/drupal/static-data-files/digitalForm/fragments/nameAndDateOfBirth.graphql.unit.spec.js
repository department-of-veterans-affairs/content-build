/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import nameAndDateOfBirth from './nameAndDateOfBirth.graphql';

describe('nameAndDateOfBirth fragment', () => {
  it('includes fieldTitle', () => {
    expect(nameAndDateOfBirth).to.have.string('fieldTitle');
  });

  it('includes fieldIncludeDateOfBirth', () => {
    expect(nameAndDateOfBirth).to.have.string('fieldIncludeDateOfBirth');
  });
});
