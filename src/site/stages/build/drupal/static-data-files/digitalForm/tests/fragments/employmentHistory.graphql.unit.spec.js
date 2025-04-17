/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import employmentHistory from '../../fragments/employmentHistory.graphql';

describe('employmentHistory fragment', () => {
  it('includes fieldTitle', () => {
    expect(employmentHistory).to.have.string('fieldTitle');
  });
});
