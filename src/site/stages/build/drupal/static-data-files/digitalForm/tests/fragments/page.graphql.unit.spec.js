/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import page from '../../fragments/page.graphql';

describe('page fragment', () => {
  it('includes the correct fields', () => {
    expect(page).to.have.string('fieldTitle');
    expect(page).to.have.string('fieldDigitalFormBodyText');
    expect(page).to.have.string('fieldDigitalFormComponents');
  });

  it('imports the textInput fragment', () => {
    expect(page).to.have.string('fragment textInput');
    expect(page).to.have.string('...textInput');
  });

  it('imports the textArea fragment', () => {
    expect(page).to.have.string('fragment textArea');
    expect(page).to.have.string('...textArea');
  });

  it('imports the date fragment', () => {
    expect(page).to.have.string('fragment date');
    expect(page).to.have.string('...date');
  });
});
