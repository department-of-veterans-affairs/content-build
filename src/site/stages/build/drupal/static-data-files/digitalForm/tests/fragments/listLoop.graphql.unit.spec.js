/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import listLoop from '../../fragments/listLoop.graphql';

describe('listLoop fragment', () => {
  it('includes fieldTitle', () => {
    expect(listLoop).to.have.string('fieldTitle');
  });

  it('includes fieldOptional', () => {
    expect(listLoop).to.have.string('fieldOptional');
  });
});
