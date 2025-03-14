/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import responseOption from '../../fragments/responseOption.graphql';

describe('responseOption fragment', () => {
  it('includes fieldDigitalFormLabel', () => {
    expect(responseOption).to.have.string('fieldDigitalFormLabel');
  });

  it('includes fieldDigitalFormDescription', () => {
    expect(responseOption).to.have.string('fieldDigitalFormDescription');
  });
});
