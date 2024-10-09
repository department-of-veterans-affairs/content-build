/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import phoneAndEmail from '../../fragments/phoneAndEmail.graphql';

describe('phoneAndEmail fragment', () => {
  it('includes fieldTitle', () => {
    expect(phoneAndEmail).to.have.string('fieldTitle');
  });

  it('includes fieldIncludeEmail', () => {
    expect(phoneAndEmail).to.have.string('fieldIncludeEmail');
  });
});
