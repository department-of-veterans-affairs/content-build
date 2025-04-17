/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import textInput from '../../fragments/textInput.graphql';

describe('textInput fragment', () => {
  it('includes fieldDigitalFormLabel', () => {
    expect(textInput).to.have.string('fieldDigitalFormLabel');
  });

  it('includes fieldDigitalFormHintText', () => {
    expect(textInput).to.have.string('fieldDigitalFormHintText');
  });

  it('includes fieldDigitalFormRequired', () => {
    expect(textInput).to.have.string('fieldDigitalFormRequired');
  });

  it('includes fieldListLoopSummaryCard', () => {
    expect(textInput).to.have.string('fieldListLoopSummaryCard');
  });
});
