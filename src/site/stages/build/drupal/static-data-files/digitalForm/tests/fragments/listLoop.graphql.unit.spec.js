/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import listLoop from '../../fragments/listLoop.graphql';

describe('listLoop fragment', () => {
  it('includes the correct fields', () => {
    expect(listLoop).to.have.string('fieldTitle');
    expect(listLoop).to.have.string('fieldOptional');
    expect(listLoop).to.have.string('fieldSectionIntro');
    expect(listLoop).to.have.string('fieldItemNameLabel');
    expect(listLoop).to.have.string('fieldListLoopMaxItems');
    expect(listLoop).to.have.string('fieldListLoopNounPlural');
    expect(listLoop).to.have.string('fieldListLoopNounSingular');
    expect(listLoop).to.have.string('fieldDigitalFormPages');
  });

  it('imports the page fragment', () => {
    expect(listLoop).to.have.string('fragment page');
    expect(listLoop).to.have.string('...page');
  });
});
