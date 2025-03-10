/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import checkbox from '../../fragments/checkbox.graphql';

describe('checkbox fragment', () => {
  it('includes the correct fields', () => {
    expect(checkbox).to.have.string('fieldDigitalFormLabel');
    expect(checkbox).to.have.string('fieldDigitalFormHintText');
    expect(checkbox).to.have.string('fieldDigitalFormRequired');
    expect(checkbox).to.have.string('fieldDfResponseOptions');
  });

  it('imports the textInput fragment', () => {
    expect(checkbox).to.have.string('fragment responseOption');
    expect(checkbox).to.have.string('...responseOption');
  });
});
