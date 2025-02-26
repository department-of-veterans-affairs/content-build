/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import customStep from '../../fragments/customStep.graphql';

describe('customStep fragment', () => {
  it('includes the correct fields', () => {
    expect(customStep).to.have.string('fieldTitle');
    expect(customStep).to.have.string('fieldDigitalFormPages');
  });

  it('imports the page fragment', () => {
    expect(customStep).to.have.string('fragment page');
    expect(customStep).to.have.string('...page');
  });
});
