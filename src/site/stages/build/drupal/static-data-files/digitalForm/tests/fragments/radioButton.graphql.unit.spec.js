/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import radioButton from '../../fragments/radioButton.graphql';

describe('radioButton fragment', () => {
  it('includes the correct fields', () => {
    expect(radioButton).to.have.string('fieldDigitalFormLabel');
    expect(radioButton).to.have.string('fieldDigitalFormHintText');
    expect(radioButton).to.have.string('fieldDigitalFormRequired');
    expect(radioButton).to.have.string('fieldDfResponseOptions');
  });

  it('calls the responseOption fragment', () => {
    expect(radioButton).to.have.string('...responseOption');
  });
});
