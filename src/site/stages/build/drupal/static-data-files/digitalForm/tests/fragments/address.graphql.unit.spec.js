/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import address from '../../fragments/address.graphql';

describe('address fragment', () => {
  it('includes fieldTitle', () => {
    expect(address).to.have.string('fieldTitle');
  });
  it('includes fieldMilitaryAddressCheckbox', () => {
    expect(address).to.have.string('fieldMilitaryAddressCheckbox');
  });
});
