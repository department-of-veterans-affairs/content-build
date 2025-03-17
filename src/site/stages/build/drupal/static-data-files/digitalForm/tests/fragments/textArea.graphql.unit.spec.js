/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import textArea from '../../fragments/textArea.graphql';

describe('textArea fragment', () => {
  it('includes fieldDigitalFormLabel', () => {
    expect(textArea).to.have.string('fieldDigitalFormLabel');
  });

  it('includes fieldDigitalFormHintText', () => {
    expect(textArea).to.have.string('fieldDigitalFormHintText');
  });

  it('includes fieldDigitalFormRequired', () => {
    expect(textArea).to.have.string('fieldDigitalFormRequired');
  });
});
