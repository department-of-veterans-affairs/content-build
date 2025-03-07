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

  it('imports the textInput fragment', () => {
    expect(radioButton).to.have.string('fragment responseOption');
    expect(radioButton).to.have.string('...responseOption');
  });
});
